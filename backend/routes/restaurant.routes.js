import express from 'express';
import { getRestaurants, getCuisines } from '../controllers/restaurant.controller.js';

const router = express.Router();

router.get('/cuisines', getCuisines);
router.get('/', getRestaurants);

export default router;
