'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DeepvoidIntro() {
  const [config, setConfig] = useState({
    heroTitle: 'DEEP_VOID_COLLECTION',
    heroSubtitle: 'ARCHITECTURAL_GARMENTS // BATCH_001'
  });

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('app_config').select('hero_title, hero_subtitle').eq('id', 'main').single();
      if (data) {
        setConfig({
          heroTitle: data.hero_title || 'DEEP_VOID_COLLECTION',
          heroSubtitle: data.hero_subtitle || 'ARCHITECTURAL_GARMENTS // BATCH_001'
        });
      }
    }
    fetchConfig();

    const channel = supabase.channel('system_sync')
      .on('broadcast', { event: 'system_update' }, () => {
        fetchConfig();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="bg-black py-20 px-6 md:px-12 overflow-hidden border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto">
        <div className="relative aspect-[21/9] md:aspect-[25/9] bg-[#050505] border border-white/10 overflow-hidden flex items-center justify-center group cursor-default">
           {/* Technical Background */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 opacity-5 pointer-events-none">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-white/20" />
              ))}
           </div>

           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5, ease: "circOut" }}
             className="relative z-10 text-center space-y-6"
           >
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-[0.2em] text-white group-hover:text-enark-red transition-all duration-1000">
                {config.heroTitle}
              </h1>
              <p className="text-xs font-bold text-white/60 uppercase tracking-[0.5em]">{config.heroSubtitle}</p>
           </motion.div>

           {/* Scroll Indicator */}
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-black uppercase tracking-widest text-white">Scroll_to_Nexus</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowDown size={12} className="text-enark-red" />
              </motion.div>
           </div>
        </div>
      </div>
    </section>
  );
}
