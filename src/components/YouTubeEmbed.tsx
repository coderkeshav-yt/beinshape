
import { useState } from 'react';
import { Play, Lock, Youtube, ExternalLink, Shield, Eye, Star } from 'lucide-react';
import PremiumVideoModal from './PremiumVideoModal';

interface YouTubeEmbedProps {
  videoUrl: string;
  title: string;
  isLocked?: boolean;
  onUnlock?: () => void;
  channelUrl?: string;
  showChannelLink?: boolean;
  premium?: boolean;
}

const YouTubeEmbed = ({ 
  videoUrl, 
  title, 
  isLocked = false, 
  onUnlock,
  channelUrl,
  showChannelLink = true,
  premium = true
}: YouTubeEmbedProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract video ID from YouTube URL with better validation
  const getVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&#?]*)/,
      /youtube\.com\/v\/([^&#?]*)/,
      /youtube\.com\/watch\?.*v=([^&#?]*)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(videoUrl);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        {/* Premium Badge */}
        {premium && (
          <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>PREMIUM</span>
          </div>
        )}

        {/* Security Badge */}
        <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Secure</span>
        </div>

        {/* Video Thumbnail */}
        <div className="aspect-video rounded-xl overflow-hidden bg-black relative cursor-pointer"
             onClick={() => setIsModalOpen(true)}>
          
          {/* Thumbnail Image */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLocked ? 'blur-sm opacity-60' : 'group-hover:scale-105'
            }`}
            draggable={false}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 group-hover:from-black/60 transition-all duration-300" />
          
          {/* Play Button / Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLocked ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Premium Content</p>
                <p className="text-gray-300 text-sm">Unlock to watch</p>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-8 h-8 text-black ml-1" />
              </div>
            )}
          </div>

          {/* Video Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white font-bold text-lg md:text-xl mb-2 line-clamp-2">
              {title}
            </h3>
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <Eye className="w-4 h-4" />
              <span>{isLocked ? 'Locked Content' : 'Premium Video'}</span>
            </div>
          </div>

          {/* Security Watermark */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Protected</span>
          </div>
        </div>

        {/* Premium Channel Access */}
        {showChannelLink && channelUrl && !isLocked && (
          <div className="mt-6 bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Exclusive Channel Access</h4>
                  <p className="text-gray-400 text-sm">Get full access to our premium content library</p>
                </div>
              </div>
              <button
                onClick={() => window.open(channelUrl, '_blank', 'noopener,noreferrer')}
                className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 group"
              >
                <Youtube className="w-5 h-5" />
                <span>Visit Channel</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Video Modal */}
      <PremiumVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoId={videoId}
        title={title}
        isLocked={isLocked}
        onUnlock={() => {
          setIsModalOpen(false);
          onUnlock?.();
        }}
      />
    </>
  );
};

export default YouTubeEmbed;
