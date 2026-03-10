-- Profile fields for users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='gender') THEN
    ALTER TABLE users ADD COLUMN gender VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='age') THEN
    ALTER TABLE users ADD COLUMN age INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='weight') THEN
    ALTER TABLE users ADD COLUMN weight DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='height') THEN
    ALTER TABLE users ADD COLUMN height INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='activity_level') THEN
    ALTER TABLE users ADD COLUMN activity_level VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='calorie_norm') THEN
    ALTER TABLE users ADD COLUMN calorie_norm INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='protein_norm') THEN
    ALTER TABLE users ADD COLUMN protein_norm INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='fat_norm') THEN
    ALTER TABLE users ADD COLUMN fat_norm INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='carbs_norm') THEN
    ALTER TABLE users ADD COLUMN carbs_norm INTEGER;
  END IF;
END $$;
