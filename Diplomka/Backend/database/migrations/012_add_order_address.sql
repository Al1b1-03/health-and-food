-- Add delivery address to orders
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='address') THEN
    ALTER TABLE orders ADD COLUMN address VARCHAR(500);
  END IF;
END $$;
