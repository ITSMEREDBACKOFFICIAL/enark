'use client';

import { useState, useEffect } from 'react';

export default function SaleTicker({ text = 'Free shipping on all orders' }: { text?: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const targetTime = new Date('2026-12-31T23:59:59').getTime();

    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return false;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return true;
    };

    tick();
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-black border-b border-white/10 py-2 select-none">
      <div className="flex items-center justify-center gap-5 text-[11px] font-medium tracking-normal text-white/50 mono">
        <span>{text}</span>
        <span className="text-white/20">·</span>
        <span>
          Sale ends in{' '}
          {isClient ? (
            <span className="text-white font-black">
              {fmt(timeLeft.hours)}:{fmt(timeLeft.minutes)}:{fmt(timeLeft.seconds)}
            </span>
          ) : (
            <span className="text-white/30">--:--:--</span>
          )}
        </span>
      </div>
    </div>
  );
}
