import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = restaurant.image_url && !imageFailed;

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block bg-white rounded-2xl shadow-card hover:shadow-cardHover hover:-translate-y-1 transition-all duration-200 overflow-hidden animate-fade-up"
    >
      <div className="h-40 bg-gradient-to-br from-fleet-400 to-chili relative">
        {showImage ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-5xl">🍽️</div>
        )}
        {restaurant.discount_text && (
          <span className="absolute bottom-2 left-2 bg-white text-ink text-xs font-bold px-2.5 py-1 rounded-full shadow">
            {restaurant.discount_text}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-base leading-tight">{restaurant.name}</h3>
          <span className="flex items-center gap-1 bg-leaf text-white text-xs font-bold px-1.5 py-0.5 rounded shrink-0">
            ★ {Number(restaurant.computed_rating || restaurant.rating).toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{restaurant.cuisine} · {restaurant.area}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
          <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</span>
          <span>·</span>
          <span>₹{restaurant.cost_for_two} for two</span>
        </div>
      </div>
    </Link>
  );
}
