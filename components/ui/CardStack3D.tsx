'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const IMAGES = [
  '/illustrations/asset1.png',
  '/illustrations/asset2.png',
  '/illustrations/asset3.png',
  '/illustrations/asset4.png',
  '/illustrations/asset5.png',
  '/illustrations/asset1.png', // Repeat to fill stack
  '/illustrations/asset2.png',
];

export default function CardStack3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll within this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-transparent">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1500px]">
        <div className="relative w-full h-full flex items-center justify-center pt-20">
          {IMAGES.map((img, i) => (
             <Card 
               key={i} 
               index={i} 
               total={IMAGES.length} 
               progress={smoothProgress} 
               image={img} 
             />
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ index, total, progress, image }: { index: number, total: number, progress: any, image: string }) {
  // Each card's focal point in the scroll progress (0 to 1)
  const focalPoint = index / (total - 1);
  const range = 0.15; // How long the card stays active

  // Rotation: Recede backward as it moves away from center
  const rotateX = useTransform(
    progress,
    [focalPoint - range, focalPoint, focalPoint + range],
    [60, 0, -60]
  );

  // Translation: Move forward/backward
  const z = useTransform(
    progress,
    [focalPoint - range, focalPoint, focalPoint + range],
    [-400, 0, -400]
  );

  // Vertical position
  const y = useTransform(
    progress,
    [focalPoint - range, focalPoint, focalPoint + range],
    ["100%", "0%", "-100%"]
  );

  // Opacity: Fade out when away from center
  const opacity = useTransform(
    progress,
    [focalPoint - range, focalPoint, focalPoint + range],
    [0.1, 1, 0.1]
  );

  // Scale: Pop out when active
  const scale = useTransform(
    progress,
    [focalPoint - range, focalPoint, focalPoint + range],
    [0.8, 1.2, 0.8]
  );

  return (
    <motion.div
      style={{
        rotateX,
        z,
        y,
        opacity,
        scale,
        transformStyle: 'preserve-3d',
      }}
      className="absolute w-[300px] h-[400px] md:w-[500px] md:h-[650px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 bg-black overflow-hidden group"
    >
      <img 
        src={image} 
        alt="" 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-40 group-hover:opacity-100" 
      />
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      
      {/* Brutalist UI Elements */}
      <div className="absolute top-8 left-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-enark-red animate-pulse" />
          <span className="mono text-[10px] font-black tracking-[0.5em] text-white/40 uppercase">ENARK_NODE // 0{index + 1}</span>
        </div>
        <div className="h-[1px] w-24 bg-white/10" />
      </div>

      <div className="absolute bottom-12 left-8 right-8">
        <p className="mono text-[12px] font-black tracking-[0.8em] text-white uppercase mb-4">OBSIDIAN_ASSET_v{index + 1}.0</p>
        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <p className="mono text-[7px] text-white/30 uppercase tracking-widest">Material_Spec</p>
             <p className="mono text-[9px] text-white/60 uppercase tracking-widest font-bold">CORDURA / TITANIUM</p>
          </div>
          <div className="text-right">
             <p className="mono text-[24px] font-black italic text-enark-red opacity-20">0{index + 1}</p>
          </div>
        </div>
      </div>

      {/* Industrial corner markers */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20" />
    </motion.div>
  );
}
