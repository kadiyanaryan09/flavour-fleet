import pool from '../db/pool.js';

export async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, sort_order FROM categories ORDER BY sort_order ASC'
    );
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ message: 'Could not load categories.', error: err.message });
  }
}

export async function getMenuItems(req, res) {
  try {
    const { categoryId } = req.query;

    let query = `
      SELECT m.id, m.name, m.description, m.price, m.emoji, m.is_available,
             c.id AS category_id, c.name AS category_name
      FROM menu_items m
      JOIN categories c ON c.id = m.category_id
      WHERE m.is_available = 1
    `;
    const params = [];

    if (categoryId) {
      query += ' AND m.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY c.sort_order ASC, m.name ASC';

    const [rows] = await pool.query(query, params);
    res.json({ items: rows });
  } catch (err) {
    res.status(500).json({ message: 'Could not load menu items.', error: err.message });
  }
}
