'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MinimalGuideProps {
  id: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function MinimalGuide({ id, text, position = 'bottom', className = '' }: MinimalGuideProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if the user hasn't seen this specific guide before
    const hasSeen = localStorage.getItem(`guide_seen_${id}`);
    if (!hasSeen) {
      // Delay before showing
      const showTimer = setTimeout(() => setIsVisible(true), 2000);
      
      // Auto-dismiss after 6 seconds of being visible
      const hideTimer = setTimeout(() => {
        dismiss();
      }, 8000);
      
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [id]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`guide_seen_${id}`, 'true');
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom': return 'top-full left-1/2 -translate-x-1/2 pt-2';
      case 'top': return 'bottom-full left-1/2 -translate-x-1/2 pb-2';
      case 'left': return 'right-full top-1/2 -translate-y-1/2 pr-2';
      case 'right': return 'left-full top-1/2 -translate-y-1/2 pl-2';
      default: return '';
    }
  };

  const getArrowIcon = () => {
    switch (position) {
      case 'bottom': return '↑';
      case 'top': return '↓';
      case 'left': return '→';
      case 'right': return '←';
      default: return '↑';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={`absolute z-[1000] flex pointer-events-auto cursor-pointer ${getPositionClasses()} ${className}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className={`flex items-center gap-1.5 ${
              position === 'bottom' ? 'flex-col' : position === 'top' ? 'flex-col-reverse' : position === 'left' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <motion.div 
              animate={{ 
                y: position === 'top' ? [0, 5, 0] : position === 'bottom' ? [0, -5, 0] : 0,
                x: position === 'left' ? [0, 5, 0] : position === 'right' ? [0, -5, 0] : 0
              }} 
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} 
              className="text-enark-red font-mono text-[10px]"
            >
              {getArrowIcon()}
            </motion.div>
            
            <div className="bg-foreground text-background px-2 py-1 text-[8px] font-black tracking-[0.2em] uppercase whitespace-nowrap shadow-[0_0_15px_var(--foreground)] hover:bg-enark-red hover:text-white transition-colors">
              {text}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
