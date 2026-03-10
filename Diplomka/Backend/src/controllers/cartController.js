import { query } from '../config/database.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url, p.calories
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    const items = result.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      name: row.name,
      price: Number(row.price ?? 0),
      imageUrl: row.image_url,
      calories: Number(row.calories ?? 0),
      subtotal: Number(row.price ?? 0) * row.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({ items, total });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Ошибка загрузки корзины' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    const productIdNum = parseInt(productId, 10);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const productCheck = await query(
      'SELECT id FROM products WHERE id = $1',
      [productIdNum]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const existing = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, productIdNum]
    );

    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + qty;
      await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQty, existing.rows[0].id]
      );
    } else {
      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, productIdNum, qty]
      );
    }

    const cartResult = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1 AND ci.product_id = $2`,
      [userId, productIdNum]
    );

    const row = cartResult.rows[0];
    res.status(201).json({
      item: {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        name: row.name,
        price: Number(row.price ?? 0),
        imageUrl: row.image_url,
        subtotal: Number(row.price ?? 0) * row.quantity,
      },
    });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Ошибка добавления в корзину' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);
    const { quantity } = req.body;

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const result = await query(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, product_id, quantity`,
      [qty, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар в корзине не найден' });
    }

    const cartResult = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.image_url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = $1`,
      [id]
    );

    const row = cartResult.rows[0];
    res.json({
      item: {
        id: row.id,
        productId: row.product_id,
        quantity: row.quantity,
        name: row.name,
        price: Number(row.price ?? 0),
        imageUrl: row.image_url,
        subtotal: Number(row.price ?? 0) * row.quantity,
      },
    });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Ошибка обновления корзины' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const id = parseInt(req.params.id, 10);

    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Товар в корзине не найден' });
    }

    res.json({ message: 'Товар удалён из корзины' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Ошибка удаления из корзины' });
  }
};
