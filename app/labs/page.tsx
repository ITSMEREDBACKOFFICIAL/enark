'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, Droplets, Activity, Shield } from 'lucide-react';
import SizeFinder from '@/components/fit/SizeFinder';
import CareGuide from '@/components/fit/CareGuide';

type Tab = 'size' | 'care' | 'kinetic' | 'stress';

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'size', label: 'Dimension Sync', icon: Ruler,    desc: 'Calibrate your exact ENARK chassis size' },
  { id: 'care', label: 'Asset Care',   icon: Droplets, desc: 'Maintain peak performance of your gear' },
  { id: 'kinetic', label: 'Kinetic Lab', icon: Activity, desc: 'Simulate fabric drape and motion' },
  { id: 'stress',  label: 'Stress Sim',  icon: Shield,   desc: 'Environmental performance metrics' },
];

export default function FitPage() {
  const [tab, setTab] = useState<Tab>('size');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red">
      <Header />


      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* Page Header */}
          <div className="border-b border-foreground/5 pb-12 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red">Enark // Neural_Fit_Module</p>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none italic text-foreground">
                LABS<span className="text-enark-red animate-pulse">_</span>
              </h1>
              <p className="text-foreground/40 text-xs font-bold uppercase tracking-[0.3em] max-w-xs md:text-right">
                ADVANCED CALIBRATION TOOLS FOR OPTIMAL ASSET INTEGRATION.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`p-6 border text-left transition-all group ${tab === t.id ? 'border-enark-red bg-enark-red/5' : 'border-foreground/5 hover:border-foreground/20 bg-foreground/5'}`}
                >
                  <Icon size={18} className={`mb-3 transition-colors ${tab === t.id ? 'text-enark-red' : 'text-foreground/20 group-hover:text-foreground'}`} />
                  <p className={`text-sm font-black uppercase leading-tight ${tab === t.id ? 'text-enark-red' : 'text-foreground'}`}>{t.label}</p>
                  <p className="text-[10px] text-foreground/40 mt-1 leading-relaxed uppercase">{t.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          <div className="relative border border-foreground/5 bg-foreground/5 p-8 md:p-16 overflow-hidden min-h-[500px]">
            {/* Simulation Background Grids */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
                {[...Array(144)].map((_, i) => (
                  <div key={i} className="border-[0.5px] border-foreground/20" />
                ))}
              </div>
            </div>

            <div className="relative z-10 h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "circOut" }}
                  className="h-full"
                >
                  {tab === 'size' && <SizeFinder />}
                  {tab === 'care' && <CareGuide />}
                  
                  {tab === 'kinetic' && (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                           <h3 className="text-3xl font-black uppercase tracking-tighter">KINETIC_MOTION_LAB</h3>
                           <p className="text-sm text-foreground/60 leading-loose uppercase">SIMULATING THE DRAPE AND FLOW OF NEURAL-BONDED TEXTILES UNDER HIGH-VELOCITY MOVEMENT PROFILES.</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 border border-foreground/5 bg-foreground/5">
                                 <p className="text-[8px] text-enark-red font-black uppercase mb-1">Viscosity</p>
                                 <p className="text-xl font-black tabular-nums">0.84 Pa·s</p>
                              </div>
                              <div className="p-4 border border-foreground/5 bg-foreground/5">
                                 <p className="text-[8px] text-enark-red font-black uppercase mb-1">Elasticity</p>
                                 <p className="text-xl font-black tabular-nums">92%</p>
                              </div>
                           </div>
                        </div>
                        
                        <motion.div 
                          className="relative h-64 bg-black border border-white/10 flex items-center justify-center overflow-hidden cursor-crosshair"
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = (e.clientX - rect.left) / rect.width;
                            const y = (e.clientY - rect.top) / rect.height;
                            // Update filter or path based on mouse
                          }}
                        >
                           {/* Procedural Fabric Wave Simulation */}
                           <svg width="100%" height="100%" className="absolute inset-0">
                             <defs>
                               <filter id="liquid">
                                 <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                                 <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="liquid" />
                               </filter>
                             </defs>
                             <motion.path 
                               initial={{ d: "M-100,128 Q256,128 612,128 T1124,128" }}
                               animate={{ 
                                 d: [
                                   "M-100,128 Q256,48 612,128 T1124,128",
                                   "M-100,150 Q256,208 612,110 T1124,140",
                                   "M-100,128 Q256,48 612,128 T1124,128"
                                 ],
                                 strokeWidth: [80, 100, 80],
                                 opacity: [0.3, 0.5, 0.3]
                               }}
                               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                               fill="none" 
                               stroke="#FF0000" 
                               strokeWidth="80" 
                               filter="url(#liquid)"
                               className="opacity-40"
                             />
                           </svg>
                           <div className="absolute top-4 left-4 flex gap-2">
                              <div className="w-1 h-1 bg-enark-red animate-ping" />
                              <span className="text-[8px] font-black tracking-widest text-white/40">LIVE_TELEMETRY</span>
                           </div>
                           <div className="relative z-10 text-[10px] font-black tracking-[0.5em] text-white/20">INTERACTIVE_MODE_ACTIVE</div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {tab === 'stress' && (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {[
                           { label: 'HYDRO_RESISTANCE', value: (98 + Math.random() * 0.5).toFixed(1), unit: 'mm/h', status: 'STABLE' },
                           { label: 'THERMAL_RETENTION', value: (24 + Math.random() * 0.8).toFixed(1), unit: 'CLO', status: 'OPTIMAL' },
                           { label: 'WIND_DEFLECTION', value: (118 + Math.random() * 5).toFixed(0), unit: 'km/h', status: 'SECURE' }
                         ].map((stat) => (
                           <div key={stat.label} className="p-8 border border-foreground/5 bg-foreground/5 space-y-4">
                              <p className="text-[10px] font-black text-enark-red tracking-[0.3em]">{stat.label}</p>
                              <div className="flex items-baseline gap-2">
                                <motion.span 
                                  initial={false}
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="text-5xl font-black tabular-nums"
                                >
                                  {stat.value}
                                </motion.span>
                                <span className="text-xs font-bold text-foreground/40">{stat.unit}</span>
                              </div>
                              <div className="flex items-center gap-2 pt-4 border-t border-foreground/5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                 <span className="text-[8px] font-black tracking-widest">{stat.status}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                      
                      <div className="h-40 border border-foreground/10 bg-foreground/[0.02] relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,0,0,0.05)_50%,transparent_100%)] animate-scan" />
                         <p className="text-[10px] font-black tracking-[1em] text-foreground/20 animate-pulse">RUNNING_ENVIRONMENTAL_SIM_v4.0.2</p>
                      </div>
                    </div>
                  )}
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
