import { Router } from 'express';
import { body } from 'express-validator';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage as uploadProductImageHandler,
} from '../controllers/productsController.js';
import { uploadProductImage } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

const productValidation = [
  body('name').optional().trim().isLength({ max: 255 }).withMessage('Название слишком длинное'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Калории должны быть числом ≥ 0'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Некорректное значение белков'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Некорректное значение жиров'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Некорректное значение углеводов'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Цена должна быть ≥ 0'),
];

router.use(authenticateToken, requireAdmin);

router.get('/', listProducts);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Название обязательно'),
    body('calories').optional().isInt({ min: 0 }),
    body('protein').optional().isFloat({ min: 0 }),
    body('fat').optional().isFloat({ min: 0 }),
    body('carbs').optional().isFloat({ min: 0 }),
    body('price').optional().isFloat({ min: 0 }),
  ],
  handleValidationErrors,
  createProduct
);
router.patch('/:id', productValidation, handleValidationErrors, updateProduct);
router.post(
  '/:id/image',
  (req, res, next) => {
    uploadProductImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
      }
      next();
    });
  },
  uploadProductImageHandler
);
router.delete('/:id', deleteProduct);

export default router;
