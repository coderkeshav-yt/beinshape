
import { useState, useEffect } from 'react';
import { X, Play, Lock, Shield, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  title: string;
  isLocked?: boolean;
  onUnlock?: () => void;
  showSecurityNotice?: boolean;
}

const PremiumVideoModal = ({ 
  isOpen, 
  onClose, 
  videoId, 
  title, 
  isLocked = false, 
  onUnlock,
  showSecurityNotice = true 
}: PremiumVideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // Security: Disable right-click and common keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isOpen]);

  const handlePlayClick = () => {
    if (isLocked && onUnlock) {
      onUnlock();
      return;
    }
    setIsPlaying(true);
    setShowPlayer(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Security Notice */}
      {showSecurityNotice && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Secure Player</span>
        </div>
      )}

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 text-white hover:bg-white/20 z-50"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Modal Content */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          {/* Video Container */}
          <div className="aspect-video relative bg-black">
            {!showPlayer ? (
              // Thumbnail with Play Button
              <div 
                className="relative w-full h-full cursor-pointer group"
                onClick={handlePlayClick}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={title}
                  className={`w-full h-full object-cover ${isLocked ? 'blur-sm opacity-50' : ''}`}
                  draggable={false}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  {isLocked ? (
                    <div className="text-center">
                      <Lock className="w-16 h-16 text-white mb-4 mx-auto" />
                      <p className="text-white text-lg font-semibold mb-2">Premium Content</p>
                      <p className="text-gray-300 text-sm mb-4">Enroll to unlock this video</p>
                      <Button
                        onClick={handlePlayClick}
                        className="bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] hover:from-[#d4a82a] hover:to-[#e6c235] text-black font-semibold"
                      >
                        Enroll Now
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-[#e3bd30] to-[#f4d03f] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                  )}
                </div>

                {/* Security Watermark */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Protected</span>
                </div>
              </div>
            ) : (
              // YouTube Player
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&origin=${window.location.origin}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ pointerEvents: 'auto' }}
              />
            )}
          </div>

          {/* Video Info */}
          <div className="p-6 bg-gradient-to-r from-gray-900 to-black">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Premium Content • Secure Playback</span>
              </div>
              {!isLocked && (
                <div className="flex items-center space-x-1 text-[#e3bd30] text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Unlocked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
};

export default PremiumVideoModal;
