import pool from '../config/db.js';

export async function createOrder(conn, data) {
  const [result] = await conn.query(
    `INSERT INTO orders
      (user_id, restaurant_id, address_id, delivery_address, status, subtotal,
       discount_amount, gst_amount, delivery_fee, total_amount, payment_method, payment_status, transaction_id)
     VALUES (?, ?, ?, ?, 'placed', ?, ?, ?, ?, ?, ?, 'paid', ?)`,
    [
      data.userId, data.restaurantId, data.addressId || null, data.deliveryAddress,
      data.subtotal, data.discountAmount, data.gstAmount, data.deliveryFee, data.totalAmount,
      data.paymentMethod, data.transactionId,
    ]
  );
  return result.insertId;
}

export async function addOrderItem(conn, orderId, item) {
  await conn.query(
    `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price_at_order)
     VALUES (?, ?, ?, ?, ?)`,
    [orderId, item.menuItemId, item.name, item.quantity, item.price]
  );
}

export async function listForUser(userId) {
  const [orders] = await pool.query(
    `SELECT o.*, r.name AS restaurant_name, r.image_url AS restaurant_image
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return attachItems(orders);
}

export async function listAllAdmin() {
  const [orders] = await pool.query(
    `SELECT o.*, r.name AS restaurant_name, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC
     LIMIT 300`
  );
  return attachItems(orders);
}

async function attachItems(orders) {
  if (orders.length === 0) return [];
  const ids = orders.map((o) => o.id);
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [ids]);
  const byOrder = {};
  for (const item of items) {
    if (!byOrder[item.order_id]) byOrder[item.order_id] = [];
    byOrder[item.order_id].push(item);
  }
  return orders.map((o) => ({ ...o, items: byOrder[o.id] || [] }));
}

export async function updateStatus(orderId, status) {
  const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return result.affectedRows > 0;
}
