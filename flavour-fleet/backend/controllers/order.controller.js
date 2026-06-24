import crypto from 'crypto';
import pool from '../config/db.js';
import * as cartModel from '../models/cartModel.js';
import * as menuItemModel from '../models/menuItemModel.js';
import * as orderModel from '../models/orderModel.js';
import * as addressModel from '../models/addressModel.js';

const GST_RATE = 0.05; // 5% — standard for non-AC/aggregator food delivery in India
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 40;
const DISCOUNT_RATE = 0.1; // 10% off, capped
const DISCOUNT_CAP = 100;
const DISCOUNT_MIN_SUBTOTAL = 299;

export function computeBill(subtotal) {
  const discountAmount = subtotal >= DISCOUNT_MIN_SUBTOTAL ? Math.min(subtotal * DISCOUNT_RATE, DISCOUNT_CAP) : 0;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * GST_RATE;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalAmount = taxableAmount + gstAmount + deliveryFee;
  return { discountAmount, gstAmount, deliveryFee, totalAmount };
}

export async function previewBill(req, res) {
  try {
    const cartItems = await cartModel.getCart(req.user.id);
    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const bill = computeBill(subtotal);
    res.json({ subtotal, ...bill });
  } catch (err) {
    res.status(500).json({ message: 'Could not calculate bill.', error: err.message });
  }
}

export async function createOrder(req, res) {
  const userId = req.user.id;
  const { addressId, deliveryAddress, cardLast4 } = req.body;

  const conn = await pool.getConnection();
  try {
    const cartItems = await cartModel.getCart(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    let finalAddress = deliveryAddress;
    if (addressId) {
      const addr = await addressModel.findById(addressId, userId);
      if (!addr) return res.status(400).json({ message: 'Address not found.' });
      finalAddress = `${addr.line1}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
    }
    if (!finalAddress || !finalAddress.trim()) {
      return res.status(400).json({ message: 'A delivery address is required.' });
    }

    // Re-validate every line against the database — never trust client prices.
    const menuItemIds = cartItems.map((i) => i.menu_item_id);
    const freshItems = await menuItemModel.findByIds(menuItemIds);
    const freshById = Object.fromEntries(freshItems.map((m) => [m.id, m]));

    const restaurantId = cartItems[0].restaurant_id;
    let subtotal = 0;
    const lines = [];
    for (const cartItem of cartItems) {
      const fresh = freshById[cartItem.menu_item_id];
      if (!fresh || !fresh.is_available) {
        return res.status(400).json({ message: `${cartItem.name} is no longer available.` });
      }
      const unitPrice = Number(fresh.price);
      subtotal += unitPrice * cartItem.quantity;
      lines.push({ menuItemId: fresh.id, name: fresh.name, quantity: cartItem.quantity, price: unitPrice });
    }

    const { discountAmount, gstAmount, deliveryFee, totalAmount } = computeBill(subtotal);
    const transactionId = `MOCK-${crypto.randomUUID()}`;

    await conn.beginTransaction();

    const orderId = await orderModel.createOrder(conn, {
      userId,
      restaurantId,
      addressId: addressId || null,
      deliveryAddress: finalAddress.trim(),
      subtotal,
      discountAmount,
      gstAmount,
      deliveryFee,
      totalAmount,
      paymentMethod: 'mock_card',
      transactionId,
    });

    for (const line of lines) {
      await orderModel.addOrderItem(conn, orderId, line);
    }

    await conn.commit();
    await cartModel.clearCart(userId);

    res.status(201).json({
      message: 'Order placed!',
      order: { id: orderId, totalAmount: totalAmount.toFixed(2), transactionId },
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
    const orders = await orderModel.listForUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Could not load orders.', error: err.message });
  }
}
