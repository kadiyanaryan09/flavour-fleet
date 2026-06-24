import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await register(name, email, password, phone);
    setSubmitting(false);
    if (ok) navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-extrabold text-2xl mb-1">Create an account</h1>
        <p className="text-gray-500 text-sm mb-6">Order from your favorite restaurants.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone (optional)</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-fleet-500" />
          </label>

          {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-3">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-fleet-500 text-ink font-bold rounded-full py-3 hover:bg-fleet-400 disabled:opacity-60">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-5">
          Already have an account? <Link to="/login" className="text-fleet-600 font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
