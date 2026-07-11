'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import VideoFeed from '@/components/video/VideoFeed';
import { Filter, Loader2 } from 'lucide-react';
import { videoApi, resolveVideoUrl } from '@/lib/api';

export default function VideosPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = ['All', 'UDSM', 'ARU', 'MUHAS', 'DIT', 'CBE', 'DUCE', 'IFM', '50K-150K', '150K-300K', '300K+'];

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { status: 'VERIFIED' };

      const uniFilters = ['UDSM', 'ARU', 'MUHAS', 'DIT', 'CBE', 'DUCE', 'IFM'];
      if (uniFilters.includes(activeFilter)) {
        params.university = activeFilter;
      }

      const res = await videoApi.getAll(params);
      const resData = res.data;
      let items = resData.data || resData || [];

      // ✅ Filter kwa price kulingana na activeFilter
      if (activeFilter === '50K-150K') {
        items = items.filter((v: any) => v.price >= 50000 && v.price <= 150000);
      } else if (activeFilter === '150K-300K') {
        items = items.filter((v: any) => v.price >= 150000 && v.price <= 300000);
      } else if (activeFilter === '300K+') {
        items = items.filter((v: any) => v.price >= 300000);
      }

      const mapped = items.map((v: any) => ({
        ...v,
        url: resolveVideoUrl(v.url),
        thumbnail: v.thumbnail || resolveVideoUrl(v.url),
        isLiked: false,
        userName: v.userName || 'User',
      }));

      setVideos(mapped);
    } catch (err) {
      console.error('Fetch videos error:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleLike = async (videoId: string) => {
    try {
      await videoApi.like(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, isLiked: !v.isLiked, likes: v.isLiked ? v.likes - 1 : v.likes + 1 }
            : v,
        ),
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housing Videos</h1>
          <p className="text-sm text-gray-500 mt-1">Watch house and room tour videos</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium">
          <Filter className="w-3.5 h-3.5" />
          {videos.length} videos
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <span className="ml-2 text-gray-500">Loading videos...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <VideoFeed videos={videos} onLikeVideo={handleLike} />
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No videos yet. Be the first to upload!</p>
        </div>
      )}
    </div>
  );
}