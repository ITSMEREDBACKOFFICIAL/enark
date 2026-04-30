'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function SpinningBag() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for smooth rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Springs for physical feel
  const rotateX = useSpring(useTransform(y, [-200, 200], [20, -20]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-200, 200], [-200, 200]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-48 h-60 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      style={{ perspective: 1000 }}
    >
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        style={{
          rotateX,
          rotateY: isDragging ? 0 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={isDragging ? {} : {
          rotateY: [0, 360],
        }}
        transition={isDragging ? {} : {
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative w-32 h-44"
      >
        <div className="absolute inset-0 bg-white border-2 border-black flex flex-col items-center justify-center p-4" style={{ transform: 'translateZ(20px)' }}>
          <div className="w-8 h-4 bg-black/5 rounded-full mb-8" />
          <h4 className="text-xs font-black tracking-tighter text-black uppercase leading-none text-center select-none">
            ENARK<br />.
          </h4>
        </div>

        <div className="absolute inset-0 bg-white border-2 border-black flex flex-col items-center justify-center p-4" style={{ transform: 'rotateY(180deg) translateZ(20px)', backfaceVisibility: 'hidden' }}>
           <div className="w-8 h-4 bg-black/5 rounded-full mb-8" />
           <h4 className="text-xs font-black tracking-tighter text-black uppercase leading-none text-center select-none">
            ENARK<br />.
          </h4>
        </div>

        {/* Side Faces */}
        <div className="absolute inset-y-0 left-0 w-[40px] bg-white border-2 border-black flex items-center justify-center" style={{ transform: 'rotateY(-90deg) translateZ(20px)', backfaceVisibility: 'hidden' }}>
          <div className="w-[1px] h-3/4 bg-black/5" />
        </div>
        <div className="absolute inset-y-0 right-0 w-[40px] bg-white border-2 border-black flex items-center justify-center" style={{ transform: 'rotateY(90deg) translateZ(20px)', backfaceVisibility: 'hidden' }}>
          <div className="w-[1px] h-3/4 bg-black/5" />
        </div>

        {/* Top/Bottom */}
        <div className="absolute inset-x-0 top-0 h-[40px] bg-white border-2 border-black" style={{ transform: 'rotateX(90deg) translateZ(20px)', backfaceVisibility: 'hidden' }} />
        <div className="absolute inset-x-0 bottom-0 h-[40px] bg-white border-2 border-black shadow-2xl shadow-black/20" style={{ transform: 'rotateX(-90deg) translateZ(20px)', backfaceVisibility: 'hidden' }} />
      </motion.div>

      {/* Shadow */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 blur-xl rounded-full" />
    </div>
  );
}
