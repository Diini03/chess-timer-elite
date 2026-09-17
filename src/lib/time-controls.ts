// Time control preset architecture — easily extended later (FIDE, custom, etc.)
export type TimeControlCategory = "bullet" | "blitz" | "rapid" | "classical" | "custom";

export interface TimeControl {
  id: string;
  name: string;
  category: TimeControlCategory;
  baseSeconds: number;
  incrementSeconds: number;
}

export const TIME_CONTROLS: TimeControl[] = [
  { id: "bullet-1-0",   name: "1 | 0",   category: "bullet",    baseSeconds: 60,   incrementSeconds: 0 },
  { id: "bullet-2-1",   name: "2 | 1",   category: "bullet",    baseSeconds: 120,  incrementSeconds: 1 },
  { id: "blitz-3-0",    name: "3 | 0",   category: "blitz",     baseSeconds: 180,  incrementSeconds: 0 },
  { id: "blitz-3-2",    name: "3 | 2",   category: "blitz",     baseSeconds: 180,  incrementSeconds: 2 },
  { id: "blitz-5-0",    name: "5 | 0",   category: "blitz",     baseSeconds: 300,  incrementSeconds: 0 },
  { id: "blitz-5-3",    name: "5 | 3",   category: "blitz",     baseSeconds: 300,  incrementSeconds: 3 },
  { id: "rapid-10-0",   name: "10 | 0",  category: "rapid",     baseSeconds: 600,  incrementSeconds: 0 },
  { id: "rapid-10-5",   name: "10 | 5",  category: "rapid",     baseSeconds: 600,  incrementSeconds: 5 },
  { id: "rapid-15-10",  name: "15 | 10", category: "rapid",     baseSeconds: 900,  incrementSeconds: 10 },
  { id: "classical-30", name: "30 | 0",  category: "classical", baseSeconds: 1800, incrementSeconds: 0 },
];

export const DEFAULT_TIME_CONTROL: TimeControl = TIME_CONTROLS.find(t => t.id === "rapid-10-0")!;

/** Build a custom (non-preset) time control from minutes + increment seconds. */
export function makeCustomControl(minutes: number, incrementSeconds: number): TimeControl {
  const m = Math.min(180, Math.max(1, Math.round(minutes)));
  const inc = Math.min(60, Math.max(0, Math.round(incrementSeconds)));
  return {
    id: `custom-${m}-${inc}`,
    name: `${m} | ${inc}`,
    category: "custom",
    baseSeconds: m * 60,
    incrementSeconds: inc,
  };
}

const CUSTOM_KEY = "tempo:custom-time-control";

export function loadCustomControl(): { minutes: number; increment: number } {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (typeof p?.minutes === "number" && typeof p?.increment === "number") return p;
    }
  } catch { /* ignore */ }
  return { minutes: 10, increment: 5 };
}

export function saveCustomControl(minutes: number, increment: number) {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify({ minutes, increment }));
  } catch { /* ignore */ }
}
