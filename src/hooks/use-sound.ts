import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "tempo:sound-enabled";

/**
 * Lightweight WebAudio-based sound effects.
 * No external assets — synthesized clicks/beeps keep the bundle tiny
 * and make the app instantly usable offline.
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === null ? true : raw === "true";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch { /* ignore */ }
  }, [enabled]);

  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const beep = useCallback((freq: number, durationMs: number, gain = 0.06) => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  }, [enabled, getCtx]);

  return {
    enabled,
    toggle: () => setEnabled((v) => !v),
    click: () => beep(880, 40, 0.05),
    lowTime: () => beep(440, 120, 0.08),
    timeout: () => beep(160, 380, 0.12),
  };
}
