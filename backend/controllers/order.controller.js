import pool from '../db/pool.js';

// Creates an order. Prices are re-read from the database (never trusted from
// the client) so a tampered request body can't change what gets charged.
export async function createOrder(req, res) {
  const { items, deliveryAddress } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty.' });
  }
  if (!deliveryAddress || !deliveryAddress.trim()) {
    return res.status(400).json({ message: 'A delivery address is required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const menuItemIds = items.map((i) => i.menuItemId);
    const [menuRows] = await conn.query(
      `SELECT id, name, price FROM menu_items WHERE id IN (?) AND is_available = 1`,
      [menuItemIds]
    );

    if (menuRows.length !== menuItemIds.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'One or more items are no longer available.' });
    }

    const priceById = Object.fromEntries(menuRows.map((m) => [m.id, m]));
    let total = 0;
    for (const item of items) {
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'Quantity must be at least 1.' });
      }
      total += Number(priceById[item.menuItemId].price) * qty;
    }

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, status, total_amount, delivery_address)
       VALUES (?, 'placed', ?, ?)`,
      [userId, total.toFixed(2), deliveryAddress.trim()]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      const menuItem = priceById[item.menuItemId];
      await conn.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price_at_order)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, menuItem.id, menuItem.name, item.quantity, menuItem.price]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: 'Order placed!',
      order: { id: orderId, totalAmount: total.toFixed(2), status: 'placed' },
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Could not place order.', error: err.message });
  } finally {
    conn.release();
  }
}

export async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT id, status, total_amount, delivery_address, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(
      `SELECT order_id, item_name, quantity, price_at_order
       FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrder = {};
    for (const item of items) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const result = orders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    res.json({ orders: result });
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
}
