'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, ExternalLink, MapPin } from 'lucide-react';
import { Video } from '@/types';
import Link from 'next/link';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onLike: (id: string) => void;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoCard({ video, isActive, onLike }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const youtubeId = getYouTubeId(video.url);

  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  return (
    <div className="relative w-full h-[85vh] max-w-md mx-auto rounded-3xl overflow-hidden bg-black">
      <div className="absolute inset-0">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&mute=0`}
            className="w-full h-full"
            style={{ border: 0 }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <video
            src={video.url}
            autoPlay={isPlaying}
            loop
            muted={false}
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-white font-bold text-lg leading-tight">{video.title}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
          <div className="flex items-center gap-1.5 text-white/70 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>{video.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-xl">TSh {video.price.toLocaleString()}</p>
            <p className="text-white/60 text-xs">/month</p>
          </div>
          <div className="text-white/80 text-xs">
            {video.university === 'Zote' ? 'UDSM / ARU' : video.university}
          </div>
        </div>

        <Link
          href={`/property/${video.propertyId}`}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-white font-medium text-sm hover:bg-white/30 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View Details
        </Link>
      </div>

      <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5">
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={() => onLike(video.id)}
          className="flex flex-col items-center gap-0.5"
        >
          <div className={`p-2.5 rounded-full ${video.isLiked ? 'bg-red-500' : 'bg-white/20 backdrop-blur-md'}`}>
            <Heart
              className={`w-6 h-6 ${video.isLiked ? 'fill-white text-white' : 'text-white'}`}
            />
          </div>
          <span className="text-white text-xs font-medium">{video.likes}</span>
        </motion.button>

        <button className="flex flex-col items-center gap-0.5">
          <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{video.comments}</span>
        </button>

        <button className="flex flex-col items-center gap-0.5">
          <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-md">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs font-medium">{video.shares}</span>
        </button>

        {video.phone ? (
          <a
            href={`https://wa.me/${video.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5"
          >
            <div className="p-2.5 rounded-full bg-green-500">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-white text-xs font-medium">WhatsApp</span>
          </a>
        ) : (
          <div className="flex flex-col items-center gap-0.5 opacity-50 pointer-events-none">
            <div className="p-2.5 rounded-full bg-white/20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/50">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span className="text-white/50 text-xs font-medium">No WA</span>
          </div>
        )}
      </div>

      <div className="absolute left-4 bottom-64 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
            {video.userName.charAt(0)}
          </div>
          <span className="text-white font-medium text-sm">{video.userName}</span>
        </div>
      </div>
    </div>
  );
}
