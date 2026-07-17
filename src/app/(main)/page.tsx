'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Home, Video, RefreshCw } from 'lucide-react';
import { propertyApi, videoApi } from '@/lib/api';
import { PRICE_RANGES } from '@/lib/constants';
import PropertyCard from '@/components/property/PropertyCard';
import VideoCard from '@/components/video/VideoCard';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('@/components/maps/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
});

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const fetchProperties = useCallback(async () => {
    setError(null);
    try {
      const res = await propertyApi.getAll({ ...filters, q: searchQuery, limit: 20 });
      const data = res.data?.data || res.data || [];
      setProperties(data);
      if (data.length === 0) {
        setError('No properties found. Try adjusting your filters.');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setProperties([]);
      setError('Failed to load properties. Please check your connection and try again.');
    }
  }, [filters, searchQuery]);

  const fetchVideos = useCallback(async () => {
    try {
      const res = await videoApi.getAll({ limit: 10 });
      const data = res.data?.data || res.data || [];
      setVideos(data);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProperties(), fetchVideos()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchProperties, fetchVideos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-3"
          >
            Find Safe Housing in Dar es Salaam
          </motion.h1>
          <p className="text-lg text-center text-blue-100 mb-6">
            Quality housing near UDSM, ARU, MUHAS, DIT, and all Dar es Salaam universities
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search location, property type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
                />
              </div>
              <button 
                onClick={() => fetchProperties()}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Price Filters */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilters({})}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              !filters.priceRange ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            } transition`}
          >
            All
          </button>
          {PRICE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setFilters({ ...filters, priceRange: range.value })}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                filters.priceRange === range.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              } transition`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => fetchProperties()} 
              className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Properties Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Properties {properties.length > 0 && `(${properties.length})`}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Map
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 mt-2">No properties found matching your criteria</p>
              <button 
                onClick={() => { setFilters({}); setSearchQuery(''); fetchProperties(); }}
                className="mt-3 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )
        ) : (
          <div className="h-[400px] rounded-lg overflow-hidden bg-gray-100">
            <PropertyMap properties={properties} />
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section className="container mx-auto px-4 py-6 border-t border-gray-200">
        <h2 className="text-xl font-bold mb-4">Latest Videos</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 6).map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Video className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500 mt-2">No videos available</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">NyumbaSalama</h3>
              <p className="text-gray-300 text-sm">
                A safe and reliable platform for finding housing for university students in Dar es Salaam.
                Covering UDSM, ARU, MUHAS, DIT, and all other institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Universities</h4>
              <ul className="text-gray-300 text-sm grid grid-cols-2 gap-1">
                <li>UDSM - Mlimani</li>
                <li>ARU - Ardhi</li>
                <li>MUHAS - Upanga</li>
                <li>DIT - City Center</li>
                <li>IFM - City Center</li>
                <li>CBE - City Center</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
