import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function Checkout() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/orders', {
        deliveryAddress: address,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page page--narrow">
        <h1>Your cart</h1>
        <p className="muted">Nothing in here yet.</p>
        <Link to="/" className="btn">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <h1>Your cart</h1>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.menuItemId} className="cart-list__row">
            <span className="cart-list__emoji">{item.emoji}</span>
            <div className="cart-list__info">
              <strong>{item.name}</strong>
              <span className="muted">${item.price.toFixed(2)} each</span>
            </div>
            <div className="qty-control">
              <button
                type="button"
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                aria-label={`Decrease ${item.name} quantity`}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                aria-label={`Increase ${item.name} quantity`}
              >
                +
              </button>
            </div>
            <span className="cart-list__subtotal">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              type="button"
              className="link-btn"
              onClick={() => removeItem(item.menuItemId)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-total">
        <span>Total</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      {!user ? (
        <div className="banner">
          <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
            Sign in
          </Link>{' '}
          to place your order.
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="form">
          <label>
            Delivery address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Harbor Street, Apt 4B"
              required
            />
          </label>

          {error && <p className="banner banner--error">{error}</p>}

          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
          </button>
        </form>
      )}
    </div>
  );
}
