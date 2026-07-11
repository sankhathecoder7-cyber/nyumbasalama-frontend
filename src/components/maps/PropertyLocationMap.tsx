'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { MapProperty } from '@/types';

interface PropertyLocationMapProps {
  property: MapProperty;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function extractCoords(property: MapProperty): { lat: number; lng: number } | null {
  const lat = property.latitude;
  const lng = property.longitude;
  if (lat == null || lng == null) return null;
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

export default function PropertyLocationMap({ property }: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState('');

  const coords = extractCoords(property);

  const initMap = useCallback(() => {
    if (!mapRef.current || !coords) return;
    if (mapInstanceRef.current) return;
    if (typeof window === 'undefined' || !window.google?.maps) {
      setHasError('Google Maps API not loaded');
      setIsLoading(false);
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 16,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        gestureHandling: 'greedy',
        clickableIcons: false,
      });

      mapInstanceRef.current = map;

      const marker = new google.maps.Marker({
        position: coords,
        map,
        title: property.title,
        animation: google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family:sans-serif;padding:4px 0;max-width:240px">
            <h3 style="font-weight:700;font-size:14px;color:#111;margin:0 0 4px">${property.title}</h3>
            <p style="font-size:13px;color:#666;margin:0">📍 ${property.location}, Dar es Salaam</p>
          </div>
        `,
        maxWidth: 260,
      });

      infoWindow.open(map, marker);

      google.maps.event.addListenerOnce(map, 'idle', () => {
        setIsLoading(false);
      });
    } catch {
      setHasError('Unable to load Google Maps. Please try again later.');
      setIsLoading(false);
    }
  }, [coords, property.title, property.location]);

  useEffect(() => {
    if (!API_KEY) {
      setHasError('Google Maps API key is missing.');
      setIsLoading(false);
      return;
    }

    if (!coords) {
      setHasError('Property location coordinates are invalid.');
      setIsLoading(false);
      return;
    }

    initMap();

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [initMap, coords]);

  if (!API_KEY) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-red-500 font-medium">Google Maps API key is missing.</p>
        <p className="text-sm text-gray-500 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-red-500 font-medium">{hasError}</p>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-500">Location coordinates not available for this property.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-md border border-gray-200 overflow-hidden bg-white mt-6">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-white">
        <MapPin className="w-4 h-4 text-orange-500" />
        <h3 className="font-semibold text-gray-900 text-sm">Property Location</h3>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/80">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-600 font-medium">Loading map...</span>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-[400px]"
          aria-label={`Map showing location of ${property.title}`}
          role="application"
        />
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{property.title}</span>
          {' — '}
          <span className="text-gray-500">{property.location}, Dar es Salaam</span>
        </p>
      </div>
    </div>
  );
}
