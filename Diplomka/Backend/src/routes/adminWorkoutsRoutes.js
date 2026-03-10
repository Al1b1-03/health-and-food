import { Router } from 'express';
import { body } from 'express-validator';
import {
  listWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutsController.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.get('/', listWorkouts);

router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Название обязательно')],
  handleValidationErrors,
  createWorkout
);

router.patch(
  '/:id',
  [
    body('title').optional().trim(),
    body('duration').optional().isInt({ min: 0 }),
    body('calories').optional().isInt({ min: 0 }),
  ],
  handleValidationErrors,
  updateWorkout
);

router.delete('/:id', deleteWorkout);

export default router;
