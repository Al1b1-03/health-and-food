import { Router } from 'express';
import { listWorkouts } from '../controllers/workoutsController.js';

const router = Router();

router.get('/', listWorkouts);

export default router;
