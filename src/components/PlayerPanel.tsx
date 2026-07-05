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

  const statusLabel = isLoser
    ? "Flag fell"
    : status === "idle"
      ? "Tap to start"
      : isActive
        ? status === "paused" ? "— paused —" : "Your move"
        : "Waiting";

  return (
    <button
      type="button"
      onClick={handleTap}
      disabled={status === "finished"}
      className={cn(
        "relative flex w-full flex-1 select-none overflow-hidden",
        "transition-all duration-300 ease-out outline-none",
        rotated && "rotate-180",
        dim && "opacity-35",
        isLoser && "bg-destructive/10",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Diagonal accent wash when active */}
      {isActive && status !== "finished" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% ${player === "one" ? "100%" : "0%"}, color-mix(in oklab, var(--${tone}) 22%, transparent), transparent 65%)`,
          }}
        />
      )}

      {/* Active side rail */}
      {isActive && status === "running" && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 h-[3px]"
          style={{
            top: player === "one" ? "auto" : 0,
            bottom: player === "one" ? 0 : "auto",
            background: `var(--${tone})`,
            boxShadow: `0 0 24px 2px var(--${tone})`,
          }}
        />
      )}

      {/* Top-left: name */}
      <div
        className="absolute left-5 top-5 z-10 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => onNameChange(e.target.value.slice(0, 20))}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="w-40 rounded-md border border-border bg-card/90 px-2 py-1 text-sm font-medium outline-none focus:border-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group flex items-center gap-1.5 text-left"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: `var(--${tone})` }}
              aria-hidden
            />
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {name}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Top-right: moves */}
      <div className="absolute right-5 top-5 z-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {moves.toString().padStart(2, "0")} · moves
      </div>

      {/* Timer — centered */}
      <div
        key={tapKey}
        className={cn(
          "timer-digits m-auto flex items-baseline justify-center font-semibold animate-tap-burst",
          isLoser && "text-destructive",
          !isLoser && danger && "text-[color:var(--danger)]",
          !isLoser && !danger && isActive && `text-[color:var(--${tone})]`,
          !isLoser && !danger && !isActive && "text-foreground/90",
        )}
        style={{ fontSize: "clamp(4.5rem, 22vw, 9rem)", lineHeight: 1 }}
      >
        <span>{main}</span>
        {deci && (
          <span style={{ fontSize: "0.5em" }} className="opacity-80">{deci}</span>
        )}
      </div>

      {/* Bottom center: status */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {statusLabel}
      </div>
    </button>
  );
});
