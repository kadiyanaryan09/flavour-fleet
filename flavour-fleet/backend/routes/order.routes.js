import express from 'express';
import { previewBill, createOrder, getMyOrders } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/preview-bill', previewBill);
router.post('/', createOrder);
router.get('/mine', getMyOrders);

export default router;
