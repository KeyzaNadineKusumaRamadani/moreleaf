import { Star } from 'lucide-react';
import { useState } from 'react';

export const RatingStars = ({ rating = 0, size = 16, showValue = false }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
    {showValue && <span className="text-sm text-gray-500 ml-1">{Number(rating).toFixed(1)}</span>}
  </div>
);

export const RatingInput = ({ value, onChange, size = 24 }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          type="button"
          key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Beri rating ${i}`}
        >
          <Star
            size={size}
            className={(hover || value) >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
};
