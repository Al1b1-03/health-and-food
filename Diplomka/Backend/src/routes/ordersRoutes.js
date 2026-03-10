import { Router } from 'express';
import { listOrders } from '../controllers/ordersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', listOrders);

export default router;
