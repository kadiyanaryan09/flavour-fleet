import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:menuItemId', updateCartItem);
router.delete('/:menuItemId', removeFromCart);
router.delete('/', clearCart);

export default router;
