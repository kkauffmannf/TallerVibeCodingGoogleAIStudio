/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { SkipForward, SkipBack, Play, Pause } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState({ title: 'Neural Stream', artist: 'AI HUB', progress: 0, currentTime: '0:00', duration: '0:00' });

  useEffect(() => {
    const handleScore = (e: any) => setScore(e.detail.score);
    const handleGameOver = (e: any) => {
      if (e.detail.score > highScore) setHighScore(e.detail.score);
    };
    const handleMusicTime = (e: any) => {
      setNowPlaying(prev => ({ 
        ...prev, 
        progress: e.detail.progress,
        currentTime: formatTime(e.detail.currentTime),
        duration: formatTime(e.detail.duration)
      }));
    };

    window.addEventListener('scoreUpdate', handleScore);
    window.addEventListener('gameOver', handleGameOver);
    window.addEventListener('musicTimeUpdate', handleMusicTime);

    // Initial check for high score in local storage could be here if needed
    return () => {
      window.removeEventListener('scoreUpdate', handleScore);
      window.removeEventListener('gameOver', handleGameOver);
      window.removeEventListener('musicTimeUpdate', handleMusicTime);
    };
  }, [highScore]);

  return (
    <div className="h-screen w-full lg:w-[1024px] lg:h-[768px] mx-auto overflow-hidden grid grid-cols-[260px_1fr_260px] grid-rows-[60px_1fr_100px] sophisticated-panel shadow-[0_0_100px_rgba(0,0,0,0.8)] border-x lg:border border-app-border">
      
      {/* Header */}
      <header className="col-span-3 sophisticated-panel border-b flex items-center justify-between px-6 z-40 shadow-lg">
        <div className="text-[1.2rem] font-extrabold tracking-[2px] uppercase neon-text-cyan">
          NEON<span className="text-accent-pink">SYNTH</span>
        </div>
        <div className="font-mono text-[0.8rem] text-accent-cyan tracking-wider">
          SYSTEM STATUS: OPTIMAL
        </div>
      </header>

      {/* Sidebar Left: Playlist */}
      <aside className="sophisticated-panel border-r p-5 overflow-y-auto">
        <MusicPlayer />
      </aside>

      {/* Main Content: Snake Game */}
      <main className="bg-transparent flex items-center justify-center p-5 relative overflow-hidden">
        {/* Abstract Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent-cyan/5 blur-[100px] rounded-full pointer-events-none" />
        <SnakeGame />
      </main>

      {/* Sidebar Right: Stats */}
      <aside className="sophisticated-panel border-l p-5 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="bg-white/[0.02] p-4 rounded-xl border border-app-border">
            <div className="text-[0.7rem] uppercase text-text-dim tracking-widest mb-2 font-semibold">Score</div>
            <div className="font-mono text-[1.8rem] neon-text-cyan">
              {score.toLocaleString('en-US', { minimumIntegerDigits: 6 })}
            </div>
          </div>

          <div className="bg-white/[0.02] p-4 rounded-xl border border-app-border">
            <div className="text-[0.7rem] uppercase text-text-dim tracking-widest mb-2 font-semibold">High Score</div>
            <div className="font-mono text-[1.8rem] neon-text-pink">
              {highScore.toLocaleString('en-US', { minimumIntegerDigits: 6 })}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-app-border">
          <div className="text-[0.8rem] text-text-dim leading-relaxed font-light">
            Control neural nodes with <span className="px-1.5 py-0.5 bg-app-border rounded font-mono text-[0.7rem] text-text-main mx-0.5">W</span> 
            <span className="px-1.5 py-0.5 bg-app-border rounded font-mono text-[0.7rem] text-text-main mx-0.5">A</span> 
            <span className="px-1.5 py-0.5 bg-app-border rounded font-mono text-[0.7rem] text-text-main mx-0.5">S</span> 
            <span className="px-1.5 py-0.5 bg-app-border rounded font-mono text-[0.7rem] text-text-main mx-0.5">D</span> 
            or ARROWS. Sync with AI frequencies.
          </div>
        </div>
      </aside>

      {/* Footer: Music Controls */}
      <footer className="col-span-3 sophisticated-panel border-t flex items-center px-10 z-40 bg-app-panel/90 backdrop-blur-md">
        <div className="flex items-center gap-4 w-[300px]">
          <div className="w-14 h-14 bg-gradient-to-br from-accent-pink to-accent-cyan rounded shadow-lg overflow-hidden shrink-0" />
          <div className="truncate">
            <div className="text-[0.9rem] font-semibold text-text-main truncate">{nowPlaying.title}</div>
            <div className="text-[0.75rem] text-text-dim font-mono uppercase tracking-tight">{nowPlaying.artist}</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('musicPrev'))}
              className="text-text-main/80 hover:text-accent-cyan transition-colors"
            >
              <SkipBack size={20} />
            </button>
            <button 
              onClick={() => {
                setIsPlaying(!isPlaying);
                window.dispatchEvent(new CustomEvent('musicToggle'));
              }}
              className="w-12 h-12 bg-text-main text-app-bg rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/40"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('musicNext'))}
              className="text-text-main/80 hover:text-accent-cyan transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        <div className="w-[300px] flex flex-col gap-2">
          <div className="flex justify-between font-mono text-[0.7rem] text-accent-cyan font-medium">
            <span>{nowPlaying.currentTime}</span>
            <span className="text-text-dim">{nowPlaying.duration}</span>
          </div>
          <div className="h-1 w-full bg-app-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-cyan shadow-[0_0_10px_#00F3FF] transition-all duration-300" 
              style={{ width: `${nowPlaying.progress}%` }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
