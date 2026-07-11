'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Heart, Bed, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Property } from '@/types';
import MapIcon from '@/components/ui/MapIcon';

interface PropertyCardProps {
  property: Property;
  index: number;
}

const statusConfig: Record<Property['status'], { icon: typeof CheckCircle; label: string; color: string }> = {
  Inapatikana: { icon: CheckCircle, label: 'Available', color: 'text-green-600 bg-green-50' },
  Imekodishwa: { icon: AlertCircle, label: 'Rented', color: 'text-red-600 bg-red-50' },
  Inashikiliwa: { icon: Clock, label: 'On Hold', color: 'text-yellow-600 bg-yellow-50' },
};

export default function PropertyCard({ property, index }: PropertyCardProps) {
  const status = statusConfig[property.status];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-orange-50 transition-all duration-300"
    >
      <Link href={`/property/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          <span className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="text-white font-bold text-lg">
              TSh {property.price.toLocaleString()}
              <span className="text-white/70 text-xs font-normal">/month</span>
            </span>
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs font-medium text-gray-700">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {property.rating}
            </span>
          </div>

          {/* ✅ Google Map Icon - Top Right of Image */}
          {property.latitude && property.longitude && (
            <a
              href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-14 p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md"
              onClick={(e) => e.stopPropagation()}
              title="View on Google Maps"
            >
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </a>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
              {property.title}
            </h3>
            <span className="flex-shrink-0 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-medium">
              {property.type}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{property.location}</span>
            <span className="text-gray-300">|</span>
            <Bed className="w-3.5 h-3.5" />
            <span>{property.type}</span>
          </div>

          {/* ✅ Google Map Link - Below Location */}
          {property.latitude && property.longitude && (
            <div className="mb-2">
              <MapIcon 
                latitude={property.latitude} 
                longitude={property.longitude} 
                label="📍 View on Map"
                className="text-xs"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[10px]"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-0.5 text-orange-500 text-[10px] font-medium">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}