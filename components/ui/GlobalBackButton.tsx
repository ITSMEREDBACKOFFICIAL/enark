'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import { useEffect, useState } from 'react';

// Pages that manage their own back navigation
const EXCLUDED_PATHS = ['/', '/login', '/checkout', '/success'];

export default function GlobalBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { playClick } = useAudio();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Hide on excluded pages and on product pages (they have their own mobile top-bar back)
  const isExcluded =
    EXCLUDED_PATHS.includes(pathname) ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/command') ||
    pathname.startsWith('/admin');

  if (isExcluded) return null;

  const handleBack = () => {
    playClick();
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <AnimatePresence>
      <motion.button
        key={pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={handleBack}
        aria-label="Go back"
        className="fixed z-[99] md:left-0 md:top-1/2 md:-translate-y-1/2 bottom-8 left-5 md:bottom-auto group"
      >
        {/* Desktop — vertical rotated tab on left edge */}
        <div className="hidden md:flex bg-background border border-foreground/10 border-l-0 py-6 px-2.5 items-center justify-center transition-all duration-300 group-hover:bg-enark-red group-hover:border-enark-red shadow-[4px_0_20px_rgba(0,0,0,0.08)] cursor-pointer rounded-r-sm">
          <span
            className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/50 group-hover:text-white transition-colors select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            BACK
          </span>
        </div>

        {/* Mobile — floating pill at bottom-left */}
        <div className="md:hidden flex items-center gap-2.5 bg-background/90 backdrop-blur-md border border-foreground/10 px-5 py-3 rounded-full active:bg-enark-red active:border-enark-red transition-all shadow-[0_4px_20px_rgba(0,0,0,0.12)] cursor-pointer">
          <span className="w-4 h-px bg-foreground/40" />
          <span className="text-[11px] font-black tracking-[0.3em] uppercase text-foreground/70 select-none">
            BACK
          </span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
