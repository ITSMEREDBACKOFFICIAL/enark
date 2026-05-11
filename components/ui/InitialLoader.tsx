'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function InitialLoader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only show on homepage
    if (pathname !== '/') {
      setIsVisible(false);
      return;
    }

    // Check session storage
    const hasPlayed = sessionStorage.getItem('enark-loader-played');
    if (!hasPlayed) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('enark-loader-played', 'true');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center mono overflow-hidden"
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
          
          <div className="relative flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[9px] uppercase tracking-[0.5em] mb-4 text-enark-red"
              >
                Initializing OS
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: "2em", filter: "blur(10px)" }}
                animate={{ opacity: 1, letterSpacing: "1.5em", filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-3xl md:text-5xl font-black uppercase text-white tracking-[1.5em] ml-[1.5em]"
              >
                ENARK
              </motion.h1>
            </div>
            
            <div className="w-[180px] h-[1px] bg-white/5 relative overflow-hidden mt-4">
              <motion.div 
                initial={{ left: "-100%" }}
                animate={{ left: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-1/2 bg-enark-red"
              />
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-4">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="text-[8px] uppercase tracking-[0.4em] text-white"
              >
                NEURAL ARCHIVE SYNC
              </motion.span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1 h-1 bg-enark-red"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Technical Corner Data */}
          <div className="absolute top-10 left-10 flex flex-col gap-1 opacity-20">
            <span className="text-[7px] text-white mono uppercase tracking-widest">BOOT_SEQ: 0x4F2A</span>
            <span className="text-[7px] text-white mono uppercase tracking-widest">ENARK_CORE_STABLE</span>
          </div>
          
          <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1 opacity-20">
            <span className="text-[7px] text-white mono uppercase tracking-widest">UPLINK_READY</span>
            <span className="text-[7px] text-white mono uppercase tracking-widest">©2026 ENARK SYSTEMS</span>
          </div>

          <div className="absolute top-10 right-10 w-4 h-[1px] bg-white/10" />
          <div className="absolute bottom-10 left-10 w-4 h-[1px] bg-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

