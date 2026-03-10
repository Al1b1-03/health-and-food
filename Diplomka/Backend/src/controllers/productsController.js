import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';
import { productsUploadsDir } from '../config/uploadsPath.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fullImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const filename = path.basename(imageUrl.replace(/\\/g, '/'));
  if (!filename) return null;
  return `/api/uploads/products/${filename}`;
}

/** Для отображения: локальный путь превращаем в полный URL (как картинка из интернета). */
function displayImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const normalized = imageUrl.replace(/\\/g, '/');
  if (normalized.startsWith('/uploads/products/')) return fullImageUrl(imageUrl);
  return imageUrl;
}

/** При сохранении: полный URL нашего API превращаем обратно в путь /uploads/products/xxx. */
function normalizeStoredImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const s = imageUrl.trim();
  const match = s.match(/\/api\/uploads\/products\/([^/?#]+)/);
  if (match) return `/uploads/products/${match[1]}`;
  return s || null;
}

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };

function readImageDataUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('/uploads/products/')) return null;
  const filename = path.basename(imageUrl.replace(/\\/g, '/'));
  const filePath = path.join(productsUploadsDir, filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export const listProducts = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, calories, protein, fat, carbs, price, image_url, category, sort_order, created_at, updated_at
       FROM products
       ORDER BY CASE category WHEN 'ration' THEN 1 WHEN 'vitamins' THEN 2 WHEN 'dishes' THEN 3 ELSE 4 END,
                sort_order ASC NULLS LAST,
                name ASC`
    );

    const products = result.rows.map((row) => {
      const imageDataUrl = readImageDataUrl(row.image_url);
      return {
        id: row.id,
        name: row.name,
        calories: Number(row.calories),
        protein: Number(row.protein),
        fat: Number(row.fat),
        carbs: Number(row.carbs),
        price: Number(row.price ?? 0),
        imageUrl: displayImageUrl(row.image_url),
        imageFullUrl: fullImageUrl(row.image_url),
        imageDataUrl: imageDataUrl || undefined,
        category: row.category || 'dishes',
        sortOrder: row.sort_order != null ? Number(row.sort_order) : 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.json({ products });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ error: 'Ошибка загрузки товаров' });
  }
};

const toInt = (v, def = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
};
const toFloat = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? def : Math.max(0, n);
};

const normalizeCategory = (v) => {
  const c = String(v || '').trim().toLowerCase();
  return ['ration', 'vitamins', 'dishes'].includes(c) ? c : 'dishes';
};

export const createProduct = async (req, res) => {
  try {
    const { name, calories, protein, fat, carbs, price, imageUrl, category, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }

    const result = await query(
      `INSERT INTO products (name, calories, protein, fat, carbs, price, image_url, category, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, calories, protein, fat, carbs, price, image_url, category, sort_order, created_at`,
      [
        name.trim(),
        toInt(calories),
        toFloat(protein),
        toFloat(fat),
        toFloat(carbs),
        toFloat(price),
        normalizeStoredImageUrl(imageUrl),
        normalizeCategory(category),
        toInt(sortOrder),
      ]
    );

    const row = result.rows[0];
    res.status(201).json({
      product: {
        id: row.id,
        name: row.name,
        calories: Number(row.calories),
        protein: Number(row.protein),
        fat: Number(row.fat),
        carbs: Number(row.carbs),
        price: Number(row.price ?? 0),
        imageUrl: displayImageUrl(row.image_url),
        imageFullUrl: fullImageUrl(row.image_url),
        imageDataUrl: readImageDataUrl(row.image_url) || undefined,
        category: row.category || 'dishes',
        sortOrder: row.sort_order != null ? Number(row.sort_order) : 0,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    console.error('Create product error:', err);
    const message =
      process.env.NODE_ENV !== 'production' && err.message
        ? `Ошибка создания товара: ${err.message}`
        : 'Ошибка создания товара';
    res.status(500).json({ error: message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, calories, protein, fat, carbs, price, imageUrl, category, sortOrder } = req.body;

    const result = await query(
      `UPDATE products
       SET name = COALESCE(NULLIF(TRIM($1), ''), name),
           calories = COALESCE($2::integer, calories),
           protein = COALESCE($3::decimal, protein),
           fat = COALESCE($4::decimal, fat),
           carbs = COALESCE($5::decimal, carbs),
           price = COALESCE($6::decimal, price),
           image_url = COALESCE(NULLIF(TRIM($7), ''), image_url),
           category = COALESCE($8, category),
           sort_order = COALESCE($9::integer, sort_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, name, calories, protein, fat, carbs, price, image_url, category, sort_order, updated_at`,
      [
        name?.trim(),
        calories != null ? parseInt(calories, 10) : null,
        protein != null ? parseFloat(protein) : null,
        fat != null ? parseFloat(fat) : null,
        carbs != null ? parseFloat(carbs) : null,
        price != null ? parseFloat(price) : null,
        imageUrl != null ? normalizeStoredImageUrl(imageUrl) : null,
        category != null ? normalizeCategory(category) : null,
        sortOrder != null ? toInt(sortOrder) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const row = result.rows[0];
    res.json({
      product: {
        id: row.id,
        name: row.name,
        calories: Number(row.calories),
        protein: Number(row.protein),
        fat: Number(row.fat),
        carbs: Number(row.carbs),
        price: Number(row.price ?? 0),
        imageUrl: displayImageUrl(row.image_url),
        imageFullUrl: fullImageUrl(row.image_url),
        imageDataUrl: readImageDataUrl(row.image_url) || undefined,
        category: row.category || 'dishes',
        sortOrder: row.sort_order != null ? Number(row.sort_order) : 0,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
};

export const uploadProductImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Выберите изображение' });
    }

    const imageUrl = `/uploads/products/${file.filename}`;

    const selectResult = await query(
      'SELECT image_url FROM products WHERE id = $1',
      [id]
    );

    if (selectResult.rows.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const oldPath = selectResult.rows[0].image_url;
    if (oldPath && !oldPath.startsWith('http')) {
      const fullPath = path.join(__dirname, '../..', oldPath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn('Could not delete old image:', e.message);
        }
      }
    }

    const result = await query(
      `UPDATE products SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, name, calories, protein, fat, carbs, price, image_url, updated_at`,
      [imageUrl, id]
    );

    const row = result.rows[0];
    res.json({
      product: {
        id: row.id,
        name: row.name,
        calories: Number(row.calories),
        protein: Number(row.protein),
        fat: Number(row.fat),
        carbs: Number(row.carbs),
        price: Number(row.price ?? 0),
        imageUrl: displayImageUrl(row.image_url),
        imageFullUrl: fullImageUrl(row.image_url),
        imageDataUrl: readImageDataUrl(row.image_url) || undefined,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error('Upload image error:', err);
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Ошибка загрузки изображения' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const selectResult = await query(
      'SELECT image_url FROM products WHERE id = $1',
      [id]
    );

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const imgPath = selectResult.rows[0]?.image_url;
    if (imgPath && !imgPath.startsWith('http')) {
      const fullPath = path.join(__dirname, '../..', imgPath.replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.warn('Could not delete product image:', e.message);
        }
      }
    }

    res.json({ message: 'Товар удалён' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
};
