import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const emptyForm = {
  id: null, name: '', cuisine: '', description: '', imageUrl: '', area: '', city: 'Meerut',
  rating: 4.0, costForTwo: 300, deliveryTimeMin: 25, deliveryTimeMax: 35, discountText: '', isActive: true,
};

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/restaurants').then(({ data }) => setRestaurants(data.restaurants)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleEdit = (r) => {
    setForm({
      id: r.id, name: r.name, cuisine: r.cuisine, description: r.description || '', imageUrl: r.image_url || '',
      area: r.area || '', city: r.city, rating: r.rating, costForTwo: r.cost_for_two,
      deliveryTimeMin: r.delivery_time_min, deliveryTimeMax: r.delivery_time_max,
      discountText: r.discount_text || '', isActive: !!r.is_active,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this restaurant and all its menu items?')) return;
    await api.delete(`/admin/restaurants/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (form.id) await api.put(`/admin/restaurants/${form.id}`, form);
      else await api.post('/admin/restaurants', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save restaurant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 mb-6 space-y-3 max-w-2xl">
        <h3 className="font-display font-bold">{form.id ? `Editing: ${form.name}` : 'Add a restaurant'}</h3>
        <div className="flex gap-3">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Cuisine" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <input placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <input type="number" step="0.1" min="1" max="5" placeholder="Rating" value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Cost for two" value={form.costForTwo}
            onChange={(e) => setForm({ ...form, costForTwo: e.target.value })}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Min mins" value={form.deliveryTimeMin}
            onChange={(e) => setForm({ ...form, deliveryTimeMin: e.target.value })}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Max mins" value={form.deliveryTimeMax}
            onChange={(e) => setForm({ ...form, deliveryTimeMax: e.target.value })}
            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <input placeholder="Discount text (e.g. 50% OFF up to ₹100)" value={form.discountText}
          onChange={(e) => setForm({ ...form, discountText: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          Active (visible to customers)
        </label>

        {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-2">{error}</p>}

        <div className="flex gap-3">
          <button disabled={submitting} className="bg-fleet-500 text-ink font-bold rounded-full px-5 py-2 text-sm disabled:opacity-60">
            {submitting ? 'Saving…' : form.id ? 'Save changes' : 'Add restaurant'}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(emptyForm)} className="border border-gray-200 rounded-full px-5 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr><th className="p-3">Name</th><th className="p-3">Cuisine</th><th className="p-3">Rating</th><th className="p-3">Active</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.cuisine}</td>
                  <td className="p-3">★ {r.rating}</td>
                  <td className="p-3">{r.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => handleEdit(r)} className="text-fleet-600 underline">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-chili underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
