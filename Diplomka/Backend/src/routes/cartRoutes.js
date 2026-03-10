import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from '../controllers/cartController.js';
import { checkout } from '../controllers/checkoutController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post(
  '/checkout',
  [
    body('cardNumber').trim().notEmpty().withMessage('Введите номер карты'),
    body('address').trim().notEmpty().withMessage('Укажите адрес доставки'),
  ],
  handleValidationErrors,
  checkout
);
router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('productId обязателен'),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  handleValidationErrors,
  addToCart
);
router.patch(
  '/:id',
  [body('quantity').notEmpty().isInt({ min: 1 }).withMessage('Количество должно быть ≥ 1')],
  handleValidationErrors,
  updateCartItem
);
router.delete('/:id', removeFromCart);

export default router;
