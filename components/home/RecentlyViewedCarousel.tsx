'use client';

import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

export default function RecentlyViewedCarousel() {
  const { items } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-black border-t border-white/10 mono">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <p className="text-enark-red text-[11px] font-black tracking-widest uppercase">Telemetry_Logs</p>
            <h2 className="text-2xl font-black tracking-tighter-x uppercase">Recently_Accessed</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scroll('left')} className="p-4 border border-white/10 hover:border-white transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll('right')} className="p-4 border border-white/10 hover:border-white transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto no-scrollbar momentum-scroll border border-white/10"
        >
          {items.map((item) => (
            <motion.a 
              key={item.id}
              href={`/shop?product_id=${item.id}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="min-w-[320px] group border-r border-white/10 p-6 hover:bg-white/5 transition-all bg-[#050505]"
            >
              <div className="aspect-[4/5] bg-white/5 overflow-hidden mb-6 relative border border-white/10">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-enark-red text-white text-[11px] font-black px-2 py-1 uppercase tracking-widest">LOGGED</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-tighter">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-white/60 uppercase">EN-{item.id.slice(0, 4)}</p>
                  <p className="text-xs font-black text-enark-red">₹{item.price.toLocaleString()}</p>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
