'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import VideoCard from './VideoCard';
import { Video } from '@/types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface VideoFeedProps {
  videos: Video[];
  onLikeVideo: (id: string) => void;
}

export default function VideoFeed({ videos, onLikeVideo }: VideoFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < videos.length) {
        setActiveIndex(index);
        const el = containerRef.current;
        if (el) {
          el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' });
        }
      }
    },
    [videos.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 50) goNext();
      else if (e.deltaY < -50) goPrev();
    },
    [goNext, goPrev]
  );

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (delta > 50) goNext();
      else if (delta < -50) goPrev();
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleTouchStart, handleTouchEnd]);

  return (
    <div className="relative h-[85vh] max-w-md mx-auto">
      <div
        ref={containerRef}
        className="h-full overflow-hidden snap-y snap-mandatory scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div key={video.id} className="snap-center h-full flex items-center justify-center">
            <VideoCard
              video={video}
              isActive={index === activeIndex}
              onLike={onLikeVideo}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <button
          onClick={goPrev}
          disabled={activeIndex === 0}
          className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          disabled={activeIndex === videos.length - 1}
          className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
