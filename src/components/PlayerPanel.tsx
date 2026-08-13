import { memo, useState } from "react";
import { formatTime } from "@/hooks/use-chess-clock";
import type { PlayerId, GameStatus } from "@/hooks/use-chess-clock";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface PlayerPanelProps {
  player: PlayerId;
  name: string;
  onNameChange: (name: string) => void;
  remainingMs: number;
  totalMs?: number;
  isActive: boolean;
  status: GameStatus;
  isLoser: boolean;
  moves?: number;
  rotated?: boolean;
  onTap: () => void;
  id?: string;
}

export const PlayerPanel = memo(function PlayerPanel({
  player,
  name,
  onNameChange,
  remainingMs,
  totalMs,
  isActive,
  status,
  isLoser,
  moves = 0,
  rotated,
  onTap,
  id,
}: PlayerPanelProps) {
  const { main, deci, danger } = formatTime(remainingMs);
  const [editing, setEditing] = useState(false);
  const [tapKey, setTapKey] = useState(0);

  const dim = !isActive && (status === "running" || status === "paused");
  const tone = player === "one" ? "player-one" : "player-two";
  const pct = totalMs && totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 1;

  const handleTap = () => {
    if (editing) return;
    setTapKey((k) => k + 1);
    onTap();
  };

  const statusLabel = isLoser
    ? "Flag fell"
    : status === "idle"
      ? "Tap to start"
      : isActive
        ? status === "paused" ? "Paused" : "Your move"
        : "Waiting";

  const seconds = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const spokenTime = `${mins} minute${mins === 1 ? "" : "s"} ${secs} second${secs === 1 ? "" : "s"}`;

  return (
    <div
      className={cn(
        "relative flex w-full flex-1 select-none p-3",
        rotated && "rotate-180",
      )}
    >
      {/* Card frame */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-3 rounded-[2rem] border transition-all duration-300",
          isActive && status !== "finished"
            ? "border-transparent"
            : "border-border bg-card/40",
          dim && "opacity-60",
        )}
        style={
          isActive && status !== "finished"
            ? {
                borderColor: `color-mix(in oklab, var(--${tone}) 70%, transparent)`,
                background: `linear-gradient(${player === "one" ? "0deg" : "180deg"}, color-mix(in oklab, var(--${tone}) 18%, transparent), transparent 70%)`,
                boxShadow: `0 0 0 1px color-mix(in oklab, var(--${tone}) 45%, transparent), 0 24px 70px -30px var(--${tone})`,
              }
            : undefined
        }
      />

      {/* Full-area tap surface */}
      <button
        type="button"
        id={id}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTap();
          }
        }}
        disabled={status === "finished"}
        aria-keyshortcuts="Enter Space"
        aria-label={`${name}. ${spokenTime} remaining. ${statusLabel}. ${status === "finished" ? "" : "Press Enter or Space to end your turn."}`}
        aria-pressed={isActive}
        className={cn(
          "absolute inset-3 z-0 rounded-[2rem] outline-none transition-colors duration-300",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset",
          isLoser && "bg-destructive/10",
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
      />

      {/* Header row: name chip + moves */}
      <div className="pointer-events-none absolute inset-x-8 top-8 z-20 flex items-start justify-between gap-3">
        <div className="pointer-events-auto">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value.slice(0, 20))}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              className="w-40 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium outline-none focus:border-ring"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${name} name`}
              className={cn(
                "group flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 text-left backdrop-blur",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: `var(--${tone})` }}
                aria-hidden
              />
              <span className="text-sm font-semibold tracking-wide text-foreground">{name}</span>
              <Pencil aria-hidden className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div
          className="rounded-full border border-border bg-card/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur"
          aria-label={`${moves} moves played`}
        >
          <span aria-hidden>{moves.toString().padStart(2, "0")} moves</span>
        </div>
      </div>

      {/* Timer */}
      <div
        key={tapKey}
        role="timer"
        aria-live={isActive && status === "running" ? "off" : "polite"}
        aria-atomic="true"
        aria-label={`${spokenTime} remaining`}
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
          "timer-digits font-semibold animate-tap-burst tabular-nums",
          isLoser && "text-destructive",
          !isLoser && danger && "text-[color:var(--danger)]",
          !isLoser && !danger && isActive && `text-[color:var(--${tone})]`,
          !isLoser && !danger && !isActive && "text-foreground",
          dim && "opacity-70",
        )}
        style={{ fontSize: "clamp(3.5rem, 16vw, 8rem)", lineHeight: 1 }}
      >
        <span aria-hidden>{main}</span>
        {deci && <span aria-hidden style={{ fontSize: "0.5em" }} className="opacity-90">{deci}</span>}
      </div>

      {/* Footer: status pill + time-remaining bar */}
      <div className="pointer-events-none absolute inset-x-8 bottom-8 z-10 flex flex-col items-center gap-3">
        <div
          className={cn(
            "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors",
            isActive && status !== "finished" ? "text-foreground" : "text-muted-foreground",
          )}
          aria-hidden
        >
          {statusLabel}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border/70" aria-hidden>
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-linear"
            style={{
              width: `${pct * 100}%`,
              background: isLoser || danger ? "var(--danger)" : `var(--${tone})`,
              boxShadow: isActive ? `0 0 14px 1px var(--${tone})` : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
});
