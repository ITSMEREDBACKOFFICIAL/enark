'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

export default function BackgroundBoxes({ scrollProgress }: { scrollProgress?: MotionValue<number> }) {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-linked transformations
  const rotateX = useTransform(scrollProgress || new useMotionValue(0), [0, 1], [20, 45]);
  const scale = useTransform(scrollProgress || new useMotionValue(0), [0, 1], [1.2, 1.5]);
  const opacity = useTransform(scrollProgress || new useMotionValue(0), [0, 0.5, 1], [0.05, 0.2, 0.3]);

  useEffect(() => {
    const updateGrid = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setColumns(Math.ceil(width / 60)); // Slightly larger boxes for better performance on large grids
        setRows(Math.ceil(height / 60));
      }
    };

    updateGrid();
    window.addEventListener('resize', updateGrid);
    return () => window.removeEventListener('resize', updateGrid);
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        perspective: '1000px',
        opacity
      }}
    >
      <motion.div 
        className="grid absolute inset-0"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          rotateX,
          rotateY: -10,
          scale,
          transformOrigin: 'center center'
        }}
      >
        {Array.from({ length: columns * rows }).map((_, i) => (
          <Box key={i} />
        ))}
      </motion.div>
    </motion.div>
  );
}

function Box() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: any) => {
    const { clientX, clientY } = e;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // We use a simplified proximity check
  const springConfig = { stiffness: 150, damping: 20 };
  const scale = useSpring(1, springConfig);
  const opacity = useSpring(0.1, springConfig);

  useEffect(() => {
    const checkProximity = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = mouseX.get() - centerX;
      const dy = mouseY.get() - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const factor = 1 - distance / 100;
        scale.set(1 + factor * 0.5);
        opacity.set(0.2 + factor * 0.8);
      } else {
        scale.set(1);
        opacity.set(0.1);
      }
    };

    const unsubscribeX = mouseX.on('change', checkProximity);
    return () => unsubscribeX();
  }, []);

  const colors = ['#eab308', '#ec4899', '#8b5cf6', '#3b82f6'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      ref={ref}
      style={{
        scale,
        opacity,
        borderColor: color,
      }}
      className="w-10 h-10 border-[0.5px] border-white/10"
    />
  );
}
