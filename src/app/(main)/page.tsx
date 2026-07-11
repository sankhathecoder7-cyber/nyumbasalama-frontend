'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, Zap, Loader2, Film, Play } from 'lucide-react';
import { videoApi, propertyApi, resolveVideoUrl } from '@/lib/api';
import { PRICE_RANGES, UNIVERSITIES } from '@/lib/constants';
import PropertyMap from '@/components/maps/PropertyMap';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MapProperty } from '@/types';

interface VideoData {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  university: string;
  url: string;
  thumbnail: string;
  status: string;
  userId: string;
  userName: string;
  phone?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

export default function HomePage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [properties, setProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const uniDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (uniDropdownRef.current && !uniDropdownRef.current.contains(e.target as Node)) {
        setShowUniDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchVideos = useCallback(
    async (query: string, activeFilters: Record<string, string>) => {
      setLoading(true);
      setError('');
      try {
        const params: Record<string, any> = { status: 'VERIFIED' };
        if (query) params.query = query;
        if (activeFilters.university) params.university = activeFilters.university;
        if (activeFilters.priceRange) {
          const range = PRICE_RANGES.find((r) => r.value === activeFilters.priceRange);
          if (range) {
            params.minPrice = range.min;
            params.maxPrice = range.max;
          }
        }

        const res = await videoApi.getAll(params);
        const resData = res.data;
        const items = resData.data || resData || [];

        const mapped = items.map((v: any) => ({
          ...v,
          url: resolveVideoUrl(v.url),
          thumbnail: v.thumbnail || resolveVideoUrl(v.url),
          userName: v.userName || 'User',
          latitude: v.latitude || null,
          longitude: v.longitude || null,
        }));

        setVideos(Array.isArray(mapped) ? mapped : []);
        if (resData.meta) setMeta(resData.meta);
      } catch {
        setError('Failed to load videos. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchProperties = useCallback(async () => {
    try {
      const res = await propertyApi.getAll({ limit: 50 });
      const resData = res.data;
      const items = resData.data || resData || [];

      const mapped: MapProperty[] = Array.isArray(items)
        ? items.map((p: any) => ({
            id: p.id,
            title: p.title,
            latitude: p.latitude,
            longitude: p.longitude,
            price: p.price,
            location: p.location,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
            university: p.university,
          }))
        : [];

      setProperties(mapped);
    } catch {
      // Silently fail - map is not critical
    }
  }, []);

  useEffect(() => {
    fetchVideos('', {});
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (query: string, activeFilters: Record<string, string>) => {
    setSearchQuery(query);
    setFilters(activeFilters);
    fetchVideos(query, activeFilters);
  };

  const stats = [
    { icon: Sparkles, label: 'Houses', value: meta.total.toString() || '0' },
    { icon: TrendingUp, label: 'Students', value: '5,000+' },
    { icon: Shield, label: 'Verified', value: '100%' },
    { icon: Zap, label: 'Videos', value: meta.total.toString() || '0' },
  ];

  // Filter videos for display
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (filters.priceRange) {
      const range = PRICE_RANGES.find((r) => r.value === filters.priceRange);
      if (range) {
        matchesPrice = video.price >= range.min && video.price <= range.max;
      }
    }
    
    const matchesUniversity = !filters.university || video.university === filters.university;
    
    return matchesSearch && matchesPrice && matchesUniversity;
  });

  return (
    <>
      <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmN2FlZGUiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100/80 text-orange-700 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Find Safe Housing in Dar es Salaam
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Find{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Quality Housing
              </span>{' '}
              Near{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Campus
              </span>
            </h1>

            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
              For students at UDSM, ARU, MUHAS, DIT, and all Dar es Salaam universities. Find rooms, studios, and houses at affordable prices starting from TSh 50,000!
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-full shadow-lg p-2 flex items-center">
                <input
                  type="text"
                  placeholder="Search location, property type..."
                  className="flex-1 p-3 outline-none text-gray-700 rounded-full"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value, filters)}
                />
                <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition">
                  Search
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() => {
                    const newFilters = { ...filters };
                    if (filters.priceRange === range.value) {
                      delete newFilters.priceRange;
                    } else {
                      newFilters.priceRange = range.value;
                    }
                    setFilters(newFilters);
                    fetchVideos(searchQuery, newFilters);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.priceRange === range.value
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-100'
                  }`}
                >
                  TSh {range.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ✅ Map Section - Inaonyesha properties zote kwenye ramani */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Nearby Properties Map</h2>
        <PropertyMap properties={properties} />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center"
            >
              <stat.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Houses</h2>
            <p className="text-sm text-gray-500 mt-1">{filteredVideos.length} houses found</p>
          </div>
          <div className="flex gap-2 relative" ref={uniDropdownRef}>
            <button
              onClick={() => setShowUniDropdown(!showUniDropdown)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white flex items-center gap-1"
            >
              {filters.university || 'University'}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUniDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-30 max-h-60 overflow-y-auto w-40">
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters.university;
                    setFilters(newFilters);
                    fetchVideos(searchQuery, newFilters);
                    setShowUniDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 rounded-t-xl"
                >
                  All Universities
                </button>
                {UNIVERSITIES.map((uni) => (
                  <button
                    key={uni.value}
                    onClick={() => {
                      const newFilters = { ...filters };
                      newFilters.university = uni.value;
                      setFilters(newFilters);
                      fetchVideos(searchQuery, newFilters);
                      setShowUniDropdown(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 ${
                      filters.university === uni.value ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {uni.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && videos.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading videos...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchVideos(searchQuery, filters)}
              className="mt-3 text-orange-600 font-medium text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredVideos.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => window.location.href = '/videos'}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group"
              >
                <div className="relative h-48 bg-gray-200">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    muted
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                    <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Film className="w-3 h-3" /> Video Tour
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{video.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-orange-600">
                      TSh {video.price?.toLocaleString() || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">{video.location || 'N/A'}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {video.university || 'BOTH'}
                    </span>
                    <span className="text-xs text-gray-400">❤️ {video.likes || 0}</span>
                    {video.phone && (
                      <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
                        <WhatsAppButton phone={video.phone} className="!py-1 !px-2 !text-[10px] !rounded-lg" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">No houses found for these filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                fetchVideos('', {});
              }}
              className="mt-3 text-orange-600 font-medium text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </>
  );
}