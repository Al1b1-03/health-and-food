-- Категории каталога: Рацион питания (сверху), Витамины, Блюда и напитки (снизу)
-- sort_order: порядок внутри категории (меньше = выше, напр. пробный день первый)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category') THEN
    ALTER TABLE products ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'dishes';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sort_order') THEN
    ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
