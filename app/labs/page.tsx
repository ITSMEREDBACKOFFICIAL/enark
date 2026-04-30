'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Droplets } from 'lucide-react';
import SizeFinder from '@/components/fit/SizeFinder';
import CareGuide from '@/components/fit/CareGuide';

type Tab = 'size' | 'care';

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'size', label: 'Size Finder', icon: Ruler,    desc: 'Get your exact ENARK size' },
  { id: 'care', label: 'Care Guide',  icon: Droplets, desc: 'How to wash & maintain your gear' },
];

export default function FitPage() {
  const [tab, setTab] = useState<Tab>('size');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <main className="min-h-screen bg-black text-white mono selection:bg-enark-red">
      <Header />

      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Page Header */}
          <div className="border-b border-white/10 pb-12 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red">Enark // Fit Tools</p>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none italic">
                FIT<span className="text-enark-red animate-pulse">_</span>
              </h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] max-w-xs md:text-right">
                Tools to help you buy right, wear right, and keep your gear in peak condition.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 gap-3">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`p-6 border text-left transition-all group ${tab === t.id ? 'border-enark-red bg-enark-red/10' : 'border-white/10 hover:border-white/30 bg-white/2'}`}
                >
                  <Icon size={18} className={`mb-3 transition-colors ${tab === t.id ? 'text-enark-red' : 'text-white/30 group-hover:text-white'}`} />
                  <p className={`text-sm font-black uppercase leading-tight ${tab === t.id ? 'text-enark-red' : 'text-white'}`}>{t.label}</p>
                  <p className="text-[10px] text-white/30 mt-1 leading-relaxed">{t.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="relative border border-white/10 bg-white/[0.02] p-8 md:p-16 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
                {[...Array(144)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-white" />
                ))}
              </div>
            </div>

            {/* Section header */}
            <div className="relative flex items-center gap-3 mb-12 pb-6 border-b border-white/10">
              {(() => { const Icon = active.icon; return <Icon size={16} className="text-enark-red" />; })()}
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em]">{active.label}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">{active.desc}</p>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === 'size' && <SizeFinder />}
                  {tab === 'care' && <CareGuide />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      <RecentlyViewed />
      <Footer />
    </main>
  );
}
