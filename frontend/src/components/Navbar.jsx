import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">FF</span>
          <span className="brand__name">Flavour&nbsp;Fleet</span>
        </Link>

        <nav className="navbar__links">
          <Link to="/">Menu</Link>
          {user && <Link to="/orders">Orders</Link>}
          <Link to="/checkout" className="navbar__cart">
            Cart
            {itemCount > 0 && <span className="navbar__cart-badge">{itemCount}</span>}
          </Link>
          {user ? (
            <button className="navbar__ghost-btn" onClick={handleLogout}>
              Sign out
            </button>
          ) : (
            <Link to="/login" className="navbar__cta">
              Sign in
            </Link>
          )}
        </nav>
      </div>
      <div className="route-line" aria-hidden="true" />
    </header>
  );
}
