CREATE TABLE public.clock_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  player_one text NOT NULL DEFAULT 'Player 1',
  player_two text NOT NULL DEFAULT 'Player 2',
  custom_minutes integer NOT NULL DEFAULT 10,
  custom_increment integer NOT NULL DEFAULT 5,
  time_control_id text NOT NULL DEFAULT 'rapid-10-0',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clock_settings_minutes_range CHECK (custom_minutes BETWEEN 1 AND 180),
  CONSTRAINT clock_settings_increment_range CHECK (custom_increment BETWEEN 0 AND 60)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clock_settings TO authenticated;
GRANT ALL ON public.clock_settings TO service_role;
ALTER TABLE public.clock_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read clock settings" ON public.clock_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can add clock settings" ON public.clock_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can edit clock settings" ON public.clock_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can remove clock settings" ON public.clock_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_clock_settings_updated_at BEFORE UPDATE ON public.clock_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.saved_games (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL,
  time_control_id text NOT NULL,
  time_control_name text NOT NULL,
  player_one text NOT NULL,
  player_two text NOT NULL,
  moves_one integer NOT NULL,
  moves_two integer NOT NULL,
  winner text,
  duration_ms bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_games_winner_valid CHECK (winner IN ('one', 'two') OR winner IS NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_games TO authenticated;
GRANT ALL ON public.saved_games TO service_role;
ALTER TABLE public.saved_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read saved games" ON public.saved_games FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owners can add saved games" ON public.saved_games FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can edit saved games" ON public.saved_games FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can remove saved games" ON public.saved_games FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_games_owner_date_idx ON public.saved_games (user_id, played_at DESC);
CREATE TRIGGER update_saved_games_updated_at BEFORE UPDATE ON public.saved_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();