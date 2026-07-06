import { useEffect, useState } from "react";
import { History, Trash2, X } from "lucide-react";
import { loadHistory, clearHistory, type GameRecord } from "@/lib/game-history";

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}m ${rs.toString().padStart(2, "0")}s`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GameHistoryPanel() {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<GameRecord[]>([]);

  useEffect(() => {
    if (open) setGames(loadHistory());
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur tap-feedback hover:text-foreground"
        aria-label="Game history"
      >
        <History className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-3xl border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold">Recent games</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { clearHistory(); setGames([]); }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                  aria-label="Clear history"
                  disabled={games.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: "60vh" }}>
              {games.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                  No finished games yet. Play a round to see it here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {games.map((g) => {
                    const winnerName = g.winner ? g.players[g.winner] : "Draw";
                    return (
                      <li
                        key={g.id}
                        className="rounded-xl border border-border bg-secondary/40 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            {g.timeControlName}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {fmtDate(g.playedAt)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="text-sm font-semibold">
                            {g.players.one} <span className="text-muted-foreground">vs</span> {g.players.two}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Winner: <span className="text-foreground">{winnerName}</span></span>
                          <span>{fmtDuration(g.durationMs)} · {g.moves.one + g.moves.two} moves</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
