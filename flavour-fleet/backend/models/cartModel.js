import pool from '../config/db.js';

export async function getCart(userId) {
  const [rows] = await pool.query(
    `SELECT c.id AS cart_id, c.quantity, m.id AS menu_item_id, m.name, m.price, m.image_url,
            m.is_veg, m.restaurant_id, r.name AS restaurant_name
     FROM cart c
     JOIN menu_items m ON m.id = c.menu_item_id
     JOIN restaurants r ON r.id = c.restaurant_id
     WHERE c.user_id = ?
     ORDER BY c.created_at ASC`,
    [userId]
  );
  return rows;
}

export async function getCurrentRestaurantId(userId) {
  const [rows] = await pool.query('SELECT DISTINCT restaurant_id FROM cart WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].restaurant_id : null;
}

export async function addItem(userId, restaurantId, menuItemId, quantity = 1) {
  const [existing] = await pool.query(
    'SELECT id, quantity FROM cart WHERE user_id = ? AND menu_item_id = ?',
    [userId, menuItemId]
  );
  if (existing.length > 0) {
    await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
  } else {
    await pool.query(
      'INSERT INTO cart (user_id, restaurant_id, menu_item_id, quantity) VALUES (?, ?, ?, ?)',
      [userId, restaurantId, menuItemId, quantity]
    );
  }
}

export async function updateQuantity(userId, menuItemId, quantity) {
  if (quantity <= 0) {
    await pool.query('DELETE FROM cart WHERE user_id = ? AND menu_item_id = ?', [userId, menuItemId]);
  } else {
    await pool.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND menu_item_id = ?', [
      quantity, userId, menuItemId,
    ]);
  }
}

export async function removeItem(userId, menuItemId) {
  await pool.query('DELETE FROM cart WHERE user_id = ? AND menu_item_id = ?', [userId, menuItemId]);
}

export async function clearCart(userId) {
  await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
}
