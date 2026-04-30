'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Info } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

const SIZE_DATA = {
  tops: [
    { size: 'S', chest: '40', length: '27', shoulder: '18' },
    { size: 'M', chest: '42', length: '28', shoulder: '19' },
    { size: 'L', chest: '44', length: '29', shoulder: '20' },
    { size: 'XL', chest: '46', length: '30', shoulder: '21' },
  ],
  bottoms: [
    { size: '30', waist: '31', length: '40', thigh: '24' },
    { size: '32', waist: '33', length: '41', thigh: '25' },
    { size: '34', waist: '35', length: '42', thigh: '26' },
    { size: '36', waist: '37', length: '43', thigh: '27' },
  ]
};

export default function SizeGuide({ isOpen, onClose, category = 'tops' }: SizeGuideProps) {
  const data = category.toLowerCase().includes('pant') || category.toLowerCase().includes('short') ? SIZE_DATA.bottoms : SIZE_DATA.tops;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-black border border-white/20 p-8 shadow-[0_0_100px_rgba(255,0,0,0.1)]"
          >
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <Ruler className="text-enark-red" size={20} />
                <h3 className="text-2xl font-black uppercase tracking-tighter-x">SIZE_BLUEPRINT // {category.toUpperCase()}</h3>
              </div>
              <button onClick={onClose} className="hover:text-enark-red transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <div className="p-4 border border-white/5 bg-white/5">
                  <p className="text-xs font-black uppercase tracking-widest text-enark-red mb-2">Technical_Note</p>
                  <p className="text-xs text-white/60 leading-relaxed uppercase tracking-widest">
                    All measurements are in inches. Silhouette is designed for a boxy, oversized fit. If you prefer a standard fit, size down.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-enark-red rounded-full" />
                    <p className="text-xs font-bold uppercase tracking-widest">Premium Heavyweight Fabric</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-enark-red rounded-full" />
                    <p className="text-xs font-bold uppercase tracking-widest">Pre-shrunk for stability</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="py-4 text-xs font-black uppercase tracking-widest text-white/60">SIZE</th>
                      {Object.keys(data[0]).filter(k => k !== 'size').map(key => (
                        <th key={key} className="py-4 text-xs font-black uppercase tracking-widest text-white/60">{key.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((row: any) => (
                      <tr key={row.size} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 text-xs font-black text-enark-red">{row.size}</td>
                        {Object.keys(row).filter(k => k !== 'size').map(key => (
                          <td key={key} className="py-4 text-xs mono text-white/80">{row[key]}"</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-8 border-t border-white/10 opacity-20">
              <Info size={14} />
              <p className="text-[11px] font-bold uppercase tracking-[0.3em]">System_Integrity_Verified // Precision_Crafted</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
