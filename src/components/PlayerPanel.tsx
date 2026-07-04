import { memo, useState } from "react";
import { formatTime } from "@/hooks/use-chess-clock";
import type { PlayerId, GameStatus } from "@/hooks/use-chess-clock";
import { cn } from "@/lib/utils";

interface PlayerPanelProps {
  player: PlayerId;
  name: string;
  onNameChange: (name: string) => void;
  remainingMs: number;
  isActive: boolean;
  status: GameStatus;
  isLoser: boolean;
  moves?: number;
  rotated?: boolean;
  onTap: () => void;
}

export const PlayerPanel = memo(function PlayerPanel({
  player,
  name,
  onNameChange,
  remainingMs,
  isActive,
  status,
  isLoser,
  moves = 0,
  rotated,
  onTap,
}: PlayerPanelProps) {
  const { main, deci, danger } = formatTime(remainingMs);
  const [editing, setEditing] = useState(false);
  const [tapKey, setTapKey] = useState(0);

  const dim = !isActive && (status === "running" || status === "paused");
  const tone = player === "one" ? "player-one" : "player-two";

  const handleTap = () => {
    if (editing) return;
    setTapKey((k) => k + 1);
    onTap();
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      disabled={status === "finished"}
      className={cn(
        "relative flex w-full flex-1 select-none flex-col items-center justify-center overflow-hidden",
        "px-6 transition-all duration-300 ease-out outline-none",
        rotated && "rotate-180",
        isActive && (player === "one" ? "bg-[color:var(--player-one)]/8" : "bg-[color:var(--player-two)]/8"),
        dim && "opacity-40",
        isLoser && "bg-destructive/15",
      )}
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Active glow ring */}
      {isActive && status === "running" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-2 rounded-3xl border-2 transition-opacity",
            player === "one"
              ? "border-[color:var(--player-one)]/60"
              : "border-[color:var(--player-two)]/60",
          )}
        />
      )}

      {/* Name */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10" onClick={(e) => e.stopPropagation()}>
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value.slice(0, 20))}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="w-40 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-center text-sm font-medium outline-none focus:border-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium tracking-wide tap-feedback",
              "bg-card/60 backdrop-blur border border-border/60",
              "text-muted-foreground hover:text-foreground",
            )}
          >
            {name}
          </button>
        )}
      </div>

      {/* Timer */}
      <div
        key={tapKey}
        className={cn(
          "timer-digits flex items-baseline justify-center font-semibold",
          "animate-tap-burst",
          isLoser && "text-destructive",
          !isLoser && danger && "text-[color:var(--danger)]",
          !isLoser && !danger && isActive && `text-[color:var(--${tone})]`,
          !isLoser && !danger && !isActive && "text-foreground",
        )}
        style={{ fontSize: "clamp(4.5rem, 22vw, 9rem)", lineHeight: 1 }}
      >
        <span>{main}</span>
        {deci && (
          <span style={{ fontSize: "0.5em" }} className="opacity-80">{deci}</span>
        )}
      </div>

      {/* Status sub-label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {isLoser
          ? "Time out"
          : status === "idle"
            ? "Tap when ready"
            : isActive
              ? status === "paused" ? "Paused" : "Your move"
              : "Waiting"}
      </div>
    </button>
  );
});
