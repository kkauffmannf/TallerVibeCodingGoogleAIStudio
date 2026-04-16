import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 150;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
      return generateFood();
    }
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood({ x: 5, y: 5 });
    setScore(0);
    window.dispatchEvent(new CustomEvent('scoreUpdate', { detail: { score: 0 } }));
    setIsGameOver(false);
    setIsPaused(true);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const newHead = {
        x: (prevSnake[0].x + nextDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (prevSnake[0].y + nextDirection.y + GRID_SIZE) % GRID_SIZE,
      };

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        window.dispatchEvent(new CustomEvent('gameOver', { detail: { score } }));
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          window.dispatchEvent(new CustomEvent('scoreUpdate', { detail: { score: newScore } }));
          return newScore;
        });
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      setDirection(nextDirection);
      return newSnake;
    });
  }, [food, isGameOver, isPaused, nextDirection, generateFood, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      switch (key) {
        case 'arrowup':
        case 'w':
          if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
          break;
        case 'arrowdown':
        case 's':
          if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
          break;
        case 'arrowleft':
        case 'a':
          if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
          break;
        case 'arrowright':
        case 'd':
          if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (isGameOver) resetGame();
          else setIsPaused(p => !p);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isGameOver]);

  useEffect(() => {
    const timer = setInterval(moveSnake, Math.max(50, BASE_SPEED - Math.floor(score / 50) * 5));
    return () => clearInterval(timer);
  }, [moveSnake, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? '#FFFFFF' : '#00F3FF'; 
      ctx.shadowBlur = i === 0 ? 15 : 10;
      ctx.shadowColor = '#00F3FF';
      ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });

    ctx.fillStyle = '#FF007A';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FF007A';
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

  }, [snake, food]);

  return (
    <div className="relative group p-4 bg-black border-4 border-app-border rounded shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      <div className="absolute top-4 right-4 font-mono text-accent-cyan text-[10px] z-20 drop-shadow-[0_0_5px_#00F3FF]">
        FPS: 60
      </div>
      
      <canvas
        ref={canvasRef}
        width={440}
        height={440}
        className="block"
      />

      <AnimatePresence>
        {(isPaused || isGameOver) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30"
          >
            {isGameOver ? (
              <>
                <h2 className="text-4xl font-mono font-bold neon-text-pink mb-6 tracking-tighter text-white">GAME OVER</h2>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-3 bg-accent-pink text-white font-bold rounded hover:brightness-125 transition-all shadow-[0_0_20px_rgba(255,0,122,0.4)]"
                >
                  <RotateCcw size={20} />
                  RETRY
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-mono font-bold neon-text-cyan mb-8 tracking-[0.2em] text-white">NEURAL LINK READY</h2>
                <button
                  onClick={() => setIsPaused(false)}
                  className="flex items-center gap-2 px-10 py-5 bg-text-main text-app-bg font-bold rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  <Play size={24} fill="currentColor" />
                  INITIALIZE
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
