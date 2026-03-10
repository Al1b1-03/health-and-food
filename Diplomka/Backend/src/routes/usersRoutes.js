import { Router } from 'express';
import { listUsers, banUser, deleteUser } from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', listUsers);
router.patch('/:id/ban', banUser);
router.delete('/:id', deleteUser);

export default router;
