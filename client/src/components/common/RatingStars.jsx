import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, reviewCount, size = 'sm', showNumeric = true }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const rounded = Math.round(rating * 10) / 10;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSizes[size] || iconSizes.sm} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumeric && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rounded > 0 ? rounded.toFixed(1) : 'New'}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
