-- ============================================
-- Supabase PostgreSQL Schema for 붕어빵 점프맵
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================

-- 1. profiles 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  character_type TEXT DEFAULT 'pig' CHECK (character_type IN ('pig', 'monkey')),
  game_difficulty INTEGER DEFAULT 5 CHECK (game_difficulty BETWEEN 1 AND 10),
  quiz_difficulty INTEGER DEFAULT 3 CHECK (quiz_difficulty BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. game_progress 테이블
CREATE TABLE game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_level_index INTEGER DEFAULT 0 CHECK (current_level_index BETWEEN 0 AND 9),
  collected_ingredients INTEGER[] DEFAULT '{}',
  total_deaths INTEGER DEFAULT 0,
  total_time REAL DEFAULT 0,
  game_difficulty INTEGER DEFAULT 5,
  quiz_difficulty INTEGER DEFAULT 3,
  character_type TEXT DEFAULT 'pig',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON game_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON game_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON game_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress"
  ON game_progress FOR DELETE USING (auth.uid() = user_id);

-- 3. leaderboard_entries 테이블
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  character_type TEXT NOT NULL,
  game_difficulty INTEGER NOT NULL,
  quiz_difficulty INTEGER NOT NULL,
  total_time REAL NOT NULL,
  total_deaths INTEGER NOT NULL DEFAULT 0,
  score REAL GENERATED ALWAYS AS (
    total_time + (total_deaths * 5.0) - (game_difficulty * 10.0) - (quiz_difficulty * 5.0)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert own entries"
  ON leaderboard_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_leaderboard_score ON leaderboard_entries (score ASC);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries (user_id, score ASC);

-- 4. quiz_results 테이블
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level_index INTEGER NOT NULL,
  checkpoint_index INTEGER NOT NULL,
  quiz_difficulty INTEGER NOT NULL,
  quiz_type TEXT NOT NULL,
  quiz_word TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  answered_via TEXT DEFAULT 'choice' CHECK (answered_via IN ('choice', 'speech', 'skip')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quiz results"
  ON quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_quiz_results_user ON quiz_results (user_id, created_at DESC);

-- 5. 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. 리더보드 조회 함수
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  rank BIGINT,
  display_name TEXT,
  character_type TEXT,
  game_difficulty INTEGER,
  quiz_difficulty INTEGER,
  total_time REAL,
  total_deaths INTEGER,
  score REAL,
  user_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH best_scores AS (
    SELECT DISTINCT ON (le.user_id)
      le.display_name,
      le.character_type,
      le.game_difficulty,
      le.quiz_difficulty,
      le.total_time,
      le.total_deaths,
      le.score,
      le.user_id,
      le.created_at
    FROM leaderboard_entries le
    ORDER BY le.user_id, le.score ASC
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY bs.score ASC) AS rank,
    bs.display_name,
    bs.character_type,
    bs.game_difficulty,
    bs.quiz_difficulty,
    bs.total_time,
    bs.total_deaths,
    bs.score,
    bs.user_id,
    bs.created_at
  FROM best_scores bs
  ORDER BY bs.score ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
