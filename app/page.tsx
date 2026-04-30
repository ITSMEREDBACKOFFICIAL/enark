'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FoilBag from '@/components/home/FoilBag';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMenuStore } from '@/store/useMenuStore';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAudio } from '@/hooks/useAudio';
export default function Home() {
  const { playWarp } = useAudio();
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
    // Register ScrollTrigger client-side
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll
    const Lenis = require('lenis').default;
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // GSAP staggered reveal for text elements
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.reveal-text',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power4.out',
          stagger: 0.3,
          scrollTrigger: {
            trigger: '.reveal-text',
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-[#000000] text-[#FFFFFF] overflow-x-hidden selection:bg-[#FF0000] selection:text-white mono">
      <Header />
      
      {/* 3D background removed for performance */}

      {/* Hero Section - Re-architected for premium individuality */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center px-6 z-10 bg-[#000000] overflow-hidden">
        
        {/* Abstract Vertical NRK Textured Focus */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center font-black select-none transform -translate-y-12"
        >
          <span className="text-[18vw] md:text-[12vw] leading-[0.75] font-black uppercase bg-[url('/textures/carbon.png')] bg-cover bg-center bg-clip-text text-transparent select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">N</span>
          <span className="text-[18vw] md:text-[12vw] leading-[0.75] font-black uppercase bg-[url('/textures/carbon.png')] bg-cover bg-center bg-clip-text text-transparent select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">R</span>
          <span className="text-[18vw] md:text-[12vw] leading-[0.75] font-black uppercase bg-[url('/textures/carbon.png')] bg-cover bg-center bg-clip-text text-transparent select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">K</span>
        </motion.div>

        {/* Unified Bottom Layout Control Block */}
        <div className="absolute bottom-12 left-0 w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 gap-6 md:gap-0 z-20">
          
          {/* Action Node (Left side cluster) */}
          <motion.div 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="flex items-center gap-3"
          >
            {/* India Badge */}
            <div className="flex items-center gap-1.5 border border-white/20 bg-black/50 backdrop-blur-sm px-3.5 py-2 rounded-full text-[10px] font-black tracking-widest text-white/80 select-none cursor-pointer hover:bg-white/10 transition-all">
              <ChevronDown size={12} className="text-white/60" />
              <span>🇮🇳 INDIA</span>
            </div>

            {/* Enter System Button */}
            <button 
              onClick={handleWarp}
              className="px-6 py-2 bg-[#FF0000] text-white font-sans font-black text-[10px] tracking-[0.3em] rounded-full hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)]"
            >
              ENTER_SYSTEM
            </button>
          </motion.div>

          {/* Navigation Constellation (Right side cluster) */}
          <motion.div 
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10"
          >
            {/* Labs */}
            <Link href="/labs" className="flex items-baseline gap-1.5 group cursor-pointer">
              <span className="text-[9px] font-mono font-light text-white/40 tracking-wider group-hover:text-[#FF0000] transition-colors">(03)</span>
              <span className="font-sans font-black text-2xl md:text-3xl tracking-tighter text-white group-hover:text-white/70 transition-colors uppercase">labs</span>
            </Link>

            {/* Signup/In */}
            <Link href="/login" className="flex items-baseline gap-1.5 group cursor-pointer">
              <span className="text-[9px] font-mono font-light text-white/40 tracking-wider group-hover:text-[#FF0000] transition-colors">(01)</span>
              <span className="font-sans font-black text-2xl md:text-3xl tracking-tighter text-white group-hover:text-white/70 transition-colors uppercase">login</span>
            </Link>

            {/* Instagram */}
            <a href="https://instagram.com/enark" target="_blank" rel="noopener noreferrer" className="flex items-baseline gap-1.5 group cursor-pointer">
              <span className="text-[9px] font-mono font-light text-white/40 tracking-wider group-hover:text-[#FF0000] transition-colors">(01)</span>
              <span className="font-sans font-black text-2xl md:text-3xl tracking-tighter text-white group-hover:text-white/70 transition-colors uppercase">social</span>
            </a>
          </motion.div>

        </div>
      </section>

      {/* Lookbook Body - Section 1 */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-32 z-10 bg-[#000000] overflow-hidden">
        <FoilBag />
        <div className="max-w-4xl mx-auto text-center reveal-text">
          <p className="font-serif italic text-4xl md:text-7xl leading-tight font-light text-white/90">
            "redefining the standard.<br />welcome to enark."
          </p>
        </div>
      </section>



      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center overflow-hidden pointer-events-auto"
          >
            {/* Swirling space warp elements */}
            <motion.div 
              initial={{ scale: 0.1, rotate: 0 }}
              animate={{ scale: 20, rotate: 1080 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full bg-gradient-to-r from-[#FF0000] via-purple-900 to-[#000000] blur-3xl opacity-90"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1),transparent_70%)] pointer-events-none animate-pulse"
            />
            <div className="absolute font-sans font-black text-white text-[10px] tracking-[0.5em] uppercase opacity-30">
              SYNCHRONIZING SYSTEM...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
