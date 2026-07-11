'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { MapProperty } from '@/types';
import { createRoot, Root } from 'react-dom/client';
import PropertyInfoWindow from './PropertyInfoWindow';

interface PropertyMapProps {
  properties: MapProperty[];
}

const DAR_ES_SALAAM_CENTER = { lat: -6.7924, lng: 39.2083 };
const DEFAULT_ZOOM = 12;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function extractCoords(property: MapProperty): { lat: number; lng: number } | null {
  const lat = property.latitude;
  const lng = property.longitude;
  if (lat == null || lng == null) return null;
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState('');

  const validProperties = useMemo(() => {
    return properties.filter((p) => extractCoords(p) !== null);
  }, [properties]);

  const initMap = useCallback(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;
    if (typeof window === 'undefined' || !window.google?.maps) {
      setHasError('Google Maps API not loaded');
      setIsLoading(false);
      return;
    }

    try {
      const map = new google.maps.Map(mapRef.current, {
        center: DAR_ES_SALAAM_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        gestureHandling: 'greedy',
        clickableIcons: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow({
        maxWidth: 300,
      });

      google.maps.event.addListenerOnce(map, 'idle', () => {
        setIsLoading(false);
      });
    } catch {
      setHasError('Unable to load Google Maps. Please try again later.');
      setIsLoading(false);
    }
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  const createMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;
    clearMarkers();

    validProperties.forEach((property) => {
      const coords = extractCoords(property);
      if (!coords) return;

      const markerEl = document.createElement('div');
      markerEl.innerHTML = `<div style="background:#f97316;color:#fff;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer">TSh ${property.price.toLocaleString()}</div>`;

      const marker = new google.maps.Marker({
        position: coords,
        map,
        title: property.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="18" r="16" fill="#f97316" stroke="#fff" stroke-width="3"/>
              <text x="20" y="24" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold" font-family="sans-serif">🏠</text>
              <polygon points="20,34 12,28 28,28" fill="#f97316" stroke="#fff" stroke-width="2"/>
            </svg>`
          ),
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 42),
        },
        animation: google.maps.Animation.DROP,
      });

      const infoDiv = document.createElement('div');
      let root: Root | null = null;

      marker.addListener('googleMapsApiReady', () => {});
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        if (!root) {
          root = createRoot(infoDiv);
        }

        root.render(
          PropertyInfoWindow({ property }),
        );

        // Small delay to allow render
        setTimeout(() => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(infoDiv);
            infoWindowRef.current.open(map, marker);
          }
        }, 50);
      });

      markersRef.current.push(marker);
    });
  }, [validProperties, clearMarkers]);

  useEffect(() => {
    if (!API_KEY) {
      setHasError('Google Maps API key is missing.');
      setIsLoading(false);
      return;
    }

    initMap();
  }, [initMap]);

  useEffect(() => {
    if (mapInstanceRef.current && validProperties.length > 0) {
      createMarkers();
    }
  }, [createMarkers, validProperties.length]);

  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [clearMarkers]);

  if (!API_KEY) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <p className="text-red-500 font-medium">Google Maps API key is missing.</p>
        <p className="text-sm text-gray-500 mt-1">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96 text-center p-6">
        <p className="text-red-500 font-medium">{hasError}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden border bg-white">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/80">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-600 font-medium">Loading map...</span>
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full h-[350px] md:h-[450px] lg:h-[600px]"
          aria-label="Map showing all properties near Dar es Salaam universities"
          role="application"
        />
        {validProperties.length === 0 && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100/80 pointer-events-none">
            <p className="text-gray-500">No properties with valid locations to display on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
}
