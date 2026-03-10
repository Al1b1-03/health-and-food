import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const sqlPath = join(__dirname, '../../database/init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    await pool.query(sql);
    console.log('Init migration completed');

    const migrationsDir = join(__dirname, '../../database/migrations');
    try {
      const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
      for (const file of files) {
        const migrationSql = readFileSync(join(migrationsDir, file), 'utf-8');
        await pool.query(migrationSql);
        console.log(`Migration ${file} completed`);
      }
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  }
};
