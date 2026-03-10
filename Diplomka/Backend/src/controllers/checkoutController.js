import { query } from '../config/database.js';

const TEST_CARD = '4242424242424242';

const normalizeCard = (card) => (card || '').replace(/\s/g, '');

export const checkout = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { cardNumber, address } = req.body;

    const card = normalizeCard(cardNumber);
    if (card !== TEST_CARD) {
      return res.status(400).json({
        error: 'Используйте тестовую карту: 4242 4242 4242 4242',
      });
    }

    const addressTrimmed = (address || '').trim();
    if (!addressTrimmed) {
      return res.status(400).json({ error: 'Укажите адрес доставки' });
    }

    const cartResult = await query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    const total = cartResult.rows.reduce(
      (sum, row) => sum + Number(row.price ?? 0) * row.quantity,
      0
    );

    const orderResult = await query(
      `INSERT INTO orders (user_id, total, status, address)
       VALUES ($1, $2, 'paid', $3)
       RETURNING id, total, status, address, created_at`,
      [userId, total, addressTrimmed]
    );

    const order = orderResult.rows[0];

    for (const row of cartResult.rows) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, row.product_id, row.name, row.quantity, row.price]
      );
    }

    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.status(201).json({
      message: 'Оплата прошла успешно',
      order: {
        id: order.id,
        total: Number(order.total),
        status: order.status,
        address: order.address,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Ошибка при оплате' });
  }
};
