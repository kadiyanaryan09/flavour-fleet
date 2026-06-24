import * as restaurantModel from '../models/restaurantModel.js';
import * as menuItemModel from '../models/menuItemModel.js';
import * as categoryModel from '../models/categoryModel.js';
import * as reviewModel from '../models/reviewModel.js';

export async function listRestaurants(req, res) {
  try {
    const { search, cuisine, sort, veg } = req.query;
    const restaurants = await restaurantModel.list({ search, cuisine, sort, vegOnly: veg });
    res.json({ restaurants });
  } catch (err) {
    res.status(500).json({ message: 'Could not load restaurants.', error: err.message });
  }
}

export async function getCuisines(req, res) {
  try {
    const cuisines = await restaurantModel.listCuisines();
    res.json({ cuisines });
  } catch (err) {
    res.status(500).json({ message: 'Could not load cuisines.', error: err.message });
  }
}

export async function getRestaurant(req, res) {
  try {
    const restaurant = await restaurantModel.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found.' });

    const menuItems = await menuItemModel.listForRestaurant(req.params.id);
    res.json({ restaurant, menuItems });
  } catch (err) {
    res.status(500).json({ message: 'Could not load restaurant.', error: err.message });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await categoryModel.listAll();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Could not load categories.', error: err.message });
  }
}

export async function getReviews(req, res) {
  try {
    const reviews = await reviewModel.listForRestaurant(req.params.id);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Could not load reviews.', error: err.message });
  }
}

export async function submitReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'A rating between 1 and 5 is required.' });
    }
    await reviewModel.upsert(req.params.id, req.user.id, numericRating, comment);
    res.status(201).json({ message: 'Thanks for your review!' });
  } catch (err) {
    res.status(500).json({ message: 'Could not save your review.', error: err.message });
  }
}
