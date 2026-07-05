// Game history store — persists completed games to localStorage.
// Kept intentionally small; ready to swap for Lovable Cloud sync later.
import type { TimeControl } from "./time-controls";

export interface GameRecord {
  id: string;
  playedAt: number; // epoch ms
  timeControlId: TimeControl["id"];
  timeControlName: TimeControl["name"];
  players: { one: string; two: string };
  moves: { one: number; two: number };
  winner: "one" | "two" | null; // null = manual reset / draw
  durationMs: number;
}

const KEY = "tempo:game-history";
const MAX = 50;

export function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function saveGame(record: Omit<GameRecord, "id" | "playedAt">): GameRecord {
  const full: GameRecord = {
    ...record,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playedAt: Date.now(),
  };
  try {
    const list = [full, ...loadHistory()].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch { /* ignore */ }
  return full;
}

export function clearHistory() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
