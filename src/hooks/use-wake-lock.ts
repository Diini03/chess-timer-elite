import { useEffect, useRef } from "react";

// Keeps the phone screen on during an active game.
// Silently no-ops on browsers without the Wake Lock API.
export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<WakeLockSentinel> };
    };
    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const s = await nav.wakeLock!.request("screen");
        if (cancelled) { s.release().catch(() => {}); return; }
        sentinelRef.current = s;
        s.addEventListener("release", () => {
          if (sentinelRef.current === s) sentinelRef.current = null;
        });
      } catch { /* user gesture required or unsupported — ignore */ }
    };

    const release = () => {
      const s = sentinelRef.current;
      sentinelRef.current = null;
      s?.release().catch(() => {});
    };

    if (active) {
      acquire();
      const onVis = () => {
        if (document.visibilityState === "visible" && active && !sentinelRef.current) {
          acquire();
        }
      };
      document.addEventListener("visibilitychange", onVis);
      return () => {
        cancelled = true;
        document.removeEventListener("visibilitychange", onVis);
        release();
      };
    } else {
      release();
    }
  }, [active]);
}

// Minimal type shim for browsers where lib.dom doesn't include it.
interface WakeLockSentinel extends EventTarget {
  release: () => Promise<void>;
}
