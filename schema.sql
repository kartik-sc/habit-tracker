CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
);


CREATE TABLE habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_habit_log_date UNIQUE (habit_id, log_date)
);

-- streak
CREATE INDEX idx_habit_logs_habit_date ON habit_logs (habit_id, log_date DESC);
--analytics
CREATE INDEX idx_habit_logs_date ON habit_logs (log_date);
--partial index
CREATE INDEX idx_habits_active ON habits(is_active) WHERE is_active = TRUE;