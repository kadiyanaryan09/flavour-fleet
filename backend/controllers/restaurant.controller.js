import pool from '../db/pool.js';

export async function getRestaurants(req, res) {
  try {
    const { veg } = req.query;

    let query = 'SELECT * FROM restaurants WHERE is_active = 1';
    const params = [];

    if (veg === '1' || veg === 'true') {
      query += ' AND is_veg = 1';
    }

    query += ' ORDER BY rating DESC, name ASC';

    const [rows] = await pool.query(query, params);
    res.json({ restaurants: rows });
  } catch (err) {
    res.status(500).json({ message: 'Could not load restaurants.', error: err.message });
  }
}

export async function getCuisines(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT cuisine FROM restaurants WHERE is_active = 1'
    );
    const cuisines = rows.map(r => r.cuisine);
    res.json({ cuisines });
  } catch (err) {
    res.status(500).json({ message: 'Could not load cuisines.', error: err.message });
  }
}
