import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<{
    oscillators: OscillatorNode[];
    gainNodes: GainNode[];
    noiseBuffer: AudioBuffer | null;
  }>({
    oscillators: [],
    gainNodes: [],
    noiseBuffer: null
  });

  // Generate ambient nature sounds
  const startAmbientSounds = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create peaceful base tones (like wind through trees)
      const baseTones = [110, 165, 220, 330]; // Low, calming frequencies
      
      baseTones.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Very low volume for ambient effect
        gainNode.gain.setValueAtTime(0.015 * volume, audioContext.currentTime);
        
        // Low-pass filter for warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + index * 200, audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        // Add gentle modulation (like wind variations)
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        
        lfo.frequency.setValueAtTime(0.05 + (index * 0.02), audioContext.currentTime);
        lfo.type = 'sine';
        lfoGain.gain.setValueAtTime(0.008, audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        lfo.start();
        
        soundsRef.current.oscillators.push(oscillator, lfo);
        soundsRef.current.gainNodes.push(gainNode);
      });

      // Add gentle piano-like tones
      const pianoFreqs = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (major chord)
      
      pianoFreqs.forEach((freq, index) => {
        setTimeout(() => {
          if (!audioContextRef.current) return;
          
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          
          oscillator.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
          oscillator.type = 'triangle';
          
          // Gentle attack and long decay like a soft piano
          gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.01 * volume, audioContextRef.current.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.005 * volume, audioContextRef.current.currentTime + 4);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 8);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 8);
          
          soundsRef.current.oscillators.push(oscillator);
          soundsRef.current.gainNodes.push(gainNode);
        }, index * 2000 + Math.random() * 3000); // Staggered, random timing
      });

      // Add subtle white noise (like gentle water flow)
      const bufferSize = audioContext.sampleRate * 2;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = audioContext.createBufferSource();
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();
      
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      // Very quiet, filtered noise
      noiseGain.gain.setValueAtTime(0.005 * volume, audioContext.currentTime);
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(400, audioContext.currentTime);
      
      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      whiteNoise.start();
      
      soundsRef.current.oscillators.push(whiteNoise);
      soundsRef.current.gainNodes.push(noiseGain);

    } catch (error) {
      console.error('Failed to create ambient audio:', error);
    }
  };

  const stopAmbientSounds = () => {
    soundsRef.current.oscillators.forEach(node => {
      try {
        if ('stop' in node) {
          node.stop();
        }
      } catch (e) {
        // Node might already be stopped
      }
    });
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    soundsRef.current = {
      oscillators: [],
      gainNodes: [],
      noiseBuffer: null
    };
  };

  const togglePlay = async () => {
    if (isPlaying) {
      stopAmbientSounds();
      setIsPlaying(false);
    } else {
      await startAmbientSounds();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Update gain nodes if playing
    if (audioContextRef.current && soundsRef.current.gainNodes.length > 0) {
      soundsRef.current.gainNodes.forEach((gainNode, index) => {
        if (gainNode.gain.value !== undefined) {
          const baseGain = index < 4 ? 0.015 : (index < 8 ? 0.01 : 0.005);
          gainNode.gain.setValueAtTime(baseGain * newVolume, audioContextRef.current!.currentTime);
        }
      });
    }
  };

  // Auto-start ambient sounds after a brief delay (better UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPlaying) {
        togglePlay();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
        {isPlaying ? 'Peaceful ambiance playing' : 'Ambient sounds paused'}
      </div>
    </div>
  );
}