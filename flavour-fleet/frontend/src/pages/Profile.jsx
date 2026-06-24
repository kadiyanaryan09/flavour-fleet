import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setName(data.user.name);
      setPhone(data.user.phone || '');
    });
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    api.get('/addresses').then(({ data }) => setAddresses(data.addresses));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', { name, phone });
      setSavedMessage('Profile updated.');
      setTimeout(() => setSavedMessage(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setError('Fill in address line, city, state and pincode.');
      return;
    }
    try {
      await api.post('/addresses', newAddress);
      setNewAddress({ label: 'Home', line1: '', line2: '', city: '', state: '', pincode: '' });
      loadAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    await api.delete(`/addresses/${id}`);
    loadAddresses();
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
      <h1 className="font-display font-extrabold text-2xl">My profile</h1>

      {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-3">{error}</p>}

      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Account details</h2>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input value={user?.email} disabled
              className="mt-1 w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400" />
          </label>
          {savedMessage && <p className="text-leaf text-sm">{savedMessage}</p>}
          <button className="bg-ink text-white font-semibold rounded-full px-5 py-2 text-sm">Save changes</button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Saved addresses</h2>

        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">No saved addresses yet.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {addresses.map((a) => (
              <li key={a.id} className="border border-gray-100 rounded-xl p-3 text-sm flex justify-between items-start">
                <div>
                  <strong>{a.label}</strong>{a.is_default ? ' · Default' : ''}
                  <p className="text-gray-500">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(a.id)} className="text-chili text-xs underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer text-fleet-600 font-semibold">Add a new address</summary>
          <form onSubmit={handleAddAddress} className="space-y-3 mt-3">
            <div className="flex gap-3">
              <input placeholder="Label (Home, Work…)" value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Address line" value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3">
              <input placeholder="City" value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="State" value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Pincode" value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={newAddress.isDefault || false}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
              Set as default
            </label>
            <button className="bg-ink text-white text-sm font-semibold rounded-full px-5 py-2">Save address</button>
          </form>
        </details>
      </div>
    </div>
  );
}
