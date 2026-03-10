import path from 'path';
import fs from 'fs';
import { query } from '../config/database.js';
import { productsUploadsDir } from '../config/uploadsPath.js';

function fullImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const filename = path.basename(imageUrl.replace(/\\/g, '/'));
  if (!filename) return null;
  return `/api/uploads/products/${filename}`;
}

function displayImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const normalized = imageUrl.replace(/\\/g, '/');
  if (normalized.startsWith('/uploads/products/')) return fullImageUrl(imageUrl);
  return imageUrl;
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

export const listProductsPublic = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, calories, protein, fat, carbs, price, image_url, category, sort_order
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
      };
    });

    res.json({ products });
  } catch (err) {
    console.error('List products public error:', err);
    res.status(500).json({ error: 'Ошибка загрузки товаров' });
  }
};
