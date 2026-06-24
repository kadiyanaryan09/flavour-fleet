import { useState } from 'react';

export default function MenuItemRow({ item, onAdd }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = item.image_url && !imageFailed;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`veg-dot ${item.is_veg ? 'veg-dot--veg' : 'veg-dot--nonveg'}`} aria-hidden="true" />
          <h4 className="font-semibold text-sm">{item.name}</h4>
        </div>
        <p className="text-sm text-gray-500 mt-1 max-w-md">{item.description}</p>
        <p className="font-display font-bold text-sm mt-2">₹{Number(item.price).toFixed(0)}</p>
      </div>

      <div className="w-28 shrink-0 relative">
        <div className="h-20 w-28 rounded-xl overflow-hidden bg-gradient-to-br from-fleet-400 to-chili grid place-items-center">
          {showImage ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">🍽️</span>
          )}
        </div>
        <button
          onClick={() => onAdd(item)}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-fleet-500 text-fleet-600 font-bold text-xs rounded-full px-4 py-1 shadow hover:bg-fleet-50"
        >
          ADD
        </button>
      </div>
    </div>
  );
}
