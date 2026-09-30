import { Chess } from "chess.js";

export type MoveFinding = {
  ply: number;
  moveNumber: number;
  side: "White" | "Black";
  played: string;
  best: string;
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
  worker.onmessage = (e) => listener?.(String(e.data));
  const send = (cmd: string) => worker.postMessage(cmd);
  const waitFor = (pred: (l: string) => boolean, onLine?: (l: string) => void) =>
    new Promise<string>((resolve) => {
      listener = (l) => {
        onLine?.(l);
        if (pred(l)) resolve(l);
      };
    });
  return { worker, send, waitFor };
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
    eng.send("uci");
    await eng.waitFor((l) => l === "uciok");
    eng.send("isready");
    await eng.waitFor((l) => l === "readyok");

    const evals: number[] = [];
    const bests: string[] = [];
    for (let i = 0; i < fens.length; i++) {
      const fen = fens[i];
      const probe = new Chess(fen);
      if (probe.isGameOver()) {
        evals.push(probe.isCheckmate() ? (probe.turn() === "w" ? -MATE : MATE) : 0);
        bests.push("");
      } else {
        let score = 0;
        eng.send(`position fen ${fen}`);
        eng.send(`go depth ${depth}`);
        const bestLine = await eng.waitFor(
          (l) => l.startsWith("bestmove"),
          (l) => {
            const m = l.match(/score (cp|mate) (-?\d+)/);
            if (m) score = m[1] === "cp" ? Number(m[2]) : Math.sign(Number(m[2])) * MATE;
          },
        );
        // Engine scores are side-to-move; convert to White's perspective.
        evals.push(probe.turn() === "w" ? score : -score);
        const uci = bestLine.split(" ")[1] ?? "";
        let san = uci;
        try {
          san = probe.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san;
        } catch { /* keep uci */ }
        bests.push(san);
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
      ...findings.map(
        (f) =>
          `${f.label}: move ${f.moveNumber}${f.side === "White" ? "." : "..."} ${f.played} (${f.side}), engine preferred ${f.best}; eval ${fmt(f.evalBefore)} -> ${fmt(f.evalAfter)}, loss ${f.loss} cp.`,
      ),
    ].join("\n");
    return { moves: verbose.length, findings, finalEval, summary };
  } finally {
    eng.worker.terminate();
  }
}
