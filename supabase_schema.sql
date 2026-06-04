-- 1. Create profiles table to store age group
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  age_group TEXT, -- e.g., '18-24', '25-34', '35-44', '45+'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create questions table (source of truth for all questions)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT, -- nullable for 2-choice questions
  category TEXT NOT NULL DEFAULT 'General',
  severity INT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'reddit'
  reddit_id TEXT UNIQUE, -- for deduplication of scraped posts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source);
CREATE INDEX IF NOT EXISTS idx_questions_reddit_id ON questions(reddit_id);

-- 3. Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id),
  user_id UUID REFERENCES auth.users(id), -- nullable for anonymous
  choice TEXT NOT NULL, 
  response_time_ms INT NOT NULL,
  age_group TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);

-- 4. Create view for core metrics & Hesitation Factor
CREATE OR REPLACE VIEW question_stats AS
SELECT 
  question_id,
  count(*) as total_responses,
  sum(case when choice = 'A' then 1 else 0 end) as count_a,
  sum(case when choice = 'B' then 1 else 0 end) as count_b,
  sum(case when choice = 'C' then 1 else 0 end) as count_c,
  avg(response_time_ms) as avg_time,
  avg(case when choice = 'A' then response_time_ms else null end) as avg_time_a,
  avg(case when choice = 'B' then response_time_ms else null end) as avg_time_b,
  avg(case when choice = 'C' then response_time_ms else null end) as avg_time_c
FROM answers
GROUP BY question_id;

-- 5. Create view for demographic data (Age Groups & Generation Gap)
CREATE OR REPLACE VIEW question_demographics AS
SELECT 
  question_id,
  age_group,
  count(*) as total_responses,
  sum(case when choice = 'A' then 1 else 0 end) as count_a,
  sum(case when choice = 'B' then 1 else 0 end) as count_b,
  sum(case when choice = 'C' then 1 else 0 end) as count_c
FROM answers
WHERE age_group IS NOT NULL
GROUP BY question_id, age_group;

-- 6. Create view for Time of Day Bias
CREATE OR REPLACE VIEW question_time_bias AS
SELECT 
  question_id,
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  count(*) as total_responses,
  sum(case when choice = 'A' then 1 else 0 end) as count_a,
  sum(case when choice = 'B' then 1 else 0 end) as count_b,
  sum(case when choice = 'C' then 1 else 0 end) as count_c
FROM answers
GROUP BY question_id, EXTRACT(HOUR FROM created_at);

-- 7. Global stats view (for landing page)
CREATE OR REPLACE VIEW global_stats AS
SELECT 
  (SELECT count(*) FROM answers) as total_responses,
  (SELECT count(*) FROM questions) as total_questions,
  (SELECT count(DISTINCT user_id) FROM answers WHERE user_id IS NOT NULL) as total_users;

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read on answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on answers" ON answers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on questions" ON questions FOR INSERT WITH CHECK (true);
