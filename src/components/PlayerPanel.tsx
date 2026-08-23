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
        "relative flex w-full flex-1 select-none overflow-hidden bg-background",
        rotated && "rotate-180",
      )}
    >
      {/* Editorial plate: flat field, ruled edges, one accent bar */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-300",
          isActive && status !== "finished" ? "bg-card" : "bg-background",
          dim && "opacity-70",
        )}
      />
      {isActive && status !== "finished" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[3px]"
          style={{
            top: player === "one" ? "auto" : 0,
            bottom: player === "one" ? 0 : "auto",
            background: `var(--${tone})`,
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
          "absolute inset-0 z-0 outline-none transition-colors duration-300",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-inset",
          isLoser && "bg-destructive/10",
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
      />

      {/* Header rule: name / moves */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <div className="pointer-events-auto">
          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value.slice(0, 20))}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              className="w-40 rounded-sm border border-border bg-card px-2 py-1 text-sm outline-none focus:border-ring"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${name} name`}
              className="group flex min-h-11 items-center gap-2 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border"
                style={{
                  background: player === "one" ? `var(--${tone})` : "transparent",
                  borderColor: `var(--${tone})`,
                }}
              />
              <span className="font-display text-xl leading-none tracking-wide text-foreground">{name}</span>
              <Pencil aria-hidden className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="eyebrow" aria-label={`${moves} moves played`}>
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
          "timer-digits font-medium animate-tap-burst tabular-nums",
          isLoser && "text-destructive",
          !isLoser && danger && "text-[color:var(--danger)]",
          !isLoser && !danger && isActive && `text-[color:var(--${tone})]`,
          !isLoser && !danger && !isActive && "text-muted-foreground",
        )}
        style={{ fontSize: "clamp(3.5rem, 17vw, 8.5rem)", lineHeight: 1 }}
      >
        <span aria-hidden>{main}</span>
        {deci && <span aria-hidden style={{ fontSize: "0.45em" }} className="opacity-80">{deci}</span>}
      </div>

      {/* Footer rule: status + remaining bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="flex items-center justify-between gap-4 px-5 pb-3">
          <span
            className={cn("eyebrow", isActive && status !== "finished" && "text-foreground")}
            aria-hidden
          >
            {statusLabel}
          </span>
          <span className="eyebrow" aria-hidden>
            {Math.round(pct * 100)}%
          </span>
        </div>
        <div className="h-[3px] w-full bg-border/50" aria-hidden>
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
  );
});
