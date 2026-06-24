import pool from '../config/db.js';

export async function listForRestaurant(restaurantId) {
  const [rows] = await pool.query(
    `SELECT rv.id, rv.rating, rv.comment, rv.created_at, u.name AS reviewer_name
     FROM reviews rv
     JOIN users u ON u.id = rv.user_id
     WHERE rv.restaurant_id = ?
     ORDER BY rv.created_at DESC`,
    [restaurantId]
  );
  return rows;
}

export async function upsert(restaurantId, userId, rating, comment) {
  await pool.query(
    `INSERT INTO reviews (restaurant_id, user_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = CURRENT_TIMESTAMP`,
    [restaurantId, userId, rating, (comment || '').slice(0, 500)]
  );
}
