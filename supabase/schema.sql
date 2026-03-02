-- 1. Create tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE burnout_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  risk_level TEXT NOT NULL,
  screen_time NUMERIC NOT NULL,
  sleep_hours NUMERIC NOT NULL,
  social_interaction NUMERIC NOT NULL,
  stress_level NUMERIC NOT NULL,
  study_hours NUMERIC NOT NULL,
  tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  ai_insight TEXT,
  emotion TEXT,
  keywords TEXT[],
  mood_score NUMERIC,
  sentiment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emotion TEXT NOT NULL,
  source TEXT NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questionnaire_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL,
  total_score NUMERIC NOT NULL,
  anxiety_score NUMERIC,
  fatigue_score NUMERIC,
  stress_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_scores ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Burnout Results
CREATE POLICY "Users can view own burnout_results" ON burnout_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own burnout_results" ON burnout_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal Entries
CREATE POLICY "Users can view own journal_entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal_entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mood Records
CREATE POLICY "Users can view own mood_records" ON mood_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood_records" ON mood_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Questionnaire Scores
CREATE POLICY "Users can view own questionnaire_scores" ON questionnaire_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questionnaire_scores" ON questionnaire_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, display_name)
  VALUES (new.id, new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
