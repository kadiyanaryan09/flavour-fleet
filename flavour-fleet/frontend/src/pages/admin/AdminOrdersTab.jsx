import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/admin/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleStatusChange = async (id, status) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (orders.length === 0) return <p className="text-gray-500">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex justify-between items-start">
            <div>
              <strong>Order #{order.id} · {order.restaurant_name}</strong>
              <p className="text-xs text-gray-500">{order.customer_name} · {order.customer_email}</p>
              <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(order.id, e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm capitalize"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <ul className="text-sm mt-3 space-y-1">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-gray-600">
                <span>{item.quantity} × {item.item_name}</span>
                <span>₹{(item.quantity * item.price_at_order).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-sm border-t border-gray-100 pt-2 mt-2">
            <span>Total</span><span>₹{Number(order.total_amount).toFixed(0)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
