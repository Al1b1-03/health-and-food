-- База тренировок (админ добавляет, пользователи просматривают)
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_desc VARCHAR(500),
  full_description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  calories INTEGER NOT NULL DEFAULT 0,
  difficulty VARCHAR(50) DEFAULT 'Средняя',
  image_url VARCHAR(500),
  exercises JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workouts_title ON workouts(title);
