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

import SpherePortfolio from '@/components/ui/SpherePortfolio';

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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Reveal animations for the sphere
      gsap.fromTo(
        '.sphere-reveal',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 2.5,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-black text-white selection:bg-enark-red selection:text-white mono overflow-x-hidden">
      
      {/* Background Layer */}
      <SpectraNoise />
      
      {/* Global Grain & Scanline Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <Header />
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* 3D SPHERE (Behind Button) */}
        <div className="absolute inset-0 flex items-center justify-center sphere-reveal opacity-0 z-0">
          <SpherePortfolio />
        </div>

        {/* INTERACTIVE BUTTON (Foreground) */}
        <div className="relative z-[100] flex flex-col items-center gap-12 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="pointer-events-auto"
          >
            <button 
              onClick={handleWarp}
              onMouseEnter={() => playHum()}
              className="group relative px-16 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] overflow-hidden hover:text-white transition-all duration-500 shadow-[0_40px_80px_rgba(0,0,0,1)]"
            >
              <span className="relative z-10">INITIATE_UPLINK</span>
              <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>

          {/* Simple Navigation Instruction */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 1.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-[7px] font-black uppercase tracking-[0.6em]">Drag_To_Rotate_Sphere</span>
            <div className="w-8 h-[1px] bg-white/20" />
          </motion.div>
        </div>

        {/* Minimal Scroll Hint */}
        <div className="absolute bottom-12 flex flex-col items-center gap-4 opacity-10">
            <ChevronDown size={14} className="text-white animate-bounce" />
        </div>
      </section>

      {/* Footer Branding Offset */}
      <div className="h-32" />

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
