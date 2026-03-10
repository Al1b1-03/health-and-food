import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Абсолютный путь к папке Backend/uploads (одно место для сохранения и раздачи) */
export const uploadsRoot = path.resolve(__dirname, '../../uploads');
export const productsUploadsDir = path.resolve(uploadsRoot, 'products');
