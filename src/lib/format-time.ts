// Time formatting helpers — separated so they can be reused outside the clock hook.

export function formatClock(ms: number): { main: string; deci: string; danger: boolean } {
  const clamped = Math.max(0, ms);
  const totalSec = Math.ceil(clamped / 1000);
  const danger = clamped <= 10_000;

  if (clamped < 10_000) {
    const sec = Math.floor(clamped / 1000);
    const tenths = Math.floor((clamped % 1000) / 100);
    return { main: `0:0${sec}`, deci: `.${tenths}`, danger: true };
  }

  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) {
    return {
      main: `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      deci: "",
      danger,
    };
  }

  return {
    main: `${m}:${s.toString().padStart(2, "0")}`,
    deci: "",
    danger,
  };
}

export function formatDurationShort(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}m ${(s % 60).toString().padStart(2, "0")}s`;
}
