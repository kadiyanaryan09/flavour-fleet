import pool from '../config/db.js';

export async function listAll() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
  return rows;
}

export async function findOrCreateByName(name, sortOrder = 0) {
  const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
  if (existing.length > 0) return existing[0].id;
  const [result] = await pool.query('INSERT INTO categories (name, sort_order) VALUES (?, ?)', [name, sortOrder]);
  return result.insertId;
}
