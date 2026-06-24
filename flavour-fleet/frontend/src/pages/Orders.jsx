import { useEffect, useState, useCallback } from 'react';
import api from '../api/client.js';

const STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

function Stepper({ status }) {
  if (status === 'cancelled') {
    return <p className="text-chili font-semibold text-sm mt-2">Order cancelled</p>;
  }
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center mt-3 mb-1">
      {STEPS.map((step, idx) => (
        <div key={step.key} className="flex-1 flex flex-col items-center relative">
          {idx < STEPS.length - 1 && (
            <span
              className={`absolute top-[5px] left-1/2 w-full h-0.5 ${idx < currentIndex ? 'bg-fleet-500' : 'bg-gray-200'}`}
            />
          )}
          <span
            className={`w-3 h-3 rounded-full relative z-10 ${idx <= currentIndex ? 'bg-fleet-500' : 'bg-gray-200'} ${idx === currentIndex ? 'ring-4 ring-fleet-100' : ''}`}
          />
          <span className={`text-[10px] uppercase font-semibold mt-1 ${idx <= currentIndex ? 'text-ink' : 'text-gray-400'}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/mine');
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="font-display font-extrabold text-2xl mb-6">Your orders</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed an order yet.</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="font-display">{order.restaurant_name}</strong>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className="text-sm font-bold">₹{Number(order.total_amount).toFixed(0)}</span>
              </div>

              <Stepper status={order.status} />

              <p className="text-xs text-gray-500 mt-2">Delivering to: {order.delivery_address}</p>

              <ul className="text-sm mt-3 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-gray-600">
                    <span>{item.quantity} × {item.item_name}</span>
                    <span>₹{(item.quantity * item.price_at_order).toFixed(0)}</span>
                  </li>
                ))}
              </ul>

              <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 space-y-0.5">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(0)}</span></div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-leaf"><span>Discount</span><span>−₹{Number(order.discount_amount).toFixed(0)}</span></div>
                )}
                <div className="flex justify-between"><span>GST</span><span>₹{Number(order.gst_amount).toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{Number(order.delivery_fee) === 0 ? 'FREE' : `₹${Number(order.delivery_fee).toFixed(0)}`}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
