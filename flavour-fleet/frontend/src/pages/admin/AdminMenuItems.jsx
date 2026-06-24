import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const emptyForm = {
  id: null, restaurantId: '', categoryId: '', name: '', description: '', price: '',
  imageUrl: '', isVeg: true, isAvailable: true,
};

export default function AdminMenuItems() {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = filterRestaurant ? { restaurantId: filterRestaurant } : {};
    Promise.all([
      api.get('/admin/menu-items', { params }),
      api.get('/admin/restaurants'),
      api.get('/restaurants/categories'),
    ]).then(([itemsRes, restRes, catRes]) => {
      setItems(itemsRes.data.items);
      setRestaurants(restRes.data.restaurants);
      setCategories(catRes.data.categories);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [filterRestaurant]);

  const handleEdit = (item) => {
    setForm({
      id: item.id, restaurantId: item.restaurant_id, categoryId: item.category_id, name: item.name,
      description: item.description || '', price: item.price, imageUrl: item.image_url || '',
      isVeg: !!item.is_veg, isAvailable: !!item.is_available,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    await api.delete(`/admin/menu-items/${id}`);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (form.id) await api.put(`/admin/menu-items/${form.id}`, form);
      else await api.post('/admin/menu-items', form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-5 mb-6 space-y-3 max-w-2xl">
        <h3 className="font-display font-bold">{form.id ? `Editing: ${form.name}` : 'Add a menu item'}</h3>
        <div className="flex gap-3">
          <select value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
            <option value="">Restaurant…</option>
            {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" required>
            <option value="">Category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <div className="flex gap-3">
          <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
          <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} />
            Vegetarian
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            Available
          </label>
        </div>

        {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-2">{error}</p>}

        <div className="flex gap-3">
          <button disabled={submitting} className="bg-fleet-500 text-ink font-bold rounded-full px-5 py-2 text-sm disabled:opacity-60">
            {submitting ? 'Saving…' : form.id ? 'Save changes' : 'Add item'}
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(emptyForm)} className="border border-gray-200 rounded-full px-5 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      <select value={filterRestaurant} onChange={(e) => setFilterRestaurant(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 bg-white">
        <option value="">All restaurants</option>
        {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr><th className="p-3">Item</th><th className="p-3">Restaurant</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.restaurant_name}</td>
                  <td className="p-3">{item.category_name}</td>
                  <td className="p-3">₹{Number(item.price).toFixed(0)}</td>
                  <td className="p-3 flex gap-3">
                    <button onClick={() => handleEdit(item)} className="text-fleet-600 underline">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-chili underline">Delete</button>
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
