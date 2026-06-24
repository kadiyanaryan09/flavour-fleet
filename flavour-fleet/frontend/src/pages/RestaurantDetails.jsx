import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import MenuItemRow from '../components/MenuItemRow.jsx';
import StarRating from '../components/StarRating.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function RestaurantDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [pendingItem, setPendingItem] = useState(null); // for the replace-cart confirm dialog
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [{ data }, reviewsRes] = await Promise.all([
          api.get(`/restaurants/${id}`),
          api.get(`/restaurants/${id}/reviews`),
        ]);
        setRestaurant(data.restaurant);
        setMenuItems(data.menuItems);
        setReviews(reviewsRes.data.reviews);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAdd = async (item, replace = false) => {
    const result = await addToCart(item.id, 1, replace);
    if (result.ok) {
      setToast(`${item.name} added to cart`);
      setTimeout(() => setToast(''), 1800);
      setPendingItem(null);
    } else if (result.code === 'DIFFERENT_RESTAURANT') {
      setPendingItem(item);
    } else {
      setToast(result.message);
      setTimeout(() => setToast(''), 2500);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError('Pick a star rating first.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      await api.post(`/restaurants/${id}/reviews`, { rating, comment });
      const { data } = await api.get(`/restaurants/${id}/reviews`);
      setReviews(data.reviews);
      setComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not save your review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-5 py-10 text-gray-500">Loading…</div>;
  }
  if (!restaurant) {
    return <div className="max-w-5xl mx-auto px-5 py-10 text-gray-500">Restaurant not found.</div>;
  }

  const grouped = menuItems.reduce((acc, item) => {
    (acc[item.category_name] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="rounded-2xl overflow-hidden h-56 bg-gradient-to-br from-fleet-400 to-chili mb-6">
        {restaurant.image_url && (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl">{restaurant.name}</h1>
          <p className="text-gray-500 mt-1">{restaurant.cuisine} · {restaurant.area}, {restaurant.city}</p>
          <p className="text-gray-500 text-sm mt-2 max-w-lg">{restaurant.description}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1 bg-leaf text-white text-sm font-bold px-2 py-1 rounded">
            ★ {Number(restaurant.computed_rating).toFixed(1)}
          </span>
          <p className="text-sm text-gray-500 mt-1">{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</p>
          <p className="text-sm text-gray-500">₹{restaurant.cost_for_two} for two</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6">
        <h2 className="font-display font-bold text-xl mb-2">Menu</h2>
        {Object.entries(grouped).map(([categoryName, items]) => (
          <div key={categoryName} className="mb-6 last:mb-0">
            <h3 className="font-display font-bold text-base text-fleet-600 mb-1">{categoryName}</h3>
            {items.map((item) => (
              <MenuItemRow key={item.id} item={item} onAdd={(it) => handleAdd(it)} />
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5 md:p-6 mt-6">
        <h2 className="font-display font-bold text-xl mb-4">Reviews</h2>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-6 space-y-3">
            <StarRating value={rating} onChange={setRating} size="lg" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="How was your order?"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm"
            />
            {reviewError && <p className="bg-red-50 text-chili text-sm rounded-lg p-2">{reviewError}</p>}
            <button
              type="submit" disabled={reviewSubmitting}
              className="bg-ink text-white text-sm font-semibold rounded-full px-5 py-2 disabled:opacity-60"
            >
              {reviewSubmitting ? 'Saving…' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6">Sign in to leave a review.</p>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet — be the first.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <strong className="text-sm">{r.reviewer_name}</strong>
                  <StarRating value={r.rating} size="sm" />
                </div>
                {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white px-4 py-3 rounded-lg shadow-card animate-fade-up">
          {toast}
        </div>
      )}

      {pendingItem && (
        <ConfirmDialog
          title="Start a new cart?"
          message={`Your cart has items from another restaurant. Clear it and add "${pendingItem.name}" from ${restaurant.name} instead?`}
          confirmLabel="Clear & add"
          onCancel={() => setPendingItem(null)}
          onConfirm={() => handleAdd(pendingItem, true)}
        />
      )}
    </div>
  );
}
