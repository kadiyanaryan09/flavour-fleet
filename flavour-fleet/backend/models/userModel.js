import pool from '../config/db.js';

export async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, is_admin, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

export async function create({ name, email, passwordHash, phone }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, phone || null]
  );
  return result.insertId;
}

export async function updateProfile(id, { name, phone }) {
  await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone || null, id]);
}

export async function listAll() {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.is_admin, u.is_active, u.created_at,
            COUNT(o.id) AS order_count
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

export async function setActive(id, isActive) {
  const [result] = await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
  return result.affectedRows > 0;
}
