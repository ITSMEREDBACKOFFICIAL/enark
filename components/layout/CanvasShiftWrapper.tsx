'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuStore } from '@/store/useMenuStore';

export default function CanvasShiftWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen, closeMenu } = useMenuStore();
  const [showFlash, setShowFlash] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <motion.div
        animate={{
          scale: isOpen ? 0.85 : 1,
          x: isOpen ? '70%' : '0%',
          rotateZ: isOpen ? -2 : 0,
          borderRadius: isOpen ? '20px' : '0px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="relative min-h-screen bg-black origin-left z-20 shadow-2xl overflow-hidden border border-white/5"
      >
        {children}

        {/* Non-clickable overlay when menu is open */}
        {isOpen && (
          <div 
            className="absolute inset-0 z-50 cursor-pointer bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeMenu();
            }}
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
