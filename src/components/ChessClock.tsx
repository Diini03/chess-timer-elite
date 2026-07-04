import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChessClock } from "@/hooks/use-chess-clock";
import { PlayerPanel } from "@/components/PlayerPanel";
import { TIME_CONTROLS, DEFAULT_TIME_CONTROL } from "@/lib/time-controls";
import type { TimeControl } from "@/lib/time-controls";

const NAMES_STORAGE_KEY = "tempo:player-names";

export function ChessClock() {
  const clock = useChessClock(DEFAULT_TIME_CONTROL);
  const [names, setNames] = useState({ one: "Player 1", two: "Player 2" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Load persisted names on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NAMES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.one === "string" && typeof parsed.two === "string") {
          setNames(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Persist names on change.
  useEffect(() => {
    try {
      localStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(names));
    } catch { /* ignore */ }
  }, [names]);

  const { status, activePlayer, remaining, winner, timeControl, moves, switchTurn, pause, resume, reset, setTimeControl } = clock;

  // Keyboard shortcuts: Space = pause/resume, R = reset (double-press pattern).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") pause();
        else if (status === "paused") resume();
      } else if (e.key === "ArrowDown") {
        switchTurn("one");
      } else if (e.key === "ArrowUp") {
        switchTurn("two");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, pause, resume, switchTurn]);

  const handleReset = () => {
    if (status === "idle") return;
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 2000);
      return;
    }
    reset();
    setConfirmReset(false);
  };

  const handleCenter = () => {
    if (status === "running") pause();
    else if (status === "paused") resume();
    else if (status === "finished") reset();
    else setSettingsOpen(true);
  };

  const pickControl = (tc: TimeControl) => {
    setTimeControl(tc);
    setSettingsOpen(false);
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-background overflow-hidden">
      {/* Top player */}
      <PlayerPanel
        player="two"
        name={names.two}
        onNameChange={(n) => setNames((s) => ({ ...s, two: n }))}
        remainingMs={remaining.two}
        isActive={activePlayer === "two"}
        status={status}
        isLoser={winner === "one"}
        rotated
        onTap={() => switchTurn("two")}
      />

      {/* Center control bar */}
      <div className="relative z-20 flex h-20 shrink-0 items-center justify-between border-y border-border bg-card/60 px-4 backdrop-blur">
        <button
          onClick={handleReset}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full tap-feedback",
            "bg-secondary text-secondary-foreground border border-border",
            confirmReset && "bg-destructive text-destructive-foreground border-destructive",
          )}
          aria-label="Reset"
        >
          {confirmReset ? <Check className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
        </button>

        <button
          onClick={handleCenter}
          className={cn(
            "relative flex h-16 w-16 items-center justify-center rounded-full tap-feedback",
            "bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)]",
            "border-4 border-background",
          )}
          aria-label={status === "running" ? "Pause" : "Resume"}
        >
          {status === "running" && (
            <span className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />
          )}
          {status === "running"
            ? <Pause className="h-6 w-6" fill="currentColor" />
            : status === "paused"
              ? <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
              : <Settings2 className="h-6 w-6" />}
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {timeControl.name}
        </div>
      </div>

      {/* Bottom player */}
      <PlayerPanel
        player="one"
        name={names.one}
        onNameChange={(n) => setNames((s) => ({ ...s, one: n }))}
        remainingMs={remaining.one}
        isActive={activePlayer === "one"}
        status={status}
        isLoser={winner === "two"}
        onTap={() => switchTurn("one")}
      />

      {/* Settings sheet */}
      {settingsOpen && (
        <div
          className="absolute inset-0 z-30 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Time control</h2>
              <button onClick={() => setSettingsOpen(false)} className="text-sm text-muted-foreground">
                Done
              </button>
            </div>
            <p className="mb-5 text-xs text-muted-foreground">Choosing a preset resets the game.</p>

            {(["bullet", "blitz", "rapid", "classical"] as const).map((cat) => (
              <div key={cat} className="mb-4 last:mb-0">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {cat}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_CONTROLS.filter((t) => t.category === cat).map((tc) => (
                    <button
                      key={tc.id}
                      onClick={() => pickControl(tc)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-sm font-medium tap-feedback",
                        tc.id === timeControl.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-secondary-foreground",
                      )}
                    >
                      {tc.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
