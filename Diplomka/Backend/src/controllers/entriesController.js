import { query } from '../config/database.js';

export const createEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productName, calories, protein, fat, carbs, entryDate } = req.body;

    const result = await query(
      `INSERT INTO food_entries (user_id, product_name, calories, protein, fat, carbs, entry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, product_name, calories, protein, fat, carbs, entry_date, created_at`,
      [
        userId,
        productName,
        parseInt(calories, 10) || 0,
        parseFloat(protein) || 0,
        parseFloat(fat) || 0,
        parseFloat(carbs) || 0,
        entryDate,
      ]
    );

    const entry = result.rows[0];
    res.status(201).json({
      entry: {
        id: entry.id,
        productName: entry.product_name,
        calories: entry.calories,
        protein: parseFloat(entry.protein),
        fat: parseFloat(entry.fat),
        carbs: parseFloat(entry.carbs),
        entryDate: entry.entry_date,
        createdAt: entry.created_at,
      },
    });
  } catch (err) {
    console.error('Create entry error:', err);
    res.status(500).json({ error: 'Ошибка при добавлении записи' });
  }
};

export const getEntries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { dateFrom, dateTo } = req.query;

    let sql = `SELECT id, product_name, calories, protein, fat, carbs, entry_date, created_at
               FROM food_entries WHERE user_id = $1`;
    const params = [userId];

    if (dateFrom) {
      params.push(dateFrom);
      sql += ` AND entry_date >= $${params.length}`;
    }
    if (dateTo) {
      params.push(dateTo);
      sql += ` AND entry_date <= $${params.length}`;
    }

    sql += ` ORDER BY entry_date DESC, created_at DESC`;

    const result = await query(sql, params);

    const entries = result.rows.map((row) => ({
      id: row.id,
      productName: row.product_name,
      calories: row.calories,
      protein: parseFloat(row.protein),
      fat: parseFloat(row.fat),
      carbs: parseFloat(row.carbs),
      entryDate: row.entry_date,
      createdAt: row.created_at,
    }));

    res.json({ entries });
  } catch (err) {
    console.error('Get entries error:', err);
    res.status(500).json({ error: 'Ошибка при загрузке записей' });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM food_entries WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    res.json({ message: 'Запись удалена' });
  } catch (err) {
    console.error('Delete entry error:', err);
    res.status(500).json({ error: 'Ошибка при удалении записи' });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const todayResult = await query(
      `SELECT COALESCE(SUM(calories), 0) as total_calories,
              COALESCE(SUM(protein), 0) as total_protein,
              COALESCE(SUM(fat), 0) as total_fat,
              COALESCE(SUM(carbs), 0) as total_carbs
       FROM food_entries
       WHERE user_id = $1 AND entry_date = $2`,
      [userId, targetDate]
    );

    const allTimeResult = await query(
      `SELECT COALESCE(SUM(calories), 0) as total_calories
       FROM food_entries WHERE user_id = $1`,
      [userId]
    );

    const profileResult = await query(
      'SELECT calorie_norm, protein_norm, fat_norm, carbs_norm FROM users WHERE id = $1',
      [userId]
    );

    const today = todayResult.rows[0];
    const allTime = allTimeResult.rows[0];
    const profile = profileResult.rows[0];

    const calorieNorm = profile?.calorie_norm || 2000;
    const todayCalories = parseInt(today?.total_calories, 10) || 0;
    const remaining = Math.max(0, calorieNorm - todayCalories);

    res.json({
      today: {
        calories: todayCalories,
        protein: parseFloat(today?.total_protein) || 0,
        fat: parseFloat(today?.total_fat) || 0,
        carbs: parseFloat(today?.total_carbs) || 0,
      },
      norm: calorieNorm,
      remaining,
      total: parseInt(allTime?.total_calories, 10) || 0,
      macros: {
        protein: profile?.protein_norm || 0,
        fat: profile?.fat_norm || 0,
        carbs: profile?.carbs_norm || 0,
      },
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Ошибка при загрузке статистики' });
  }
};
