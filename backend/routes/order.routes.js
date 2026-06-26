import express from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/mine', requireAuth, getMyOrders);

export default router;
