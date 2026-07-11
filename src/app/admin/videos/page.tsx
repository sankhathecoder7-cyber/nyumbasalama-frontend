'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import VideosTable from '@/components/admin/VideosTable';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getVideos();
      setVideos(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-2 text-gray-500">Loading videos...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Videos</h1>
        <p className="text-gray-500 text-sm mt-1">Verify and manage all uploaded videos</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
          <button onClick={fetchVideos} className="ml-2 underline">Retry</button>
        </div>
      )}

      <VideosTable videos={videos} onRefresh={fetchVideos} />
    </div>
  );
}
