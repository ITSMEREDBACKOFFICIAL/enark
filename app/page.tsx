'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll as useNativeScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMenuStore } from '@/store/useMenuStore';
import { ChevronDown, Instagram, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MinimalGuide from '@/components/ui/MinimalGuide';
import SpectraNoise from '@/components/ui/SpectraNoise';
import { useAudio } from '@/hooks/useAudio';

import BackgroundBoxes from '@/components/ui/BackgroundBoxes';
import ParallaxGallery from '@/components/ui/ParallaxGallery';

// ... existing code ...

export default function Home() {
  const { playWarp, playClick, playHum } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

  // Global Scroll for the whole page
  const { scrollYProgress } = useNativeScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax Text Offset
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleGlobalMouse = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth - 0.5) * 50, 
        y: (e.clientY / window.innerHeight - 0.5) * 50 
      });
    };
    window.addEventListener('mousemove', handleGlobalMouse);
    return () => window.removeEventListener('mousemove', handleGlobalMouse);
  }, []);

  const handleWarp = (e: React.MouseEvent) => {
    e.preventDefault();
    playWarp();
    setIsWarping(true);
    setTimeout(() => {
      router.push('/shop');
    }, 2000);
  };

  return (
    <main ref={containerRef} className="relative min-h-[400vh] bg-black text-white selection:bg-enark-red selection:text-white mono">
      <Header />
      
      {/* 3D HERO STAGE - FIXED BACKGROUND */}
      <section className="fixed inset-0 z-0 pointer-events-none">
        <Hero3D />
      </section>

      {/* DYNAMIC BACKGROUND GRID (Scroll-Linked) */}
      <section className="fixed inset-0 z-1 pointer-events-none">
        <BackgroundBoxes scrollProgress={scrollYProgress} />
      </section>

      {/* OVERLAY UI - HERO SECTION (100vh) */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center pointer-events-none">
        
        {/* Kinetic Parallax Typography */}
        <motion.div 
          animate={{ x: -mousePos.x, y: -mousePos.y }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <h1 className="text-[25vw] font-black uppercase italic tracking-tighter opacity-[0.05] select-none">
            ENARK
          </h1>
        </motion.div>

        {/* Magnetic CTA */}
        <div className="mt-[40vh] pointer-events-auto">
          <MagneticButton onClick={handleWarp}>
            VIEW_COLLECTION
          </MagneticButton>
        </div>

        {/* Scrolling Instructions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <span className="text-[7px] font-black uppercase tracking-[0.6em]">Scroll_To_Analyze_Assets</span>
          <ChevronDown size={14} className="text-white animate-bounce" />
        </motion.div>
      </div>

      {/* PARALLAX GALLERY SECTION */}
      <ParallaxGallery scrollProgress={scrollYProgress} />

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
              INITIATING_COLLECTION_SYNC...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
