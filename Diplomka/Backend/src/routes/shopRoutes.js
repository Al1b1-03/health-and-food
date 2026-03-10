import { Router } from 'express';
import { listProductsPublic } from '../controllers/shopController.js';

const router = Router();

router.get('/products', listProductsPublic);

export default router;
