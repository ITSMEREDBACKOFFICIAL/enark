'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'START' | 'PLAYING' | 'GAME_OVER';

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const INITIAL_SPEED = 5;
  const SPEED_INCREMENT = 0.001;
  const MAX_SPEED = 15;

  // Refs for game state (to avoid re-renders during loop)
  const gameRef = useRef({
    player: {
      y: 0,
      vy: 0,
      width: 40,
      height: 40,
      isJumping: false,
      frame: 0,
      frameCount: 0,
    },
    obstacles: [] as { x: number; width: number; height: number }[],
    speed: INITIAL_SPEED,
    score: 0,
    nextObstacleDist: 0,
    frameId: 0,
  });

  useEffect(() => {
    const savedHighScore = localStorage.getItem('enark-dino-high-score');
    if (savedHighScore) setHighScore(parseInt(savedHighScore));
  }, []);

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    gameRef.current = {
      player: {
        y: 0,
        vy: 0,
        width: 30,
        height: 30,
        isJumping: false,
        frame: 0,
        frameCount: 0,
      },
      obstacles: [],
      speed: INITIAL_SPEED,
      score: 0,
      nextObstacleDist: 400,
      frameId: 0,
    };
    requestAnimationFrame(gameLoop);
  };

  const jump = () => {
    if (!gameRef.current.player.isJumping && gameState === 'PLAYING') {
      gameRef.current.player.vy = JUMP_FORCE;
      gameRef.current.player.isJumping = true;
    } else if (gameState !== 'PLAYING') {
      startGame();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update Speed
    gameRef.current.speed = Math.min(MAX_SPEED, gameRef.current.speed + SPEED_INCREMENT);

    // Update Player
    const p = gameRef.current.player;
    p.vy += GRAVITY;
    p.y += p.vy;

    if (p.y > 0) {
      p.y = 0;
      p.vy = 0;
      p.isJumping = false;
    }

    // Update Animation Frame
    p.frameCount++;
    if (p.frameCount > 10) {
      p.frame = (p.frame + 1) % 2;
      p.frameCount = 0;
    }

    // Update Score
    gameRef.current.score += 0.1;
    setScore(Math.floor(gameRef.current.score));

    // Update Obstacles
    gameRef.current.nextObstacleDist -= gameRef.current.speed;
    if (gameRef.current.nextObstacleDist <= 0) {
      const width = Math.random() > 0.5 ? 20 : 40;
      gameRef.current.obstacles.push({
        x: canvas.width,
        width,
        height: 40,
      });
      gameRef.current.nextObstacleDist = 300 + Math.random() * 400;
    }

    // Draw Ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();

    // Draw Obstacles & Collision
    ctx.fillStyle = '#FFFFFF';
    const playerX = 50;
    const playerY = canvas.height - 20 - p.height + p.y;

    gameRef.current.obstacles = gameRef.current.obstacles.filter(obs => {
      obs.x -= gameRef.current.speed;

      // Draw Cross (Obstacle)
      const cx = obs.x + obs.width / 2;
      const cy = canvas.height - 20 - obs.height / 2;
      
      // Vertical bar
      ctx.fillRect(cx - 2, cy - 20, 4, 40);
      // Horizontal bar
      ctx.fillRect(cx - 10, cy - 10, 20, 4);

      // Collision Detection
      if (
        playerX < obs.x + obs.width &&
        playerX + p.width > obs.x &&
        playerY < canvas.height - 20 &&
        playerY + p.height > canvas.height - 20 - obs.height
      ) {
        setGameState('GAME_OVER');
        if (Math.floor(gameRef.current.score) > highScore) {
          setHighScore(Math.floor(gameRef.current.score));
          localStorage.setItem('enark-dino-high-score', Math.floor(gameRef.current.score).toString());
        }
        return false;
      }

      return obs.x + obs.width > 0;
    });

    // Draw Player (Ghost)
    ctx.fillStyle = '#FFFFFF';
    // Body
    ctx.fillRect(playerX, playerY, p.width, p.height - 5);
    // Head detail (pixelated)
    ctx.fillStyle = '#000000';
    ctx.fillRect(playerX + p.width - 10, playerY + 8, 4, 4); // Eye
    
    // Legs (animation)
    ctx.fillStyle = '#FFFFFF';
    if (p.frame === 0) {
      ctx.fillRect(playerX + 5, playerY + p.height - 5, 8, 5);
    } else {
      ctx.fillRect(playerX + p.width - 13, playerY + p.height - 5, 8, 5);
    }

    if (gameState === 'PLAYING') {
      gameRef.current.frameId = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      cancelAnimationFrame(gameRef.current.frameId);
    }
  }, [gameState]);

  return (
    <div className="relative w-full max-w-3xl aspect-[2/1] bg-black border-2 border-white/10 overflow-hidden cursor-pointer selection:bg-none" onClick={jump}>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full image-pixelated"
      />

      {/* Overlays */}
      <div className="absolute top-6 right-6 flex gap-8 mono text-[10px] font-black uppercase tracking-widest text-white/40">
        <div>HI {String(highScore).padStart(5, '0')}</div>
        <div className="text-white">{String(score).padStart(5, '0')}</div>
      </div>

      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <p className="mono text-[11px] font-black uppercase tracking-[0.4em] text-white animate-pulse">
              PRESS SPACE OR TAP TO PLAY
            </p>
            <p className="mt-4 mono text-[8px] uppercase tracking-widest text-white/30">
              [SYSTEM_IDLE // READY_TO_EXECUTE]
            </p>
          </motion.div>
        )}

        {gameState === 'GAME_OVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <h2 className="mono text-3xl font-black uppercase tracking-tighter-x text-white mb-2 italic">
              CRITICAL_FAILURE
            </h2>
            <p className="mono text-[10px] font-black uppercase tracking-[0.3em] text-enark-red mb-8">
              DATA_COLLISION_DETECTED
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-3 bg-white text-black mono text-[10px] font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all"
            >
              REBOOT_SYSTEM
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Corner Details */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20" />
    </div>
  );
}
