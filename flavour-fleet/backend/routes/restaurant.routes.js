import express from 'express';
import {
  listRestaurants, getCuisines, getRestaurant, getCategories, getReviews, submitReview,
} from '../controllers/restaurant.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listRestaurants);
router.get('/cuisines', getCuisines);
router.get('/categories', getCategories);
router.get('/:id', getRestaurant);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', requireAuth, submitReview);

export default router;
