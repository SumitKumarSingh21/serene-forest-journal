import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const NATURE_SOUND_URL = '/sounds/nature.mp3';
const PIANO_SOUND_URL = '/sounds/piano.mp3';

const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/FMrtSHAAPhM?si=8M0nfqPPy1J5SRIP';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const natureAudioRef = useRef<HTMLAudioElement | null>(null);
  const pianoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Start both audio tracks and loop them
  const startAmbientSounds = async () => {
    try {
      if (!natureAudioRef.current) {
        natureAudioRef.current = new Audio(NATURE_SOUND_URL);
        natureAudioRef.current.loop = true;
        natureAudioRef.current.volume = volume * 0.7;
      }
      if (!pianoAudioRef.current) {
        pianoAudioRef.current = new Audio(PIANO_SOUND_URL);
        pianoAudioRef.current.loop = true;
        pianoAudioRef.current.volume = volume * 0.5;
      }
      await natureAudioRef.current.play();
      await pianoAudioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Could not play ambient sounds:', err);
      alert('Local audio autoplay blocked. Use the YouTube player below!');
      setIsPlaying(true); // Still show as playing, just YouTube instead
    }
  };

  const stopAmbientSounds = () => {
    natureAudioRef.current?.pause();
    if (natureAudioRef.current) natureAudioRef.current.currentTime = 0;
    pianoAudioRef.current?.pause();
    if (pianoAudioRef.current) pianoAudioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAmbientSounds();
    } else {
      startAmbientSounds();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (natureAudioRef.current) natureAudioRef.current.volume = newVolume * 0.7;
    if (pianoAudioRef.current) pianoAudioRef.current.volume = newVolume * 0.5;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbientSounds();
    };
  }, []);

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
          title={isPlaying ? "Pause ambient sounds" : "Play ambient sounds"}
        >
          {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Volume Slider */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-forest-mist whitespace-nowrap">Volume</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Status Text */}
      <div className="text-xs text-forest-mist mt-2 text-center">
        {isPlaying ? 'Nature and piano ambiance playing' : 'Ambient sounds paused'}
      </div>
      <div className="text-xs text-red-500 mt-2 text-center">
        { !isPlaying && 'If local sounds do not play, check your browser and file locations. Or use the YouTube player below.' }
      </div>

      {/* YouTube fallback */}
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
