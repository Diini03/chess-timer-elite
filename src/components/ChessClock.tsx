import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Settings2, Check, Volume2, VolumeX, Home, Keyboard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useSound } from "@/hooks/use-sound";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";
import { GameHistoryPanel } from "@/components/GameHistoryPanel";
import { saveGame } from "@/lib/game-history";
import { cn } from "@/lib/utils";
import { useChessClock } from "@/hooks/use-chess-clock";
import { PlayerPanel } from "@/components/PlayerPanel";
import { TIME_CONTROLS, DEFAULT_TIME_CONTROL } from "@/lib/time-controls";
import type { TimeControl } from "@/lib/time-controls";

const NAMES_STORAGE_KEY = "tempo:player-names";

interface ChessClockProps {
  initialTimeControlId?: string;
}

export function ChessClock({ initialTimeControlId }: ChessClockProps = {}) {
  const initial =
    (initialTimeControlId && TIME_CONTROLS.find((t) => t.id === initialTimeControlId)) ||
    DEFAULT_TIME_CONTROL;
  const clock = useChessClock(initial);

  const sound = useSound();
  const [names, setNames] = useState({ one: "Player 1", two: "Player 2" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const keyboardButtonRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard shortcuts:
  //  Space  → pause/resume (when focus is NOT on a player panel — the panel
  //           button handles Space itself to end its own turn).
  //  ↑ / ↓ → move focus between the two player panels.
  //  ← / → → move focus into / across the center capsule toolbar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

      const inToolbar = !!t?.closest?.('[role="toolbar"]');
      const onPanel = t?.id === "player-panel-one" || t?.id === "player-panel-two";

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        setShortcutsOpen(false);
      }

      if (e.code === "Space" && !onPanel && !inToolbar) {
        e.preventDefault();
        if (status === "running") pause();
        else if (status === "paused") resume();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        document.getElementById("player-panel-two")?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        document.getElementById("player-panel-one")?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (!inToolbar) {
          // Jump into the capsule from a player panel.
          if (onPanel) {
            e.preventDefault();
            const toolbar = document.querySelector<HTMLElement>('[role="toolbar"]');
            toolbar?.querySelector<HTMLElement>("button, a")?.focus();
          }
          return;
        }
        e.preventDefault();
        const toolbar = t!.closest('[role="toolbar"]') as HTMLElement;
        const items = Array.from(
          toolbar.querySelectorAll<HTMLElement>("button, a"),
        );
        const idx = items.indexOf(t as HTMLElement);
        const nextIdx =
          e.key === "ArrowRight"
            ? (idx + 1) % items.length
            : (idx - 1 + items.length) % items.length;
        items[nextIdx]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, pause, resume]);

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

  // Low-time warning beeps at 10s and timeout.
  const warnedRef = useRef<Record<"one" | "two", boolean>>({ one: false, two: false });
  useEffect(() => {
    (["one", "two"] as const).forEach((p) => {
      const ms = remaining[p];
      if (ms <= 10_000 && ms > 0 && !warnedRef.current[p]) {
        warnedRef.current[p] = true;
        sound.lowTime();
      }
      if (ms > 10_000 && warnedRef.current[p]) warnedRef.current[p] = false;
    });
  }, [remaining, sound]);

  useEffect(() => {
    if (status === "finished") sound.timeout();
  }, [status, sound]);

  // Persist finished games to history.
  const savedRef = useRef<string | null>(null);
  useEffect(() => {
    if (status !== "finished" || !winner) return;
    const key = `${timeControl.id}-${moves.one}-${moves.two}-${winner}`;
    if (savedRef.current === key) return;
    savedRef.current = key;
    const total = timeControl.baseSeconds * 1000 * 2;
    const durationMs = total - (remaining.one + remaining.two);
    saveGame({
      timeControlId: timeControl.id,
      timeControlName: timeControl.name,
      players: names,
      moves,
      winner,
      durationMs,
    });
  }, [status, winner, timeControl, moves, remaining, names]);

  // Keep the phone awake while a game is running.
  useWakeLock(status === "running");

  return (
    <main className="grain fixed inset-0 flex flex-col bg-background overflow-hidden">
      <ShortcutsHelp
        open={shortcutsOpen}
        onClose={() => {
          setShortcutsOpen(false);
          keyboardButtonRef.current?.focus();
        }}
      />
      <GameHistoryPanel />
      {/* Top player (rotated for opposite side) */}
      <PlayerPanel
        player="two"
        name={names.two}
        onNameChange={(n) => setNames((s) => ({ ...s, two: n }))}
        remainingMs={remaining.two}
        totalMs={timeControl.baseSeconds * 1000}
        isActive={activePlayer === "two"}
        status={status}
        isLoser={winner === "one"}
        moves={moves.two}
        rotated
        id="player-panel-two"
        onTap={() => { sound.click(); switchTurn("two"); }}
      />

      {/* Center control bar — v2.0 instrument rail */}
      <div className="relative z-20 flex h-[4.5rem] shrink-0 items-stretch border-y border-border bg-card">
        <div
          role="toolbar"
          aria-label="Clock controls"
          className="flex w-full items-stretch divide-x divide-border/70"
        >
          <Link
            to="/"
            className="flex w-14 items-center justify-center text-muted-foreground tap-feedback hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label="Back to home"
          >
            <Home aria-hidden className="h-4 w-4" />
          </Link>
          <button
            onClick={handleReset}
            className={cn(
              "flex w-14 items-center justify-center tap-feedback text-muted-foreground",
              "hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              confirmReset && "bg-destructive text-destructive-foreground",
            )}
            aria-label={confirmReset ? "Confirm reset game" : "Reset game"}
          >
            {confirmReset ? <Check aria-hidden className="h-4 w-4" /> : <RotateCcw aria-hidden className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 px-3 text-muted-foreground tap-feedback hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={`Change time control. Current: ${timeControl.name}`}
          >
            <Settings2 aria-hidden className="h-3.5 w-3.5" />
            <span aria-hidden className="eyebrow text-foreground">{timeControl.name}</span>
          </button>

          <button
            onClick={handleCenter}
            className={cn(
              "relative flex w-20 items-center justify-center tap-feedback",
              "bg-primary text-primary-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            )}
            aria-label={
              status === "running"
                ? "Pause game"
                : status === "paused"
                  ? "Resume game"
                  : status === "finished"
                    ? "Start new game"
                    : "Open time control settings"
            }
          >
            {status === "running"
              ? <Pause aria-hidden className="h-5 w-5" fill="currentColor" />
              : <Play aria-hidden className="h-5 w-5 ml-0.5" fill="currentColor" />}
          </button>

          <button
            onClick={sound.toggle}
            className="flex w-14 items-center justify-center text-muted-foreground tap-feedback hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={sound.enabled ? "Mute sounds" : "Unmute sounds"}
            aria-pressed={sound.enabled}
          >
            {sound.enabled ? <Volume2 aria-hidden className="h-4 w-4" /> : <VolumeX aria-hidden className="h-4 w-4" />}
          </button>

          <button
            ref={keyboardButtonRef}
            onClick={() => setShortcutsOpen((v) => !v)}
            className="flex w-14 items-center justify-center text-muted-foreground tap-feedback hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            aria-label={shortcutsOpen ? "Hide keyboard shortcuts" : "Show keyboard shortcuts"}
            aria-pressed={shortcutsOpen}
            aria-haspopup="dialog"
            aria-keyshortcuts="?"
          >
            <Keyboard aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom player */}
      <PlayerPanel
        player="one"
        name={names.one}
        onNameChange={(n) => setNames((s) => ({ ...s, one: n }))}
        remainingMs={remaining.one}
        totalMs={timeControl.baseSeconds * 1000}
        isActive={activePlayer === "one"}
        status={status}
        isLoser={winner === "two"}
        moves={moves.one}
        id="player-panel-one"
        onTap={() => { sound.click(); switchTurn("one"); }}
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
