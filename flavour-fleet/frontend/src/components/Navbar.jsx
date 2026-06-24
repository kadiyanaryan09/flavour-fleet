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
    <header className="sticky top-0 z-30 bg-ink">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-fleet-500 text-ink font-display font-extrabold w-9 h-9 rounded-lg grid place-items-center">
            FF
          </span>
          <span className="text-white font-display font-bold text-lg tracking-tight">Flavour Fleet</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link to="/" className="text-cream/90 hover:text-white font-medium">
            Restaurants
          </Link>
          {user && (
            <Link to="/orders" className="text-cream/90 hover:text-white font-medium">
              Orders
            </Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className="text-cream/90 hover:text-white font-medium">
              Admin
            </Link>
          )}
          <Link to="/cart" className="relative text-cream/90 hover:text-white font-medium">
            Cart
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -top-2 -right-3 bg-chili text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-badge-pop"
              >
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="text-cream/90 hover:text-white font-medium">
                {user.name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="border border-cream/40 text-cream rounded-full px-3 py-1.5 text-xs hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-fleet-500 text-ink font-semibold rounded-full px-4 py-1.5 hover:bg-fleet-400"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
      <div className="relative h-1 overflow-hidden bg-[repeating-linear-gradient(90deg,theme(colors.fleet.500)_0px,theme(colors.fleet.500)_18px,transparent_18px,transparent_30px)]">
        <span className="absolute -top-1 w-2 h-2 rounded-full bg-chili shadow-[0_0_0_3px_rgba(230,57,70,0.25)] animate-drive" />
      </div>
    </header>
  );
}
