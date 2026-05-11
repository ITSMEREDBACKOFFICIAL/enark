'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const GALLERY_ITEMS = [
  { id: 1, src: '/images/exo-jacket/front.png', speed: 0.1, top: '20%', left: '10%', size: '300px' },
  { id: 2, src: '/images/exo-jacket/back.png', speed: 0.3, top: '15%', left: '60%', size: '400px' },
  { id: 3, src: '/images/exo-jacket/detail.png', speed: 0.2, top: '45%', left: '35%', size: '350px' },
  { id: 4, src: '/images/exo-jacket/lifestyle.png', speed: 0.4, top: '60%', left: '15%', size: '450px' },
  { id: 5, src: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop', speed: 0.15, top: '70%', left: '55%', size: '380px' },
];

function GalleryCard({ item, progress }: { item: typeof GALLERY_ITEMS[0], progress: MotionValue<number> }) {
  // Each card has a unique parallax offset based on its 'speed'
  const y = useTransform(progress, [0, 1], [0, -1000 * item.speed]);
  const rotate = useTransform(progress, [0, 1], [0, item.id % 2 === 0 ? 10 : -10]);
  const scale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 1.1]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: item.top,
        left: item.left,
        width: item.size,
        height: 'auto',
        y,
        rotate,
        scale,
        zIndex: Math.floor(item.speed * 100),
      }}
      className="rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-black/20 backdrop-blur-sm"
    >
      <img src={item.src} alt="" className="w-full h-full object-cover" />
      <div className="absolute bottom-4 left-4">
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">ASSET_REF // 0{item.id}</span>
      </div>
    </motion.div>
  );
}

export default function ParallaxGallery({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // We want the gallery to start becoming prominent after the hero transition (e.g. scroll > 0.3)
  const opacity = useTransform(scrollProgress, [0.2, 0.4, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.section 
      style={{ opacity }}
      className="relative w-full h-[200vh] pointer-events-none"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
           <h3 className="text-[15vw] font-black italic uppercase tracking-tighter text-white/5 select-none">
             ARCHIVE_01
           </h3>
        </div>
        
        {GALLERY_ITEMS.map((item) => (
          <GalleryCard key={item.id} item={item} progress={scrollProgress} />
        ))}
      </div>
    </motion.section>
  );
}
