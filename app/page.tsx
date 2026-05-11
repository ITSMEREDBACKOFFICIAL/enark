'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CinematicGallery from '@/components/home/CinematicGallery';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMenuStore } from '@/store/useMenuStore';
import { ChevronDown, Instagram, Ruler } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MinimalGuide from '@/components/ui/MinimalGuide';

import { useAudio } from '@/hooks/useAudio';
export default function Home() {
  const { playWarp, playClick } = useAudio();
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

    // GSAP staggered reveal for text elements
    const ctx = gsap.context(() => {
      // 1. Staggered reveal for section text
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

      // 2. Unique Hero Shrink Animation (Enhanced with 3D and Blur)
      gsap.to('.hero-gallery-wrapper', {
        scale: 0.8,
        rotateX: 10,
        filter: 'blur(10px) grayscale(0.5)',
        borderRadius: '48px',
        opacity: 0.3,
        scrollTrigger: {
          trigger: 'main',
          start: 'top top',
          end: '+=100%',
          scrub: true,
        }
      });

      // 3. Fade out CTA button
      gsap.to('.hero-cta', {
        opacity: 0,
        y: -20,
        scrollTrigger: {
          trigger: 'main',
          start: 'top top',
          end: '+=30%',
          scrub: true,
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-enark-red selection:text-white mono">
      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* System Status Indicator */}
      <div className="fixed top-24 left-6 z-[50] flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-enark-red animate-pulse" />
          <span className="text-[8px] font-black tracking-[0.2em]">ENARK_OS // OPTIMAL</span>
        </div>
        <span className="text-[7px] text-foreground/50 tracking-[0.1em]">NODE_SYNC: ACTIVE</span>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[200vh] w-full z-10 bg-transparent">
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
          {/* Cinematic Floating Gallery Wrapper */}
          <div className="hero-gallery-wrapper absolute inset-0 overflow-hidden origin-center">
            <CinematicGallery />
          </div>

          {/* Minimalist Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              x: [0, 5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="hidden md:flex absolute bottom-12 right-12 items-center gap-4 z-20"
          >
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-enark-red shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white/40">Scroll</span>
          </motion.div>

          {/* Fit Labs Quick Access Overlay */}
          <div className="hidden md:block absolute bottom-12 left-12 z-30">
            <Link 
              href="/labs"
              className="flex items-center gap-4 group"
              onClick={() => playClick()}
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5 group-hover:border-enark-red group-hover:bg-enark-red/10 transition-all">
                <Ruler size={16} className="text-white group-hover:text-enark-red transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black tracking-[0.3em] text-white/40 uppercase">NEURAL_CALIBRATION</span>
                <span className="text-[10px] font-black tracking-widest text-white uppercase group-hover:text-enark-red transition-colors">FIT_LABS</span>
              </div>
            </Link>
          </div>

          {/* Unified Bottom Layout Control Block */}
          <div className="hero-cta absolute bottom-12 left-0 w-full flex justify-center items-center z-20 px-6">
            <button 
              onClick={handleWarp}
              className="group relative w-full max-w-xs md:max-w-none md:w-auto px-12 py-4 bg-white text-black text-[11px] font-black tracking-[0.4em] uppercase overflow-hidden hover:text-white transition-colors duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
            >
              <span className="relative z-10">Shop Now</span>
              <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </div>
        </div>
      </section>

      {/* Lookbook Body - Section 1 */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-32 z-20 bg-background overflow-hidden border-t border-foreground/5 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto text-center reveal-text">
          <p className="font-serif italic text-4xl md:text-7xl leading-tight font-light text-foreground/90">
            "redefining the standard."
          </p>
        </div>
      </section>



      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background flex items-center justify-center overflow-hidden pointer-events-auto"
          >
            {/* Swirling space warp elements */}
            <motion.div 
              initial={{ scale: 0.1, rotate: 0 }}
              animate={{ scale: 20, rotate: 1080 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full bg-gradient-to-r from-enark-red via-background to-background blur-3xl opacity-90"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,42,42,0.1),transparent_70%)] pointer-events-none animate-pulse"
            />
            <div className="absolute font-sans font-black text-foreground text-[10px] tracking-[0.5em] uppercase opacity-30">
              SYNCHRONIZING SYSTEM...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
