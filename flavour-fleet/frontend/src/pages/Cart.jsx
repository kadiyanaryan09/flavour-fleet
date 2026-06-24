import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client.js';

export default function Cart() {
  const { items, updateQuantity, removeItem, restaurantName, refreshCart } = useCart();
  const [bill, setBill] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) {
      setBill(null);
      return;
    }
    api.get('/orders/preview-bill').then(({ data }) => setBill(data)).catch(() => {});
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="font-display font-bold text-xl mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add something tasty from a restaurant near you.</p>
        <Link to="/" className="bg-fleet-500 text-ink font-bold rounded-full px-6 py-3 inline-block">
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="font-display font-extrabold text-2xl mb-1">Your cart</h1>
      <p className="text-gray-500 text-sm mb-6">Ordering from {restaurantName}</p>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.menu_item_id} className="flex items-center gap-3 p-4">
            <span className={`veg-dot ${item.is_veg ? 'veg-dot--veg' : 'veg-dot--nonveg'}`} aria-hidden="true" />
            <div className="flex-1">
              <strong className="text-sm">{item.name}</strong>
              <p className="text-xs text-gray-500">₹{Number(item.price).toFixed(0)} each</p>
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-full px-1">
              <button
                onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                className="w-7 h-7 text-fleet-600 font-bold"
              >
                −
              </button>
              <span className="text-sm w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                className="w-7 h-7 text-fleet-600 font-bold"
              >
                +
              </button>
            </div>
            <span className="text-sm font-semibold w-16 text-right">
              ₹{(Number(item.price) * item.quantity).toFixed(0)}
            </span>
            <button onClick={() => removeItem(item.menu_item_id)} className="text-xs text-chili underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      {bill && (
        <div className="bg-white rounded-2xl shadow-card p-5 mt-5 text-sm space-y-2">
          <h3 className="font-display font-bold text-base mb-2">Bill summary</h3>
          <div className="flex justify-between text-gray-600">
            <span>Item total</span>
            <span>₹{bill.subtotal.toFixed(0)}</span>
          </div>
          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-leaf">
              <span>Discount</span>
              <span>−₹{bill.discountAmount.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>GST (5%)</span>
            <span>₹{bill.gstAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery fee</span>
            <span>{bill.deliveryFee === 0 ? 'FREE' : `₹${bill.deliveryFee.toFixed(0)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2">
            <span>To pay</span>
            <span>₹{bill.totalAmount.toFixed(0)}</span>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-fleet-500 text-ink font-bold rounded-full py-3.5 mt-5 hover:bg-fleet-400"
      >
        Proceed to checkout
      </button>
    </div>
  );
}
