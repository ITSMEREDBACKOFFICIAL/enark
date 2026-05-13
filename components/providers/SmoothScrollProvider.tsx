'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const Lenis = require('lenis').default;
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Handle ScrollTrigger update
    lenis.on('scroll', ScrollTrigger.update);

    // Expose to window for external control
    if (typeof window !== 'undefined') {
      (window as any).lenis = lenis;
    }

    // Optimized Ticker Sync
    function update(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      if (typeof window !== 'undefined') {
        delete (window as any).lenis;
      }
      gsap.ticker.remove(update);
    };
  }, []);

  return <>{children}</>;
}
