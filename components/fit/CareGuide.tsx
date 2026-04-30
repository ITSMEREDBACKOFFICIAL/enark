'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Wind, Thermometer, AlertTriangle } from 'lucide-react';

const MATERIALS: Record<string, {
  wash: string; temp: string; dry: string; iron: string; bleach: string; notes: string; tags: string[];
}> = {
  'Cotton': {
    wash: 'Machine wash inside-out', temp: '30°C max', dry: 'Tumble dry low or air dry flat',
    iron: 'Medium heat, damp cloth recommended', bleach: 'Non-chlorine only',
    notes: 'May shrink on first wash. Pre-wash before wearing to set dye.',
    tags: ['Breathable', 'Durable', 'Easy Care'],
  },
  'Nylon / Polyamide': {
    wash: 'Machine wash gentle cycle', temp: '30°C max', dry: 'Air dry only — no tumble',
    iron: 'Low heat only — synthetic melts easily', bleach: 'Do not bleach',
    notes: 'Prone to static. Use fabric softener sparingly. Avoid high heat at all times.',
    tags: ['Durable', 'Water-Resistant', 'Quick-Dry'],
  },
  'Polyester': {
    wash: 'Machine wash gentle', temp: '40°C max', dry: 'Tumble dry low',
    iron: 'Low heat — or steam from reverse side', bleach: 'Do not bleach',
    notes: 'Wash inside-out to reduce pilling. Avoid fabric softeners — reduces moisture-wicking.',
    tags: ['Wrinkle-Resistant', 'Lightweight', 'Fast-Dry'],
  },
  'Wool / Merino': {
    wash: 'Hand wash or wool cycle only', temp: 'Cold — 20°C max', dry: 'Lay flat to dry — never hang',
    iron: 'Steam only — never direct iron', bleach: 'Never bleach',
    notes: 'Wool felts under heat and agitation. Store folded, not hung. Cedar blocks prevent moths.',
    tags: ['Insulating', 'Odour-Resistant', 'Natural'],
  },
  'Elastane / Spandex': {
    wash: 'Hand wash or delicate machine cycle', temp: 'Cold — 20°C max', dry: 'Air dry flat — never tumble',
    iron: 'Do not iron', bleach: 'Do not bleach',
    notes: 'Avoid contact with chlorine (pool water). Heat degrades stretch permanently.',
    tags: ['Stretch', 'Form-Fitting', 'Recovery'],
  },
  'Linen': {
    wash: 'Machine wash or hand wash', temp: '40°C max', dry: 'Air dry or low tumble',
    iron: 'High heat while damp — linen irons well', bleach: 'Non-chlorine only',
    notes: 'Softens with each wash. Creasing is natural to the fabric — it is not a defect.',
    tags: ['Breathable', 'Natural', 'Summer-Weight'],
  },
  'Graphene Mesh (ENARK)': {
    wash: 'Hand wash only', temp: 'Cold — 20°C max', dry: 'Air dry in shade',
    iron: 'Do not iron', bleach: 'Never bleach',
    notes: 'Proprietary ENARK substrate. Avoid machine washing — mesh structure distorts under agitation. Do not tumble dry.',
    tags: ['Thermal-Adaptive', 'Experimental', 'High-Performance'],
  },
};

const ICONS = [
  { icon: Droplets, label: 'Wash' },
  { icon: Thermometer, label: 'Temp' },
  { icon: Wind, label: 'Dry' },
];

export default function CareGuide() {
  const [selected, setSelected] = useState<string | null>(null);
  const care = selected ? MATERIALS[selected] : null;

  return (
    <div className="space-y-10 py-4">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Wash & Care Guide</h2>
        <p className="text-[11px] text-white/40 uppercase tracking-widest">Select the primary fabric of your garment</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(MATERIALS).map((mat) => (
          <button
            key={mat}
            onClick={() => setSelected(mat === selected ? null : mat)}
            className={`p-4 border text-left transition-all ${selected === mat ? 'border-enark-red bg-enark-red/10' : 'border-white/10 hover:border-white/30 bg-white/2'}`}
          >
            <p className={`text-xs font-black uppercase leading-tight ${selected === mat ? 'text-enark-red' : ''}`}>{mat}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {MATERIALS[mat].tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[8px] text-white/30 uppercase tracking-wider">{t}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {care && selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-white/10 bg-white/2 p-8 space-y-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-enark-red font-black uppercase tracking-widest mb-1">Care Protocol</p>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{selected}</h3>
              </div>
              <div className="flex gap-2">
                {care.tags.map((t) => (
                  <span key={t} className="text-[9px] border border-white/10 px-3 py-1 uppercase tracking-widest text-white/40">{t}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Wash', value: care.wash },
                { label: 'Temperature', value: care.temp },
                { label: 'Drying', value: care.dry },
                { label: 'Ironing', value: care.iron },
              ].map((item) => (
                <div key={item.label} className="border border-white/10 p-5 space-y-2">
                  <p className="text-[9px] text-white/40 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xs font-black leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-4 bg-enark-red/5 border border-enark-red/20 p-5">
              <AlertTriangle size={14} className="text-enark-red shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Important Note</p>
                <p className="text-xs leading-relaxed text-white/70">{care.notes}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
