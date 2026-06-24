import express from 'express';
import {
  listRestaurants, createRestaurant, updateRestaurant, deleteRestaurant,
  listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
  listOrders, updateOrderStatus,
  listUsers, setUserActive,
} from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/restaurants', listRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

router.get('/menu-items', listMenuItems);
router.post('/menu-items', createMenuItem);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

router.get('/orders', listOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/users', listUsers);
router.patch('/users/:id/active', setUserActive);

export default router;
