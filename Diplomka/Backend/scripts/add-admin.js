/**
 * Добавляет пользователя-админа в БД.
 * Запуск из папки Backend: node scripts/add-admin.js
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.js';

const ADMIN_EMAIL = 'alibiadmin@narxoz.kz';
const ADMIN_PASSWORD = '123456';
const SALT_ROUNDS = 10;

async function addAdmin() {
  try {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    const existing = await query('SELECT id, role FROM users WHERE email = $1', [ADMIN_EMAIL]);

    if (existing.rows.length > 0) {
      await query("UPDATE users SET password_hash = $1, role = 'admin' WHERE email = $2", [
        passwordHash,
        ADMIN_EMAIL,
      ]);
      console.log('Пользователь', ADMIN_EMAIL, 'обновлён: пароль сброшен, роль установлена admin.');
    } else {
      await query(
        `INSERT INTO users (first_name, last_name, phone, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'admin')`,
        ['Admin', 'Alibi', null, ADMIN_EMAIL, passwordHash]
      );
      console.log('Админ добавлен:', ADMIN_EMAIL);
    }

    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
}

addAdmin();
