import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ max: 100 })
    .withMessage('Имя слишком длинное'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Фамилия обязательна')
    .isLength({ max: 100 })
    .withMessage('Фамилия слишком длинная'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Некорректный номер телефона'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email обязателен')
    .isEmail()
    .withMessage('Некорректный email'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email обязателен')
    .isEmail()
    .withMessage('Некорректный email'),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

const profileUpdateValidation = [
  body('gender').optional().trim().isIn(['male', 'female']).withMessage('Некорректный пол'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Возраст от 1 до 120'),
  body('weight').optional().isFloat({ min: 1 }).withMessage('Некорректный вес'),
  body('height').optional().isInt({ min: 1 }).withMessage('Некорректный рост'),
  body('activityLevel').optional().trim(),
  body('calorieNorm').optional().isInt({ min: 0 }).withMessage('Некорректная норма калорий'),
  body('protein').optional().isInt({ min: 0 }).withMessage('Некорректное значение'),
  body('fat').optional().isInt({ min: 0 }).withMessage('Некорректное значение'),
  body('carbs').optional().isInt({ min: 0 }).withMessage('Некорректное значение'),
  body('oldPassword').optional().trim(),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
];

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/profile', authenticateToken, getProfile);
router.patch('/profile', authenticateToken, profileUpdateValidation, handleValidationErrors, updateProfile);

export default router;
