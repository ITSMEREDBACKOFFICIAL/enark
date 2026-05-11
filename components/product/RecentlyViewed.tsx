'use client';

import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RecentlyViewed() {
  const { items, clearHistory } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background py-32 border-t border-foreground/10 px-6 md:px-12 mono"
        >
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter-x uppercase">Recently Viewed</h2>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-4">
                   <div className="h-[1px] w-32 bg-foreground/10 self-center" />
                   <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest self-center">Showing_Last_{items.length}_Nodes</p>
                </div>
                <button 
                  onClick={() => clearHistory()}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-enark-red transition-colors group"
                >
                  <Trash2 size={12} className="group-hover:animate-pulse" />
                  <span>Clear History</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/shop?product_id=${item.id}`} className="group block">
                    <div className="aspect-[3/4] bg-foreground/5 border border-foreground/10 mb-6 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover grayscale-0 md:grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-enark-red/0 group-hover:bg-enark-red/10 transition-colors duration-500" />
                      <div className="absolute bottom-4 right-4 translate-y-0 md:translate-y-8 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <div className="bg-foreground text-background p-3">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-enark-red">{item.category}</p>
                      <h3 className="text-[11px] font-black uppercase tracking-widest">{item.name}</h3>
                      <p className="text-xs font-bold text-foreground/60 mono">₹{item.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
