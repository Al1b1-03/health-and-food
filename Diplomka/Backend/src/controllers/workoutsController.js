import { query } from '../config/database.js';

const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  shortDesc: row.short_desc ?? '',
  fullDescription: row.full_description ?? '',
  duration: Number(row.duration) || 0,
  calories: Number(row.calories) || 0,
  difficulty: row.difficulty ?? 'Средняя',
  image: row.image_url,
  imageUrl: row.image_url,
  exercises: Array.isArray(row.exercises) ? row.exercises : (row.exercises && typeof row.exercises === 'object' ? Object.values(row.exercises) : []),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listWorkouts = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, short_desc, full_description, duration, calories, difficulty, image_url, exercises, created_at, updated_at
       FROM workouts
       ORDER BY title ASC`
    );
    const workouts = result.rows.map(mapRow);
    res.json({ workouts });
  } catch (err) {
    console.error('List workouts error:', err);
    res.status(500).json({ error: 'Ошибка загрузки тренировок' });
  }
};

const toInt = (v, def = 0) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : Math.max(0, n);
};

export const createWorkout = async (req, res) => {
  try {
    const { title, shortDesc, fullDescription, duration, calories, difficulty, imageUrl, exercises } = req.body || {};
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    const exercisesJson = Array.isArray(exercises) ? exercises : [];
    let exercisesStr = '[]';
    try {
      exercisesStr = JSON.stringify(exercisesJson);
    } catch {
      exercisesStr = '[]';
    }
    const result = await query(
      `INSERT INTO workouts (title, short_desc, full_description, duration, calories, difficulty, image_url, exercises)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING id, title, short_desc, full_description, duration, calories, difficulty, image_url, exercises, created_at`,
      [
        String(title).trim(),
        shortDesc ? String(shortDesc).trim() : null,
        fullDescription ? String(fullDescription).trim() : null,
        toInt(duration, 30),
        toInt(calories, 0),
        difficulty ? String(difficulty).trim() : 'Средняя',
        imageUrl ? String(imageUrl).trim() : null,
        exercisesStr,
      ]
    );
    const row = result.rows[0];
    res.status(201).json({ workout: mapRow(row) });
  } catch (err) {
    console.error('Create workout error:', err);
    const msg =
      process.env.NODE_ENV !== 'production' && err.message
        ? `Ошибка создания тренировки: ${err.message}`
        : 'Ошибка создания тренировки';
    res.status(500).json({ error: msg });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    const { title, shortDesc, fullDescription, duration, calories, difficulty, imageUrl, exercises } = req.body;
    const exercisesJson = Array.isArray(exercises) ? exercises : [];
    const result = await query(
      `UPDATE workouts
       SET title = COALESCE(NULLIF(TRIM($1), ''), title),
           short_desc = COALESCE($2, short_desc),
           full_description = COALESCE($3, full_description),
           duration = COALESCE($4::integer, duration),
           calories = COALESCE($5::integer, calories),
           difficulty = COALESCE(NULLIF(TRIM($6), ''), difficulty),
           image_url = COALESCE($7, image_url),
           exercises = COALESCE($8::jsonb, exercises),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, title, short_desc, full_description, duration, calories, difficulty, image_url, exercises, updated_at`,
      [
        title?.trim(),
        shortDesc != null ? String(shortDesc).trim() : null,
        fullDescription != null ? String(fullDescription).trim() : null,
        duration != null ? toInt(duration) : null,
        calories != null ? toInt(calories) : null,
        difficulty?.trim(),
        imageUrl != null ? String(imageUrl).trim() : null,
        JSON.stringify(exercisesJson),
        id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Тренировка не найдена' });
    res.json({ workout: mapRow(result.rows[0]) });
  } catch (err) {
    console.error('Update workout error:', err);
    res.status(500).json({ error: 'Ошибка обновления тренировки' });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    const result = await query('DELETE FROM workouts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Тренировка не найдена' });
    res.json({ message: 'Тренировка удалена' });
  } catch (err) {
    console.error('Delete workout error:', err);
    res.status(500).json({ error: 'Ошибка удаления тренировки' });
  }
};
