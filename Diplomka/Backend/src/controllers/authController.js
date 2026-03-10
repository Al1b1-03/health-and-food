import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const SALT_ROUNDS = 10;

export const register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'user')
       RETURNING id, first_name, last_name, phone, email, role, created_at`,
      [firstName, lastName, phone || null, email, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, first_name, last_name, phone, email, password_hash, role, is_banned FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    if (user.is_banned) {
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, phone, email, role, created_at,
        gender, age, weight, height, activity_level, calorie_norm,
        protein_norm, fat_norm, carbs_norm
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        role: user.role || 'user',
        createdAt: user.created_at,
        gender: user.gender,
        age: user.age,
        weight: user.weight,
        height: user.height,
        activityLevel: user.activity_level,
        calorieNorm: user.calorie_norm,
        protein: user.protein_norm,
        fat: user.fat_norm,
        carbs: user.carbs_norm,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      gender,
      age,
      weight,
      height,
      activityLevel,
      calorieNorm,
      protein,
      fat,
      carbs,
      oldPassword,
      newPassword,
    } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    const profileFields = [
      ['gender', gender, 'string'],
      ['age', age != null && age !== '' ? parseInt(age, 10) : null, 'number'],
      ['weight', weight != null && weight !== '' ? parseFloat(weight) : null, 'number'],
      ['height', height != null && height !== '' ? parseInt(height, 10) : null, 'number'],
      ['activity_level', activityLevel, 'string'],
      ['calorie_norm', calorieNorm != null && calorieNorm !== '' ? parseInt(calorieNorm, 10) : null, 'number'],
      ['protein_norm', protein != null && protein !== '' ? parseInt(protein, 10) : null, 'number'],
      ['fat_norm', fat != null && fat !== '' ? parseInt(fat, 10) : null, 'number'],
      ['carbs_norm', carbs != null && carbs !== '' ? parseInt(carbs, 10) : null, 'number'],
    ];

    for (const [col, val] of profileFields) {
      if (val !== undefined && val !== null && val !== '') {
        updates.push(`${col} = $${paramIndex++}`);
        values.push(val);
      }
    }

    if (newPassword && newPassword.length >= 6) {
      if (oldPassword) {
        const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const isValid = await bcrypt.compare(oldPassword, userResult.rows[0].password_hash);
        if (!isValid) {
          return res.status(401).json({ error: 'Неверный текущий пароль' });
        }
      }
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id`;
    await query(sql, values);

    res.json({ message: 'Профиль обновлён' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении профиля' });
  }
};
