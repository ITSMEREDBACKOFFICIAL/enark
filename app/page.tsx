'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMenuStore } from '@/store/useMenuStore';
import { ChevronDown, Instagram, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MinimalGuide from '@/components/ui/MinimalGuide';
import SpectraNoise from '@/components/ui/SpectraNoise';
import { useAudio } from '@/hooks/useAudio';

import CardStack3D from '@/components/ui/CardStack3D';

export default function Home() {
  const { playWarp, playClick, playHum } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleMenu } = useMenuStore();
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

  const handleWarp = (e: React.MouseEvent) => {
    e.preventDefault();
    playWarp();
    setIsWarping(true);
    setTimeout(() => {
      router.push('/shop');
    }, 2000);
  };

  return (
    <main ref={containerRef} className="relative min-h-screen bg-black text-white selection:bg-enark-red selection:text-white mono">
      
      {/* Background Layer */}
      <SpectraNoise />
      
      {/* Global Grain & Scanline Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <Header />
      
      {/* --- HERO SECTION WITH 3D CARD STACK --- */}
      <section className="relative w-full overflow-visible">
        
        {/* The 3D Scrollable Stack (Behind Button) */}
        <div className="relative z-0">
          <CardStack3D />
        </div>

        {/* STICKY INTERACTIVE BUTTON (Foreground) */}
        <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-center gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="pointer-events-auto"
          >
            <button 
              onClick={handleWarp}
              onMouseEnter={() => playHum()}
              className="group relative px-16 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] overflow-hidden hover:text-white transition-all duration-500 shadow-[0_40px_100px_rgba(0,0,0,1)]"
            >
              <span className="relative z-10">INITIATE_UPLINK</span>
              <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>

          {/* Scrolling Instructions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-[7px] font-black uppercase tracking-[0.6em]">Scroll_To_Cycle_Assets</span>
            <ChevronDown size={14} className="text-white animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* Footer Branding Offset */}
      <div className="h-64 bg-black relative z-10" />

      {/* --- FOOTER --- */}
      <Footer />

      {/* --- WARP TRANSITION --- */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.1, rotate: 0 }}
              animate={{ scale: 40, rotate: 720 }}
              transition={{ duration: 2, ease: [0.76, 0, 0.24, 1] }}
              className="w-40 h-40 rounded-full bg-enark-red blur-3xl opacity-50"
            />
            <div className="absolute font-sans font-black text-white text-[10px] tracking-[1em] uppercase opacity-40 animate-pulse">
              CALIBRATING_UPLINK...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
