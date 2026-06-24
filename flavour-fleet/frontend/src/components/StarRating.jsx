export default function StarRating({ value = 0, count, onChange, size = 'md' }) {
  const interactive = typeof onChange === 'function';
  const sizeClass = { sm: 'text-sm', md: 'text-base', lg: 'text-2xl' }[size];

  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={interactive ? () => onChange(n) : undefined}
          className={`${sizeClass} ${n <= Math.round(value) ? 'text-fleet-500' : 'text-gray-300'} ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
      {typeof count === 'number' && (
        <span className="text-xs text-gray-500 ml-1">
          {value > 0 ? value.toFixed(1) : 'New'} {count > 0 && `(${count})`}
        </span>
      )}
    </span>
  );
}
