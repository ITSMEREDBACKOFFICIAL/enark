'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

const SIZE_CHART = [
  { size: 'XS', chest: [76, 88],  waist: [61, 73] },
  { size: 'S',  chest: [88, 96],  waist: [73, 80] },
  { size: 'M',  chest: [96, 104], waist: [80, 88] },
  { size: 'L',  chest: [104,112], waist: [88, 96] },
  { size: 'XL', chest: [112,120], waist: [96,104] },
  { size: 'XXL',chest: [120,136], waist: [104,120]},
];

const FIT_NOTES: Record<string, string> = {
  XS: 'Slim, close-to-body cut. Best for lean, narrow builds.',
  S:  'Slightly relaxed at the torso. Works across most slim builds.',
  M:  'Standard ENARK fit. Designed around this size.',
  L:  'Eased through chest and waist. Structured shoulder stays sharp.',
  XL: 'Full through the torso. Silhouette remains architectural.',
  XXL:'Maximum ease. Oversized intent. Intentionally voluminous.',
};

export default function SizeFinder() {
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const c = Number(chest);
    const w = Number(waist);
    const match = SIZE_CHART.find(
      (s) => c >= s.chest[0] && c < s.chest[1] && w >= s.waist[0] && w < s.waist[1]
    ) || SIZE_CHART.find((s) => c >= s.chest[0] && c < s.chest[1])
      || SIZE_CHART.find((s) => w >= s.waist[0] && w < s.waist[1]);
    setResult(match?.size ?? 'XL');
  };

  const reset = () => { setResult(null); setChest(''); setWaist(''); setHeight(''); };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10 py-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-2">Recommended Size</p>
          <p className="text-[120px] font-black leading-none tracking-tighter text-white">{result}</p>
          <p className="text-enark-red text-xs font-black uppercase tracking-widest mt-2">ENARK Standard Fit</p>
        </div>
        <p className="text-sm text-white/60 max-w-sm mx-auto leading-relaxed">{FIT_NOTES[result]}</p>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {SIZE_CHART.map((s) => (
            <div key={s.size} className={`p-4 border text-center transition-all ${s.size === result ? 'border-enark-red bg-enark-red/10' : 'border-white/10'}`}>
              <p className={`text-lg font-black ${s.size === result ? 'text-enark-red' : 'text-white/30'}`}>{s.size}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Ch: {s.chest[0]}–{s.chest[1]}</p>
            </div>
          ))}
        </div>
        <button onClick={reset} className="border border-white/10 px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Recalculate
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-10 py-8">
      <div className="flex items-center gap-4">
        <Ruler size={20} className="text-enark-red" />
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Find Your Size</h2>
          <p className="text-[11px] text-white/40 uppercase tracking-widest">Enter measurements in centimetres</p>
        </div>
      </div>
      <form onSubmit={calculate} className="space-y-6">
        {[
          { label: 'Chest Circumference', sublabel: 'Measure around the fullest part', val: chest, set: setChest, required: true },
          { label: 'Waist Circumference', sublabel: 'Measure around your natural waist', val: waist, set: setWaist, required: true },
          { label: 'Height (optional)', sublabel: 'Helps estimate length fit', val: height, set: setHeight, required: false },
        ].map((f) => (
          <div key={f.label} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-black uppercase tracking-widest">{f.label}</label>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">{f.sublabel}</span>
            </div>
            <div className="relative">
              <input
                required={f.required}
                type="number"
                min={40} max={200}
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder="e.g. 96"
                className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm outline-none focus:border-white/40 transition-all placeholder:text-white/20"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-white/30 font-bold uppercase">cm</span>
            </div>
          </div>
        ))}
        <button type="submit" className="w-full bg-white text-black py-5 text-xs font-black uppercase tracking-[0.3em] hover:bg-enark-red hover:text-white transition-all">
          Calculate My Size
        </button>
      </form>
      <p className="text-[9px] text-white/20 uppercase tracking-widest text-center">
        All ENARK garments follow standard unisex sizing. When in doubt, size up.
      </p>
    </div>
  );
}
