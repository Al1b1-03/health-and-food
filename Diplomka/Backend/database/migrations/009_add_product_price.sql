-- Add price to products
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='price') THEN
    ALTER TABLE products ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
