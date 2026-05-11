'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const IMAGES = [
  '/brutalist_illustration_1_1778486487644.png',
  '/brutalist_illustration_2_1778486503603.png',
  '/brutalist_illustration_3_1778486519959.png',
  '/brutalist_illustration_4_1778486534606.png',
  '/brutalist_illustration_5_1778486550326.png',
];

export default function CoverflowCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with the middle one
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + IMAGES.length) % IMAGES.length);
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden perspective-[1200px]">
      <div className="relative flex items-center justify-center w-full h-full">
        <AnimatePresence initial={false}>
          {IMAGES.map((img, index) => {
            const offset = index - currentIndex;
            const absOffset = Math.abs(offset);
            
            // Calculate positioning and rotation
            const x = offset * 250; // Increased spacing
            const rotateY = offset * -45;
            const z = absOffset * -300;
            const scale = 1 - absOffset * 0.1;
            const opacity = 1 - absOffset * 0.3;
            const zIndex = 100 - absOffset;

            // Only show cards near the center for performance
            if (absOffset > 2) return null;

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  x,
                  rotateY,
                  z,
                  scale,
                  opacity,
                  zIndex,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
                className="absolute w-[300px] h-[400px] md:w-[400px] md:h-[500px] cursor-pointer selection:bg-none"
                onClick={() => setCurrentIndex(index)}
              >
                <div className="relative w-full h-full border border-white/10 bg-black overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                   {/* Illustration */}
                   <img 
                     src={img} 
                     alt="" 
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100" 
                   />
                   
                   {/* Overlay Details */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   
                   {/* Industrial corner details */}
                   <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/40" />
                   <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/40" />
                   
                   <div className="absolute bottom-8 left-8 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="mono text-[8px] font-black tracking-[0.5em] text-enark-red mb-1 uppercase">ASSET_ID // 00{index + 1}</p>
                      <p className="mono text-[10px] font-black tracking-widest text-white uppercase">NEURAL_SCHEMATIC_v4</p>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 flex gap-4 z-50">
        {IMAGES.map((_, i) => (
          <div 
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-[2px] transition-all duration-500 cursor-pointer ${
              i === currentIndex ? 'w-12 bg-enark-red' : 'w-4 bg-white/10 hover:bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
