import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/FMrtSHAAPhM?si=8M0nfqPPy1J5SRIP';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="fixed top-6 right-6 z-50 glass-panel rounded-2xl p-4 float-gentle">
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            "hover:scale-105 backdrop-blur-sm border",
            isPlaying 
              ? "bg-golden-warm/20 text-golden-warm border-golden-warm/30 hover:bg-golden-warm/30" 
              : "bg-forest-medium/20 text-forest-mist border-forest-medium/30 hover:bg-forest-medium/30"
          )}
          title={isPlaying ? "Pause YouTube ambiance" : "Play YouTube ambiance"}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-xs text-forest-mist mt-2 text-center">
        {isPlaying ? 'YouTube ambiance playing' : 'Ambiance paused'}
      </div>

      {/* YouTube player */}
      {isPlaying && (
        <div className="mt-4 flex flex-col items-center">
          <iframe
            width="260"
            height="150"
            src={YOUTUBE_EMBED_URL + '&autoplay=1'}
            title="Nature & Piano YouTube Ambience"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          />
          <div className="text-xs text-forest-mist mt-2">Enjoy the YouTube ambiance!</div>
        </div>
      )}
    </div>
  );
}
