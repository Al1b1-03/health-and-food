import { query } from '../config/database.js';

export const listUsers = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, email, phone, role, is_banned, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      phone: row.phone,
      role: row.role || 'user',
      isBanned: !!row.is_banned,
      createdAt: row.created_at,
    }));

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Ошибка загрузки пользователей' });
  }
};

export const banUser = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const targetId = parseInt(req.params.id, 10);

    if (targetId === adminId) {
      return res.status(400).json({ error: 'Нельзя заблокировать самого себя' });
    }

    const targetResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [targetId]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (targetResult.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Нельзя заблокировать администратора' });
    }

    const result = await query(
      'UPDATE users SET is_banned = NOT is_banned, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING is_banned',
      [targetId]
    );

    res.json({
      message: result.rows[0].is_banned ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
      isBanned: result.rows[0].is_banned,
    });
  } catch (err) {
    console.error('Ban user error:', err);
    res.status(500).json({ error: 'Ошибка при блокировке' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const targetId = parseInt(req.params.id, 10);

    if (targetId === adminId) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    const targetResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [targetId]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (targetResult.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Нельзя удалить администратора' });
    }

    await query('DELETE FROM users WHERE id = $1', [targetId]);

    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
};
