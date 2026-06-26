import { useEffect, useState } from 'react';
import api from '../api/client.js';

const STATUS_LABEL = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data } = await api.get('/orders/mine');
        setOrders(data.orders);
      } catch {
        setError('Could not load your orders.');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  return (
    <div className="page page--narrow">
      <h1>Your orders</h1>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="banner banner--error">{error}</p>}
      {!loading && orders.length === 0 && (
        <p className="muted">You haven't placed an order yet.</p>
      )}

      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id} className="order-card">
            <div className="order-card__header">
              <strong>Order #{order.id}</strong>
              <span className={`status-pill status-pill--${order.status}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            <p className="muted">{new Date(order.created_at).toLocaleString()}</p>
            <p className="muted">Delivering to: {order.delivery_address}</p>
            <ul className="order-card__items">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.quantity} × {item.item_name}
                  <span>${(item.quantity * item.price_at_order).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="order-card__total">
              <span>Total</span>
              <strong>${Number(order.total_amount).toFixed(2)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
