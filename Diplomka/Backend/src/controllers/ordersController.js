import { query } from '../config/database.js';

export const listOrders = async (req, res) => {
  try {
    const ordersResult = await query(
      `SELECT o.id, o.user_id, o.total, o.status, o.address, o.created_at,
              u.first_name, u.last_name, u.email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );

    const orderIds = ordersResult.rows.map((r) => r.id);
    const itemsResult =
      orderIds.length > 0
        ? await query(
            `SELECT order_id, product_name, quantity, price
             FROM order_items
             WHERE order_id = ANY($1)
             ORDER BY order_id`,
            [orderIds]
          )
        : { rows: [] };

    const itemsByOrder = {};
    for (const row of itemsResult.rows) {
      if (!itemsByOrder[row.order_id]) itemsByOrder[row.order_id] = [];
      itemsByOrder[row.order_id].push({
        productName: row.product_name,
        quantity: row.quantity,
        price: Number(row.price),
      });
    }

    const orders = ordersResult.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userFullName: `${row.first_name} ${row.last_name}`.trim(),
      userEmail: row.email,
      total: Number(row.total),
      status: row.status || 'paid',
      address: row.address,
      createdAt: row.created_at,
      items: itemsByOrder[row.id] || [],
    }));

    res.json({ orders });
  } catch (err) {
    console.error('List orders error:', err);
    res.status(500).json({ error: 'Ошибка загрузки заказов' });
  }
};
