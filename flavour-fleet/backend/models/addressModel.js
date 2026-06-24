import pool from '../config/db.js';

export async function listForUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    [userId]
  );
  return rows;
}

export async function create(userId, { label, line1, line2, city, state, pincode, isDefault }) {
  if (isDefault) {
    await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
  }
  const [result] = await pool.query(
    `INSERT INTO addresses (user_id, label, line1, line2, city, state, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, label || 'Home', line1, line2 || '', city, state, pincode, isDefault ? 1 : 0]
  );
  return result.insertId;
}

export async function remove(userId, addressId) {
  const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
  return result.affectedRows > 0;
}

export async function findById(addressId, userId) {
  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
  return rows[0] || null;
}
