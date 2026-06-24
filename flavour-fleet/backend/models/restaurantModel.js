import pool from '../config/db.js';

export async function list({ search, cuisine, sort, vegOnly }) {
  let query = `
    SELECT r.*,
      ROUND(COALESCE(AVG(rv.rating), r.rating), 1) AS computed_rating,
      COUNT(rv.id) AS review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    WHERE r.is_active = 1
  `;
  const params = [];

  if (search) {
    query += ' AND (r.name LIKE ? OR r.cuisine LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (cuisine) {
    query += ' AND r.cuisine = ?';
    params.push(cuisine);
  }
  if (vegOnly === '1') {
    query += ` AND r.id IN (SELECT DISTINCT restaurant_id FROM menu_items WHERE is_veg = 1)
               AND r.id NOT IN (SELECT DISTINCT restaurant_id FROM menu_items WHERE is_veg = 0)`;
  }

  query += ' GROUP BY r.id';

  const sortMap = {
    rating_desc: 'computed_rating DESC',
    delivery_time_asc: 'r.delivery_time_min ASC',
    cost_asc: 'r.cost_for_two ASC',
    cost_desc: 'r.cost_for_two DESC',
  };
  query += ` ORDER BY ${sortMap[sort] || 'r.id ASC'}`;

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT r.*,
        ROUND(COALESCE(AVG(rv.rating), r.rating), 1) AS computed_rating,
        COUNT(rv.id) AS review_count
     FROM restaurants r
     LEFT JOIN reviews rv ON rv.restaurant_id = r.id
     WHERE r.id = ?
     GROUP BY r.id`,
    [id]
  );
  return rows[0] || null;
}

export async function listCuisines() {
  const [rows] = await pool.query('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine ASC');
  return rows.map((r) => r.cuisine);
}

export async function listAllAdmin() {
  const [rows] = await pool.query('SELECT * FROM restaurants ORDER BY created_at DESC');
  return rows;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO restaurants
      (name, cuisine, description, image_url, city, area, rating, cost_for_two, delivery_time_min, delivery_time_max, discount_text, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name, data.cuisine, data.description || '', data.imageUrl || null,
      data.city || 'Meerut', data.area || '', data.rating || 4.0, data.costForTwo || 300,
      data.deliveryTimeMin || 25, data.deliveryTimeMax || 35, data.discountText || null,
      data.isActive === false ? 0 : 1,
    ]
  );
  return result.insertId;
}

export async function update(id, data) {
  const [result] = await pool.query(
    `UPDATE restaurants SET name=?, cuisine=?, description=?, image_url=?, city=?, area=?,
        rating=?, cost_for_two=?, delivery_time_min=?, delivery_time_max=?, discount_text=?, is_active=?
     WHERE id = ?`,
    [
      data.name, data.cuisine, data.description || '', data.imageUrl || null,
      data.city || 'Meerut', data.area || '', data.rating || 4.0, data.costForTwo || 300,
      data.deliveryTimeMin || 25, data.deliveryTimeMax || 35, data.discountText || null,
      data.isActive ? 1 : 0, id,
    ]
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.query('DELETE FROM restaurants WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
