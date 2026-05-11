'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const IMAGES = [
  { src: '/images/studio_editorial_hero.png', title: 'THE ARCHIVE', label: 'CAMPAIGN' },
  { src: '/images/silk_saree_luxury_1776743251836.png', title: 'SILK SAREE', label: 'PREMIUM' },
  { src: '/images/utility_parka_luxury_1776743275844.png', title: 'UTILITY PARKA', label: 'OUTERWEAR' },
];

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function CinematicGallery() {
  const [[page, direction], setPage] = useState([0, 0]);

  // We only have 3 images, but we want to infinitely loop them
  const imageIndex = Math.abs(page % IMAGES.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background flex items-center justify-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0 w-screen h-screen cursor-grab active:cursor-grabbing"
        >
          <Image 
            src={IMAGES[imageIndex].src}
            alt={IMAGES[imageIndex].title}
            fill
            className="object-cover"
            priority={true}
          />
          {/* Subtle gradient overlay to ensure header legibility if image is too bright */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
          
          {/* Floating Product Label Overlay */}
          <div className="absolute bottom-32 left-0 w-full flex flex-col items-center justify-center text-white z-10 opacity-80 pointer-events-none">
             <span className="text-[10px] font-black tracking-[0.3em] mb-2">{IMAGES[imageIndex].label}</span>
             <h2 className="text-3xl font-black tracking-widest uppercase">{IMAGES[imageIndex].title}</h2>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Edge Gradients for smooth styling */}
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-foreground/10 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-foreground/10 to-transparent pointer-events-none z-10" />
    </div>
  );
}
