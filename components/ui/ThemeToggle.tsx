'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      updateTheme(savedTheme);
    }
  }, []);

  const updateTheme = (newTheme: 'light' | 'dark') => {
    const elements = [document.documentElement, document.body];
    elements.forEach(el => {
      el.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        el.classList.add('dark');
      } else {
        el.classList.remove('dark');
      }
    });
  };

  const toggleTheme = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Slight delay to sync with the "shutter" animation
    setTimeout(() => {
      setTheme(newTheme);
      updateTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      setTimeout(() => setIsAnimating(false), 300);
    }, 150);
  };

  return (
    <button 
      onClick={toggleTheme}
      className="relative group flex items-center gap-2 px-2 py-1 h-8 overflow-hidden transition-all duration-200"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {/* Background Glitch Effect */}
      <motion.div 
        className="absolute inset-0 bg-enark-red/10 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={isAnimating ? { opacity: [0, 1, 0] } : {}}
        transition={{ duration: 0.3, steps: 3 }}
      />

      <div className="relative flex items-center justify-center w-6 h-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ y: 20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 90 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 20,
              restDelta: 0.001
            }}
            className="absolute flex items-center justify-center"
          >
            {theme === 'light' ? (
              <Sun size={14} className="text-black" />
            ) : (
              <Moon size={14} className="text-white" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-start overflow-hidden w-8">
        <AnimatePresence mode="wait">
          <motion.span
            key={theme}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="mono text-[9px] font-bold tracking-tighter leading-none text-foreground"
          >
            {theme === 'light' ? 'LMN' : 'VOID'}
          </motion.span>
        </AnimatePresence>
        <span className="text-[7px] opacity-30 mono tracking-tighter leading-none text-foreground">
          {theme === 'light' ? '01' : '00'}
        </span>
      </div>

      {/* Industrial Shutter Lines */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-theme"
        animate={isAnimating ? { scaleX: [0, 1, 0], opacity: [0, 1, 0] } : { scaleX: 0 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-[1px] bg-theme"
        animate={isAnimating ? { scaleX: [0, 1, 0], opacity: [0, 1, 0] } : { scaleX: 0 }}
      />
    </button>
  );
}
