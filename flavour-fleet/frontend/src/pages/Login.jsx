import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate(location.state?.from?.pathname || '/');
  };

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-extrabold text-2xl mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Sign in to order and track deliveries.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500"
            />
          </label>

          {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-3">{error}</p>}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-fleet-500 text-ink font-bold rounded-full py-3 hover:bg-fleet-400 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-5">
          New here? <Link to="/register" className="text-fleet-600 font-semibold">Create an account</Link>
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Demo accounts: admin@flavourfleet.test / admin123 (admin) · demo@flavourfleet.test / demo1234
        </p>
      </div>
    </div>
  );
}
