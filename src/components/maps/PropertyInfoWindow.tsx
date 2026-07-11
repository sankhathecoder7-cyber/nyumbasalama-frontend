'use client';

import { MapProperty } from '@/types';

interface PropertyInfoWindowProps {
  property: MapProperty;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400';

export default function PropertyInfoWindow({ property }: PropertyInfoWindowProps) {
  const imageSrc = property.images?.[0] || DEFAULT_IMAGE;
  const universityLabel = property.university
    ? property.university === 'BOTH'
      ? 'All Universities'
      : property.university
    : null;

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/property/${property.id}`;
  };

  return (
    <div className="min-w-[240px] max-w-[280px] font-sans" onClick={(e) => e.stopPropagation()}>
      <div
        className="w-full h-32 bg-cover bg-center rounded-t-lg"
        style={{ backgroundImage: `url(${imageSrc})` }}
        role="img"
        aria-label={property.title}
      />
      <div className="p-3 space-y-1.5">
        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate" title={property.title}>
          {property.title}
        </h3>
        <p className="text-orange-600 font-bold text-base">
          TSh {property.price.toLocaleString()}/month
        </p>
        <p className="text-gray-500 text-xs truncate" title={property.location}>
          📍 {property.location}, Dar es Salaam
        </p>
        {universityLabel && (
          <p className="text-gray-400 text-xs">🎓 {universityLabel}</p>
        )}
        <button
          onClick={handleViewDetails}
          className="mt-1 w-full py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
