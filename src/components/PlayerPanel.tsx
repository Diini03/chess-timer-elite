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
        "relative flex w-full flex-1 select-none items-center justify-center overflow-hidden",
        rotated && "rotate-180",
      )}
    >
      {/* Plate */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-300",
          isActive && status !== "finished" ? "bg-card" : "bg-background",
          dim && "opacity-70",
          isLoser && "bg-destructive/10",
        )}
      />

      {/* Active edge accent, always on the rail-facing side */}
      {isActive && status !== "finished" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-1"
          style={{
            top: player === "one" ? 0 : "auto",
            bottom: player === "one" ? "auto" : 0,
            background: `var(--${tone})`,
            boxShadow: `0 0 15px color-mix(in oklab, var(--${tone}) 45%, transparent)`,
          }}
        />
      )}

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
          "absolute inset-0 z-0 outline-none",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset",
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
      />

      {/* Centered instrument stack */}
      <div
        key={tapKey}
        className="pointer-events-none relative z-10 flex animate-tap-burst flex-col items-center px-8"
      >
        <span
          className={cn(
            "eyebrow mb-4",
            isActive && status !== "finished"
              ? `text-[color:var(--${tone})]`
              : "text-muted-foreground",
          )}
          aria-hidden
        >
          {statusLabel}
        </span>

        <div
          role="timer"
          aria-live={isActive && status === "running" ? "off" : "polite"}
          aria-atomic="true"
          aria-label={`${spokenTime} remaining`}
          className={cn(
            "timer-digits flex items-baseline font-medium tabular-nums tracking-tighter",
            isLoser && "text-destructive",
            !isLoser && danger && "text-[color:var(--danger)]",
            !isLoser && !danger && "text-foreground",
            !isLoser && !danger && !isActive && status !== "idle" && "text-muted-foreground",
          )}
          style={{ fontSize: "clamp(3.25rem, 16vw, 7.5rem)", lineHeight: 1 }}
        >
          <span aria-hidden>{main}</span>
          {deci && <span aria-hidden style={{ fontSize: "0.42em" }} className="opacity-80">{deci}</span>}
        </div>

        {/* Name — serif italic signature */}
        <div className="pointer-events-auto mt-4 flex min-h-11 items-center gap-2">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value.slice(0, 20))}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              className="w-44 rounded-sm border border-border bg-card px-2 py-1 text-center text-sm outline-none focus:border-ring"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${name} name`}
              className="group flex min-h-11 items-center gap-2 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "font-display text-2xl italic leading-none",
                  isActive && status !== "finished"
                    ? `text-[color:var(--${tone})]`
                    : "text-foreground/70",
                )}
              >
                {name}
              </span>
              <Pencil aria-hidden className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        {/* Move pips + remaining meter */}
        <div className="mt-7 flex flex-col items-center gap-3" aria-hidden>
          <div className="flex items-center gap-4">
            <span
              className="h-2 w-2 rounded-full transition-all"
              style={{
                background: isActive && status !== "finished" ? `var(--${tone})` : "transparent",
                border: `1px solid var(--${tone})`,
                boxShadow:
                  isActive && status !== "finished"
                    ? `0 0 8px color-mix(in oklab, var(--${tone}) 60%, transparent)`
                    : "none",
                opacity: isActive && status !== "finished" ? 1 : 0.4,
              }}
            />
            <span className="eyebrow text-muted-foreground">
              {moves.toString().padStart(2, "0")} moves
            </span>
            <span
              className="h-2 w-2 rounded-full"
              style={{ border: `1px solid var(--${tone})`, opacity: 0.4 }}
            />
          </div>
          <div className="h-px w-40 bg-border">
            <div
              className="h-full transition-[width] duration-300 ease-linear"
              style={{
                width: `${pct * 100}%`,
                background: isLoser || danger ? "var(--danger)" : `var(--${tone})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
