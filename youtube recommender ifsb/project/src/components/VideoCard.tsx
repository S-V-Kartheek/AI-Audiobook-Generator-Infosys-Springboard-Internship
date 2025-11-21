import { YouTubeVideo } from '../types/youtube';
import { Clock, Eye, ThumbsUp } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function VideoCard({ video }: VideoCardProps) {
  const handleClick = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-gray-300 hover:-translate-y-1"
    >
      <div className="relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-sm font-medium flex items-center gap-1.5 shadow-lg">
          <Clock size={14} />
          <span>{formatDuration(video.duration)}</span>
        </div>
        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          Score: {video.score.toFixed(1)}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>

        <p className="text-sm text-gray-600 font-medium mb-4">{video.channelTitle}</p>

        <div className="flex items-center gap-5 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-gray-100 rounded">
              <Eye size={14} className="text-gray-600" />
            </div>
            <span className="font-medium">{formatNumber(video.viewCount)}</span>
          </div>

          {video.likeCount && (
            <div className="flex items-center gap-1.5">
              <div className="p-1 bg-blue-50 rounded">
                <ThumbsUp size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">{formatNumber(video.likeCount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
