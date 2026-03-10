-- Add role column: 'user' | 'admin'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
    ALTER TABLE users ADD CONSTRAINT chk_role CHECK (role IN ('user', 'admin'));
  END IF;
END $$;
