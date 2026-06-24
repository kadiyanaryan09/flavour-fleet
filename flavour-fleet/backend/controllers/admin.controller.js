import * as restaurantModel from '../models/restaurantModel.js';
import * as menuItemModel from '../models/menuItemModel.js';
import * as orderModel from '../models/orderModel.js';
import * as userModel from '../models/userModel.js';

// --- Restaurants ------------------------------------------------------------

export async function listRestaurants(req, res) {
  try {
    const restaurants = await restaurantModel.listAllAdmin();
    res.json({ restaurants });
  } catch (err) {
    res.status(500).json({ message: 'Could not load restaurants.', error: err.message });
  }
}

export async function createRestaurant(req, res) {
  try {
    if (!req.body.name || !req.body.cuisine) {
      return res.status(400).json({ message: 'Name and cuisine are required.' });
    }
    const id = await restaurantModel.create(req.body);
    res.status(201).json({ message: 'Restaurant created.', id });
  } catch (err) {
    res.status(500).json({ message: 'Could not create restaurant.', error: err.message });
  }
}

export async function updateRestaurant(req, res) {
  try {
    const ok = await restaurantModel.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json({ message: 'Restaurant updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update restaurant.', error: err.message });
  }
}

export async function deleteRestaurant(req, res) {
  try {
    const ok = await restaurantModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json({ message: 'Restaurant deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete restaurant.', error: err.message });
  }
}

// --- Menu items --------------------------------------------------------------

export async function listMenuItems(req, res) {
  try {
    const items = await menuItemModel.listAllAdmin(req.query.restaurantId);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Could not load menu items.', error: err.message });
  }
}

export async function createMenuItem(req, res) {
  try {
    const { restaurantId, categoryId, name, price } = req.body;
    if (!restaurantId || !categoryId || !name || !price) {
      return res.status(400).json({ message: 'Restaurant, category, name and price are required.' });
    }
    const id = await menuItemModel.create(req.body);
    res.status(201).json({ message: 'Menu item created.', id });
  } catch (err) {
    res.status(500).json({ message: 'Could not create menu item.', error: err.message });
  }
}

export async function updateMenuItem(req, res) {
  try {
    const ok = await menuItemModel.update(req.params.id, req.body);
    if (!ok) return res.status(404).json({ message: 'Menu item not found.' });
    res.json({ message: 'Menu item updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update menu item.', error: err.message });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const ok = await menuItemModel.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Menu item not found.' });
    res.json({ message: 'Menu item deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not delete menu item.', error: err.message });
  }
}

// --- Orders --------------------------------------------------------------

const VALID_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export async function listOrders(req, res) {
  try {
    const orders = await orderModel.listAllAdmin();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const ok = await orderModel.updateStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ message: 'Order not found.' });
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update order.', error: err.message });
  }
}

// --- Users --------------------------------------------------------------

export async function listUsers(req, res) {
  try {
    const users = await userModel.listAll();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Could not load users.', error: err.message });
  }
}

export async function setUserActive(req, res) {
  try {
    const { isActive } = req.body;
    const ok = await userModel.setActive(req.params.id, isActive);
    if (!ok) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update user.', error: err.message });
  }
}
