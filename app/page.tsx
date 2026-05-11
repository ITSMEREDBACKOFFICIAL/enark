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
import { ChevronDown, Instagram, Ruler, Shield, Zap, Activity, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MinimalGuide from '@/components/ui/MinimalGuide';
import SpectraNoise from '@/components/ui/SpectraNoise';
import { useAudio } from '@/hooks/useAudio';

export default function Home() {
  const { playWarp, playClick, playHum } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const { toggleMenu } = useMenuStore();
  const router = useRouter();
  const [isWarping, setIsWarping] = useState(false);
  const [systemStatus, setSystemStatus] = useState('OPTIMAL');

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
      // Reveal animations for sections
      gsap.fromTo(
        '.reveal-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.reveal-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      // Parallax effect for the cinematic gallery wrapper
      gsap.to('.parallax-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.parallax-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-black text-white selection:bg-enark-red selection:text-white mono overflow-x-hidden">
      
      {/* Background Layer */}
      <SpectraNoise />
      
      {/* Global Grain & Scanline Overlays (Handled in Shader but extra for depth) */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <Header />
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute top-32 left-12 hidden lg:block">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-2"
          >
            <span className="text-[10px] font-black tracking-[0.5em] text-enark-red">ENARK_OS // v2.0.4</span>
            <span className="text-[8px] text-white/40 uppercase tracking-widest">Neural_Mesh_Active</span>
          </motion.div>
        </div>

        <div className="flex flex-col items-center text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-4"
          >
            <h1 className="text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter-x italic leading-[0.75]">
              OBSIDIAN
            </h1>
            <h1 className="text-[12vw] md:text-[10vw] font-black uppercase tracking-tighter-x italic leading-[0.75] text-transparent stroke-white stroke-1">
              MANIFESTO
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.8 }}
            className="max-w-md"
          >
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] leading-relaxed">
              Industrial grade aesthetic for the high-performance individual. 
              Engineered in the Enark Node 01.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="pt-12"
          >
            <button 
              onClick={handleWarp}
              onMouseEnter={() => playHum()}
              className="group relative px-16 py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] overflow-hidden hover:text-white transition-all duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <span className="relative z-10">INITIATE_UPLINK</span>
              <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </button>
          </motion.div>
        </div>

        {/* Bottom Metrics */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
          <div className="flex gap-12">
            {[
              { label: 'Latency', val: '0.04ms' },
              { label: 'Uptime', val: '99.9%' },
              { label: 'Node', val: 'IN_01' }
            ].map((stat) => (
              <div key={stat.label} className="hidden md:flex flex-col gap-1">
                <span className="text-[7px] text-white/30 uppercase tracking-widest">{stat.label}</span>
                <span className="text-[10px] font-bold text-white/60">{stat.val}</span>
              </div>
            ))}
          </div>
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/30">Scroll_To_Explore</span>
            <ChevronDown size={14} className="text-enark-red" />
          </motion.div>
        </div>
      </section>

      {/* --- CINEMATIC GALLERY SECTION --- */}
      <section className="relative min-h-screen py-32 bg-transparent overflow-hidden parallax-container">
        <div className="max-w-screen-2xl mx-auto px-6 reveal-section">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-enark-red text-[10px] font-black tracking-[0.5em] uppercase">Visual_Archive</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">THE_STILL_FRAME</h2>
            </div>
            <Link 
              href="/shop" 
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors border-b border-white/10 pb-2"
            >
              View_All_Assets
            </Link>
          </div>
        </div>
        
        <div className="parallax-bg relative h-[120vh] -mt-[10vh]">
          <CinematicGallery />
        </div>
      </section>

      {/* --- FEATURE MATRIX --- */}
      <section className="relative py-32 bg-black/40 backdrop-blur-3xl border-y border-white/5">
        <div className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Shield, title: 'SECURE_TRANSFERS', desc: 'Encrypted payment protocols with real-time verification nodes.' },
            { icon: Zap, title: 'INSTANT_DISPATCH', desc: 'Express deployment from our decentralized fulfillment mesh.' },
            { icon: Globe, title: 'NEURAL_NETWORK', desc: 'Join a community of 50k+ high-performance operatives.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-12 border border-white/10 bg-white/[0.02] space-y-6 group hover:border-enark-red transition-all"
            >
              <feature.icon size={32} className="text-white/20 group-hover:text-enark-red transition-colors" />
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.4em]">{feature.title}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
