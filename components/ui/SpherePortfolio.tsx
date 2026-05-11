'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const IMAGES = [
  '/illustrations/asset1.png',
  '/illustrations/asset2.png',
  '/illustrations/asset3.png',
  '/illustrations/asset4.png',
  '/illustrations/asset5.png',
];

interface Point {
  x: number;
  y: number;
  z: number;
  index: number;
}

export default function SpherePortfolio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Rotation State
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  
  // Smooth Springs
  const springX = useSpring(rotX, { stiffness: 50, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 50, damping: 20 });

  // Auto-rotation & Interaction
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      if (!selectedImage) {
        rotY.set(rotY.get() + 0.2); // Slow auto-rotation
      }
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [selectedImage]);

  // Fibonacci Sphere Distribution
  const points = useMemo(() => {
    const pts: Point[] = [];
    const n = IMAGES.length;
    const radius = 350;

    for (let i = 0; i < n; i++) {
      const phi = Math.acos(-1 + (2 * i) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      
      pts.push({
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        index: i
      });
    }
    return pts;
  }, []);

  const handleDrag = (_: any, info: any) => {
    rotY.set(rotY.get() + info.delta.x * 0.5);
    rotX.set(rotX.get() - info.delta.y * 0.5);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
      
      {/* Interaction Surface */}
      <motion.div 
        ref={containerRef}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDrag={handleDrag}
        className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div 
          style={{ 
            rotateX: springX, 
            rotateY: springY,
            transformStyle: 'preserve-3d' 
          }}
          className="relative w-0 h-0"
        >
          {points.map((point, i) => (
            <motion.div
              key={i}
              className="absolute w-[200px] h-[250px] md:w-[280px] md:h-[350px] -ml-[100px] md:-ml-[140px] -mt-[125px] md:-mt-[175px] preserve-3d"
              style={{
                x: point.x,
                y: point.y,
                z: point.z,
              }}
            >
              <motion.div
                className="w-full h-full border border-white/10 bg-black overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{
                  // Billboard effect: invert the sphere's rotation so cards face camera
                  rotateX: useTransform(springX, (v) => -v),
                  rotateY: useTransform(springY, (v) => -v),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(IMAGES[i]);
                }}
              >
                <img 
                  src={IMAGES[i]} 
                  alt="" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" 
                />
                
                {/* Decorative UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-enark-red/40" />
                <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                  <p className="mono text-[8px] font-black tracking-widest text-enark-red uppercase">ENARK_NODE_{i + 1}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative max-w-4xl w-full aspect-[4/5] md:aspect-video border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.2)]"
            >
              <img src={selectedImage} alt="" className="w-full h-full object-contain" />
              <button 
                className="absolute top-8 right-8 text-white/40 hover:text-white mono text-[10px] font-black uppercase tracking-widest border border-white/10 px-6 py-3 bg-black/50 backdrop-blur-md"
                onClick={() => setSelectedImage(null)}
              >
                CLOSE_UPLINK [X]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Particles (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
         <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-enark-red rounded-full animate-pulse delay-700" />
         <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse delay-1000" />
      </div>
    </div>
  );
}
