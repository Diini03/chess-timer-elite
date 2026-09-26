import { supabase } from "@/integrations/supabase/client";
import type { GameRecord } from "@/lib/game-history";

export type ClockSettings = {
  player_one: string;
  player_two: string;
  custom_minutes: number;
  custom_increment: number;
  time_control_id: string;
};

export async function readClockSettings(userId: string) {
  const { data, error } = await supabase.from("clock_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function writeClockSettings(userId: string, settings: ClockSettings) {
  const { error } = await supabase.from("clock_settings").upsert({ user_id: userId, ...settings });
  if (error) throw error;
}

export async function readCloudGames(userId: string): Promise<GameRecord[]> {
  const { data, error } = await supabase.from("saved_games").select("*").eq("user_id", userId).order("played_at", { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    playedAt: new Date(row.played_at).getTime(),
    timeControlId: row.time_control_id,
    timeControlName: row.time_control_name,
    players: { one: row.player_one, two: row.player_two },
    moves: { one: row.moves_one, two: row.moves_two },
    winner: row.winner === "one" || row.winner === "two" ? row.winner : null,
    durationMs: row.duration_ms,
  }));
}

export async function writeCloudGame(userId: string, game: GameRecord) {
  const { error } = await supabase.from("saved_games").upsert({
    id: game.id, user_id: userId, played_at: new Date(game.playedAt).toISOString(),
    time_control_id: game.timeControlId, time_control_name: game.timeControlName,
    player_one: game.players.one, player_two: game.players.two,
    moves_one: game.moves.one, moves_two: game.moves.two,
    winner: game.winner, duration_ms: game.durationMs,
  });
  if (error) throw error;
}

export async function clearCloudGames(userId: string) {
  const { error } = await supabase.from("saved_games").delete().eq("user_id", userId);
  if (error) throw error;
}
