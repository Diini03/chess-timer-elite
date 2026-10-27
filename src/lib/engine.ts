import { Chess } from "chess.js";

export type MoveFinding = {
  ply: number;
  moveNumber: number;
  side: "White" | "Black";
  played: string;
  best: string;
  position: string; // FEN before the played move
  continuation: string[]; // legal SAN moves from the engine's principal variation
  loss: number; // centipawns lost for the mover
  evalBefore: number; // white-perspective centipawns
  evalAfter: number;
  label: "Blunder" | "Mistake" | "Inaccuracy";
};

export type EngineReport = { moves: number; findings: MoveFinding[]; finalEval: number; summary: string };

const MATE = 10000;

/** Parse PGN or a bare move list. Returns null when it isn't a legal game. */
export function parseGame(text: string): Chess | null {
  const chess = new Chess();
  try {
    chess.loadPgn(text.trim(), { strict: false });
    return chess.history().length ? chess : null;
  } catch {
    return null;
  }
}

function createEngine() {
  const worker = new Worker("/engine/stockfish.js");
  let listener: ((line: string) => void) | null = null;
  let rejectPending: ((error: Error) => void) | null = null;
  let failure: Error | null = null;
  worker.onmessage = (e) => String(e.data).split(/\r?\n/).forEach((line) => listener?.(line.trim()));
  worker.onerror = () => {
    failure = new Error("Stockfish failed to load. Please try again.");
    rejectPending?.(failure);
  };
  worker.onmessageerror = () => rejectPending?.(new Error("Stockfish returned an unreadable response."));
  const send = (cmd: string) => worker.postMessage(cmd);
  const waitFor = (pred: (l: string) => boolean, onLine?: (l: string) => void) =>
    new Promise<string>((resolve, reject) => {
      if (failure) { reject(failure); return; }
      const timeout = setTimeout(() => fail(new Error("Stockfish took too long to respond. Please try again.")), 60000);
      const cleanup = () => { clearTimeout(timeout); listener = null; rejectPending = null; };
      const fail = (error: Error) => { cleanup(); reject(error); };
      rejectPending = fail;
      listener = (l) => {
        onLine?.(l);
        if (pred(l)) { cleanup(); resolve(l); }
      };
    });
  return { worker, send, waitFor };
}

export function principalVariation(fen: string, uciMoves: string[]): string[] {
  const position = new Chess(fen);
  const moves: string[] = [];
  for (const uci of uciMoves.slice(0, 6)) {
    try {
      moves.push(position.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san);
    } catch { break; }
  }
  return moves;
}

/** Evaluate every position with Stockfish and flag moves that lose ground. */
export async function analyzeWithEngine(
  chess: Chess,
  depth = 12,
  onProgress?: (done: number, total: number) => void,
): Promise<EngineReport> {
  const verbose = chess.history({ verbose: true });
  const fens = [verbose[0]?.before ?? new Chess().fen(), ...verbose.map((m) => m.after)];
  const eng = createEngine();
  try {
    const initialized = eng.waitFor((l) => l === "uciok");
    eng.send("uci");
    await initialized;
    eng.send("setoption name Hash value 32");
    eng.send("ucinewgame");
    const ready = eng.waitFor((l) => l === "readyok");
    eng.send("isready");
    await ready;

    const evals: number[] = [];
    const bests: string[] = [];
    const variations: string[][] = [];
    for (let i = 0; i < fens.length; i++) {
      const fen = fens[i];
      const probe = new Chess(fen);
      if (probe.isGameOver()) {
        evals.push(probe.isCheckmate() ? (probe.turn() === "w" ? -MATE : MATE) : 0);
        bests.push("");
        variations.push([]);
      } else {
        let score: number | undefined;
        let pv: string[] = [];
        eng.send(`position fen ${fen}`);
        const search = eng.waitFor(
          (l) => l.startsWith("bestmove"),
          (l) => {
            const m = l.match(/score (cp|mate) (-?\d+)/);
            if (m && !/\b(lowerbound|upperbound)\b/.test(l)) {
              score = m[1] === "cp" ? Number(m[2]) : Math.sign(Number(m[2])) * MATE;
              pv = l.split(" pv ")[1]?.trim().split(/\s+/) ?? [];
            }
          },
        );
        eng.send(`go depth ${depth}`);
        const bestLine = await search;
        if (score === undefined) throw new Error("Stockfish did not return an evaluation.");
        // Engine scores are side-to-move; convert to White's perspective.
        evals.push(probe.turn() === "w" ? score : -score);
        const uci = bestLine.split(" ")[1] ?? "";
        let san = uci;
        try {
          san = probe.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san;
        } catch { /* keep uci */ }
        bests.push(san);
        variations.push(principalVariation(fen, pv));
      }
      onProgress?.(i + 1, fens.length);
    }

    const clamp = (v: number) => Math.max(-1500, Math.min(1500, v));
    const findings: MoveFinding[] = [];
    verbose.forEach((m, i) => {
      const white = m.color === "w";
      const before = evals[i];
      const after = evals[i + 1];
      const loss = white ? clamp(before) - clamp(after) : clamp(after) - clamp(before);
      if (loss < 60 || bests[i] === m.san) return;
      findings.push({
        ply: i + 1,
        moveNumber: Math.floor(i / 2) + 1,
        side: white ? "White" : "Black",
        played: m.san,
        best: bests[i],
        position: fens[i],
        continuation: variations[i],
        loss: Math.round(loss),
        evalBefore: before,
        evalAfter: after,
        label: loss >= 250 ? "Blunder" : loss >= 120 ? "Mistake" : "Inaccuracy",
      });
    });

    const fmt = (v: number) => (Math.abs(v) >= MATE ? (v > 0 ? "White mates" : "Black mates") : (v / 100).toFixed(2));
    const finalEval = evals[evals.length - 1] ?? 0;
    const summary = [
      `Engine: Stockfish depth ${depth}. Plies analysed: ${verbose.length}. Final evaluation (White POV): ${fmt(finalEval)}.`,
      ...[...findings].sort((a, b) => b.loss - a.loss).map(
        (f) =>
          `${f.label}: move ${f.moveNumber}${f.side === "White" ? "." : "..."} ${f.played} (${f.side}), engine preferred ${f.best}; eval ${fmt(f.evalBefore)} -> ${fmt(f.evalAfter)}, loss ${f.loss} cp. Position before move: ${f.position}. Engine continuation: ${f.continuation.join(" ")}.`,
      ),
    ].join("\n");
    return { moves: verbose.length, findings, finalEval, summary };
  } finally {
    eng.worker.terminate();
  }
}
