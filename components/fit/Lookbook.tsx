'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOOKS = [
  {
    id: 'L01',
    title: 'VOID OPERATIVE',
    category: 'Utility',
    description: 'Full-black tactical silhouette. Function-first, zero compromise.',
    image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80',
    pieces: ['VOID_KINETIC_SHELL', 'CORE_CARGO_PANT', 'NEURAL_BASE_TEE'],
    tags: ['All-Black', 'Utility', 'Structured'],
  },
  {
    id: 'L02',
    title: 'THERMAL LAYER',
    category: 'Layering',
    description: 'Precision layering for cold environments. Architectural bulk, controlled proportion.',
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80',
    pieces: ['AERO_SHIELD_JACKET', 'NEURAL_TETHER_TOP', 'KINETIC_CARGO'],
    tags: ['Layered', 'Winter', 'Oversized'],
  },
  {
    id: 'L03',
    title: 'MINIMAL PROTOCOL',
    category: 'Minimal',
    description: 'Stripped back to essentials. Clean lines, absolute silence.',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80',
    pieces: ['CORE_FLUX_TEE', 'MONO_STRAIGHT_PANT'],
    tags: ['Minimal', 'Monochrome', 'Clean'],
  },
  {
    id: 'L04',
    title: 'FIELD READY',
    category: 'Utility',
    description: 'Built for movement. Maximum pocket, maximum range of motion.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    pieces: ['KINETIC_SHELL_VEST', 'NEURAL_TETHER_TOP', 'CORE_FLUX_CARGO'],
    tags: ['Movement', 'Utility', 'Outdoor'],
  },
  {
    id: 'L05',
    title: 'SIGNAL BLACK',
    category: 'Minimal',
    description: 'Evening-ready brutalism. Understated weight, unmistakable presence.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    pieces: ['VOID_KINETIC_SHELL', 'MONO_STRAIGHT_PANT', 'AERO_BASE'],
    tags: ['Evening', 'Minimal', 'Premium'],
  },
  {
    id: 'L06',
    title: 'BRUTALIST ARCHIVE',
    category: 'Layering',
    description: 'Mixing seasons, mixing weights. The archive look — intentional, referential.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    pieces: ['AERO_SHIELD_JACKET', 'CORE_TETHER_JUMP', 'MONO_BASE'],
    tags: ['Archive', 'Mixed Season', 'Statement'],
  },
];

const CATEGORIES = ['All', 'Utility', 'Layering', 'Minimal'];

export default function Lookbook() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLook, setActiveLook] = useState<typeof LOOKS[0] | null>(null);

  const filtered = activeCategory === 'All' ? LOOKS : LOOKS.filter((l) => l.category === activeCategory);

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Lookbook</h2>
          <p className="text-[11px] text-white/40 uppercase tracking-widest">Curated outfit systems — how to wear ENARK</p>
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((look) => (
            <motion.button
              key={look.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLook(look)}
              className="group relative aspect-[3/4] overflow-hidden border border-white/10 hover:border-white/30 transition-all text-left"
            >
              <img src={look.image} alt={look.title} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[9px] text-enark-red font-black uppercase tracking-widest mb-1">{look.category} // {look.id}</p>
                <p className="text-sm font-black uppercase leading-tight">{look.title}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {look.tags.map((t) => (
                    <span key={t} className="text-[8px] border border-white/20 px-2 py-0.5 uppercase tracking-wider text-white/50">{t}</span>
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {activeLook && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveLook(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative z-10 w-full max-w-2xl bg-black border border-white/10 overflow-hidden grid md:grid-cols-2">
              <div className="aspect-[3/4] md:aspect-auto relative">
                <img src={activeLook.image} alt={activeLook.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] text-enark-red font-black uppercase tracking-widest mb-2">{activeLook.category} // {activeLook.id}</p>
                    <h3 className="text-3xl font-black uppercase tracking-tighter">{activeLook.title}</h3>
                    <p className="text-sm text-white/50 mt-3 leading-relaxed">{activeLook.description}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Pieces in this look</p>
                    <ul className="space-y-2">
                      {activeLook.pieces.map((p) => (
                        <li key={p} className="text-xs font-black uppercase flex items-center gap-2">
                          <span className="text-enark-red">▸</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button onClick={() => setActiveLook(null)} className="mt-8 w-full border border-white/10 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
