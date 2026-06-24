import pool from '../config/db.js';

export async function listForRestaurant(restaurantId) {
  const [rows] = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM menu_items m
     JOIN categories c ON c.id = m.category_id
     WHERE m.restaurant_id = ? AND m.is_available = 1
     ORDER BY c.sort_order ASC, m.name ASC`,
    [restaurantId]
  );
  return rows;
}

export async function findByIds(ids) {
  if (ids.length === 0) return [];
  const [rows] = await pool.query('SELECT * FROM menu_items WHERE id IN (?)', [ids]);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function listAllAdmin(restaurantId) {
  let query = `SELECT m.*, c.name AS category_name, r.name AS restaurant_name
               FROM menu_items m
               JOIN categories c ON c.id = m.category_id
               JOIN restaurants r ON r.id = m.restaurant_id`;
  const params = [];
  if (restaurantId) {
    query += ' WHERE m.restaurant_id = ?';
    params.push(restaurantId);
  }
  query += ' ORDER BY r.name ASC, c.sort_order ASC, m.name ASC';
  const [rows] = await pool.query(query, params);
  return rows;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_veg, is_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.restaurantId, data.categoryId, data.name, data.description || '',
      data.price, data.imageUrl || null, data.isVeg ? 1 : 0, data.isAvailable === false ? 0 : 1,
    ]
  );
  return result.insertId;
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE menu_items SET restaurant_id=?, category_id=?, name=?, description=?, price=?, image_url=?, is_veg=?, is_available=?
     WHERE id = ?`,
    [
      data.restaurantId, data.categoryId, data.name, data.description || '',
      data.price, data.imageUrl || null, data.isVeg ? 1 : 0, data.isAvailable ? 1 : 0, id,
    ]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
