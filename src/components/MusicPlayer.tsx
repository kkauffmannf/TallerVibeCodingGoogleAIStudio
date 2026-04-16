import React, { useState, useRef, useEffect } from 'react';

const PLAYLIST = [
  {
    id: 1,
    title: "Cybernetic Dreams",
    artist: "AI UNIT // 04",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "Static Pulse",
    artist: "AI UNIT // 09",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "Neon Horizon",
    artist: "AI UNIT // 12",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const currentTrack = PLAYLIST[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    window.dispatchEvent(new CustomEvent('musicTimeUpdate', { 
      detail: { 
        currentTime: audioRef.current?.currentTime || 0,
        duration: audioRef.current?.duration || 1,
        progress: (audioRef.current?.currentTime || 0) / (audioRef.current?.duration || 1) * 100,
        title: currentTrack.title,
        artist: currentTrack.artist
      } 
    }));
  };

  useEffect(() => {
    const handleFooterToggle = () => togglePlay();
    const handleFooterNext = () => nextTrack();
    const handleFooterPrev = () => prevTrack();

    window.addEventListener('musicToggle', handleFooterToggle);
    window.addEventListener('musicNext', handleFooterNext);
    window.addEventListener('musicPrev', handleFooterPrev);

    return () => {
      window.removeEventListener('musicToggle', handleFooterToggle);
      window.removeEventListener('musicNext', handleFooterNext);
      window.removeEventListener('musicPrev', handleFooterPrev);
    };
  }, [isPlaying, currentTrackIndex]);

  return (
    <div className="w-full">
      <h3 className="text-[0.7rem] uppercase tracking-[2px] mb-5 text-text-dim font-bold">Neural Playlist</h3>
      <div className="space-y-2">
        {PLAYLIST.map((track, index) => (
          <div
            key={track.id}
            onClick={() => {
              setCurrentTrackIndex(index);
              setIsPlaying(true);
            }}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              currentTrackIndex === index 
                ? "bg-accent-cyan/10 border-accent-cyan" 
                : "border-transparent hover:bg-white/5"
            }`}
          >
            <div className={`text-[0.9rem] font-semibold truncate ${currentTrackIndex === index ? 'text-accent-cyan' : 'text-text-main'}`}>
              {track.title}
            </div>
            <div className="text-[0.75rem] text-text-dim font-mono truncate">{track.artist}</div>
          </div>
        ))}
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />
    </div>
  );
}
