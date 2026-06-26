import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import MenuCard from '../components/MenuCard.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get('/menu/categories');
        setCategories(data.categories);
      } catch {
        setError('Could not reach the API. Is the backend running on port 5000?');
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const { data } = await api.get('/menu/items', {
          params: activeCategory ? { categoryId: activeCategory } : {},
        });
        setItems(data.items);
        setError('');
      } catch {
        setError('Could not reach the API. Is the backend running on port 5000?');
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, [activeCategory]);

  const handleAdd = (item) => {
    addItem(item);
    setToast(`${item.name} added to cart`);
    setTimeout(() => setToast(''), 1800);
  };

  return (
    <div className="page">
      <section className="hero">
        <p className="hero__eyebrow">Flavour Fleet · dispatched daily</p>
        <h1>Your city's flavour, dispatched.</h1>
        <p className="hero__sub">
          Order from our route — fresh dishes, packed and on the move in minutes.
        </p>
      </section>

      {error && <p className="banner banner--error">{error}</p>}

      <div className="category-tabs">
        <button
          className={`category-tab ${activeCategory === null ? 'is-active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All stops
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading menu…</p>
      ) : items.length === 0 ? (
        <p className="muted">No dishes here yet — try another stop, or run the seed script.</p>
      ) : (
        <div className="menu-grid">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={handleAdd} />
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
