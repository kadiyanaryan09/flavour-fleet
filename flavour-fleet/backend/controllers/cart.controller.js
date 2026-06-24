import * as cartModel from '../models/cartModel.js';
import * as menuItemModel from '../models/menuItemModel.js';

export async function getCart(req, res) {
  try {
    const items = await cartModel.getCart(req.user.id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Could not load cart.', error: err.message });
  }
}

export async function addToCart(req, res) {
  try {
    const { menuItemId, quantity, replace } = req.body;
    const menuItem = await menuItemModel.findById(menuItemId);
    if (!menuItem || !menuItem.is_available) {
      return res.status(404).json({ message: 'Item not available.' });
    }

    const currentRestaurantId = await cartModel.getCurrentRestaurantId(req.user.id);
    if (currentRestaurantId && currentRestaurantId !== menuItem.restaurant_id) {
      if (!replace) {
        return res.status(409).json({
          message: 'Your cart has items from another restaurant. Clear it to add from here?',
          code: 'DIFFERENT_RESTAURANT',
        });
      }
      await cartModel.clearCart(req.user.id);
    }

    await cartModel.addItem(req.user.id, menuItem.restaurant_id, menuItem.id, Number(quantity) || 1);
    res.status(201).json({ message: 'Added to cart.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not add to cart.', error: err.message });
  }
}

export async function updateCartItem(req, res) {
  try {
    const { quantity } = req.body;
    await cartModel.updateQuantity(req.user.id, req.params.menuItemId, Number(quantity));
    res.json({ message: 'Cart updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not update cart.', error: err.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    await cartModel.removeItem(req.user.id, req.params.menuItemId);
    res.json({ message: 'Item removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not remove item.', error: err.message });
  }
}

export async function clearCart(req, res) {
  try {
    await cartModel.clearCart(req.user.id);
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Could not clear cart.', error: err.message });
  }
}
