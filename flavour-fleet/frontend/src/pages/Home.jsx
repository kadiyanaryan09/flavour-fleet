import { useEffect, useState } from 'react';
import api from '../api/client.js';
import RestaurantCard from '../components/RestaurantCard.jsx';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sort, setSort] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/restaurants/cuisines')
      .then(({ data }) => setCuisines(data.cuisines))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/restaurants', {
          params: {
            ...(search ? { search } : {}),
            ...(cuisine ? { cuisine } : {}),
            ...(sort ? { sort } : {}),
            ...(vegOnly ? { veg: '1' } : {}),
          },
        });
        setRestaurants(data.restaurants);
        setError('');
      } catch {
        setError('Could not reach the API. Is the backend running on port 5000?');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, cuisine, sort, vegOnly]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <section className="mb-8">
        <p className="text-fleet-600 font-semibold text-sm uppercase tracking-wide mb-1">Meerut · delivering now</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-ink max-w-xl">
          Order food from your city's best restaurants
        </h1>
        <p className="text-gray-500 mt-2 max-w-lg">
          Real menus, real prices, fast delivery — pick a restaurant and dig in.
        </p>
      </section>

      {error && <p className="bg-red-50 text-chili text-sm rounded-lg p-3 mb-4">{error}</p>}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search restaurants or cuisines…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-fleet-500"
        />
        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2.5 text-sm bg-white"
        >
          <option value="">All cuisines</option>
          {cuisines.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-2.5 text-sm bg-white"
        >
          <option value="">Sort: relevance</option>
          <option value="rating_desc">Rating: high to low</option>
          <option value="delivery_time_asc">Delivery time</option>
          <option value="cost_asc">Cost: low to high</option>
          <option value="cost_desc">Cost: high to low</option>
        </select>
        <label className="flex items-center gap-2 text-sm border border-gray-200 rounded-full px-4 py-2.5 bg-white cursor-pointer">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
          <span className="veg-dot veg-dot--veg" aria-hidden="true" />
          Pure veg
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-card">
              <div className="h-40 skeleton animate-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 skeleton animate-shimmer rounded" />
                <div className="h-3 w-1/2 skeleton animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500">No restaurants match — try a different search or filter.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  );
}
