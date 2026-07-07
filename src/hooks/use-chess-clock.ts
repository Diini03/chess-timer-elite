import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TimeControl } from "@/lib/time-controls";
import { DEFAULT_TIME_CONTROL } from "@/lib/time-controls";

export type PlayerId = "one" | "two";
export type GameStatus = "idle" | "running" | "paused" | "finished";

interface ChessClockState {
  status: GameStatus;
  activePlayer: PlayerId | null;
  remaining: Record<PlayerId, number>; // ms
  winner: PlayerId | null;
  timeControl: TimeControl;
}

/**
 * High-precision chess clock hook.
 * - Drift-free: uses performance.now() deltas, not interval counts.
 * - rAF-driven UI tick at ~10Hz, decoupled from state truth.
 */
export function useChessClock(initialControl: TimeControl = DEFAULT_TIME_CONTROL) {
  const [timeControl, setTimeControl] = useState<TimeControl>(initialControl);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [activePlayer, setActivePlayer] = useState<PlayerId | null>(null);
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [moves, setMoves] = useState<Record<PlayerId, number>>({ one: 0, two: 0 });

  // Remaining time as a ref (truth) + state mirror (render trigger).
  const remainingRef = useRef<Record<PlayerId, number>>({
    one: initialControl.baseSeconds * 1000,
    two: initialControl.baseSeconds * 1000,
  });
  const [remaining, setRemaining] = useState<Record<PlayerId, number>>(remainingRef.current);

  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const activePlayerRef = useRef<PlayerId | null>(null);

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTickRef.current = null;
  };

  const tick = useCallback(() => {
    const now = performance.now();
    const last = lastTickRef.current ?? now;
    const delta = now - last;
    lastTickRef.current = now;

    const cur = activePlayerRef.current;
    if (!cur) return;

    const next = Math.max(0, remainingRef.current[cur] - delta);
    remainingRef.current = { ...remainingRef.current, [cur]: next };
    setRemaining(remainingRef.current);

    if (next <= 0) {
      activePlayerRef.current = null;
      setActivePlayer(null);
      setStatus("finished");
      setWinner(cur === "one" ? "two" : "one");
      stopLoop();
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => () => stopLoop(), []);

  /** Tap on a player's side: pause them, give increment, start opponent. */
  const switchTurn = useCallback((tappedBy: PlayerId) => {
    if (status === "finished") return;

    // Light haptic feedback where supported (mobile).
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(8);
    }

    // First tap: starts the OPPONENT of the tapper.
    if (status === "idle") {
      const opponent: PlayerId = tappedBy === "one" ? "two" : "one";
      activePlayerRef.current = opponent;
      setActivePlayer(opponent);
      setStatus("running");
      startLoop();
      return;
    }

    if (status === "paused") return;

    // Only the active player can press their own side.
    if (tappedBy !== activePlayer) return;

    // Apply Fischer increment to the player who just moved.
    if (timeControl.incrementSeconds > 0) {
      const incMs = timeControl.incrementSeconds * 1000;
      remainingRef.current = {
        ...remainingRef.current,
        [tappedBy]: remainingRef.current[tappedBy] + incMs,
      };
      setRemaining(remainingRef.current);
    }

    setMoves((m) => ({ ...m, [tappedBy]: m[tappedBy] + 1 }));

    const next: PlayerId = tappedBy === "one" ? "two" : "one";
    activePlayerRef.current = next;
    setActivePlayer(next);
  }, [status, activePlayer, timeControl, startLoop]);

  const pause = useCallback(() => {
    if (status !== "running") return;
    setStatus("paused");
    stopLoop();
  }, [status]);

  const resume = useCallback(() => {
    if (status !== "paused" || !activePlayer) return;
    setStatus("running");
    startLoop();
  }, [status, activePlayer, startLoop]);

  const reset = useCallback((control?: TimeControl) => {
    stopLoop();
    const tc = control ?? timeControl;
    setTimeControl(tc);
    remainingRef.current = {
      one: tc.baseSeconds * 1000,
      two: tc.baseSeconds * 1000,
    };
    setRemaining(remainingRef.current);
    activePlayerRef.current = null;
    setActivePlayer(null);
    setWinner(null);
    setMoves({ one: 0, two: 0 });
    setStatus("idle");
  }, [timeControl]);

  return useMemo(() => ({
    status,
    activePlayer,
    remaining,
    winner,
    timeControl,
    moves,
    switchTurn,
    pause,
    resume,
    reset,
    setTimeControl: (tc: TimeControl) => reset(tc),
  }), [status, activePlayer, remaining, winner, timeControl, moves, switchTurn, pause, resume, reset]);
}

export function formatTime(ms: number): { main: string; deci: string; danger: boolean } {
  const clamped = Math.max(0, ms);
  const totalSec = Math.ceil(clamped / 1000);
  const danger = clamped <= 10_000;

  if (clamped < 10_000) {
    // Under 10s — show tenths
    const sec = Math.floor(clamped / 1000);
    const tenths = Math.floor((clamped % 1000) / 100);
    return { main: `0:0${sec}`, deci: `.${tenths}`, danger: true };
  }

  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return {
    main: `${m}:${s.toString().padStart(2, "0")}`,
    deci: "",
    danger,
  };
}
