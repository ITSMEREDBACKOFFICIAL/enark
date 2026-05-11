'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuStore } from '@/store/useMenuStore';

export default function CanvasShiftWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, closeMenu } = useMenuStore();
  const [showFlash, setShowFlash] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX - touchEndX;

    // Swipe left to close the menu
    if (deltaX > 50) {
      closeMenu();
    }
    setTouchStartX(null);
  };

  return (
    <div className="relative min-h-screen bg-[var(--frame-bg)] overflow-hidden transition-colors duration-500">
      <motion.div
        animate={{
          scale: isOpen ? 0.85 : 1,
          x: isOpen ? '70%' : '0%',
          rotateZ: isOpen ? -2 : 0,
          borderRadius: isOpen ? '32px' : '24px',
          margin: isOpen ? '0px' : 'var(--canvas-margin)',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="relative min-h-screen bg-background origin-left z-20 shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden transition-all duration-500"
        style={{
          height: 'auto',
          minHeight: '100vh',
        }}
      >
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Non-clickable overlay when menu is open */}
        {isOpen && (
          <div 
            className="absolute inset-0 z-50 cursor-pointer bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMenu();
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        )}

        {/* Flash Effect Overlay */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-enark-red z-[100] mix-blend-difference pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
