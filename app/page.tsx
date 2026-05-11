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

import Hero3D from '@/components/ui/Hero3D';

function MagneticButton({ children, onClick }: { children: React.ReactNode, onClick: (e: any) => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < 200) {
      setPosition({ x: distanceX * 0.4, y: distanceY * 0.4 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="pointer-events-auto"
    >
      <button 
        onClick={onClick}
        className="group relative px-20 py-8 bg-white text-black text-[12px] font-black uppercase tracking-[0.6em] overflow-hidden hover:text-white transition-all duration-500 shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        
        {/* Soft Pulse Glow */}
        <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </motion.div>
  );
}

export default function Home() {
  const { playWarp, playClick, playHum } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);

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
    <main ref={containerRef} className="relative min-h-[200vh] bg-black text-white selection:bg-enark-red selection:text-white mono">
      <Header />
      
      {/* 3D HERO STAGE - FIXED BACKGROUND */}
      <section className="fixed inset-0 z-0 pointer-events-none">
        <Hero3D />
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

      {/* ADDITIONAL SCROLL CONTENT SECTION */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center bg-transparent pointer-events-none">
         <div className="max-w-4xl p-12 text-center space-y-12">
            <h2 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter-x">Biological_Synthesis</h2>
            <p className="text-xs md:text-sm text-white/30 uppercase tracking-[0.4em] leading-relaxed">
              Engineering the next generation of high-performance technical garments. Optimized for the Obsidian Node mesh.
            </p>
         </div>
      </div>

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
