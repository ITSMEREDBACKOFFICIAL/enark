'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

const FABRICS: Record<string, {
  breathability: number; durability: number; sustainability: number; careEase: number;
  description: string; bestFor: string[]; avoid: string[];
}> = {
  '100% Cotton': {
    breathability: 9, durability: 7, sustainability: 8, careEase: 8,
    description: 'Natural cellulose fibre. Soft, breathable, and hypoallergenic. Standard for most casual and performance wear.',
    bestFor: ['Everyday wear', 'Warm climates', 'Sensitive skin'],
    avoid: ['Heavy rain', 'Performance sport — absorbs sweat and stays wet'],
  },
  '100% Polyester': {
    breathability: 4, durability: 9, sustainability: 2, careEase: 9,
    description: 'Synthetic petroleum-based fibre. Wrinkle-resistant and long-lasting but traps heat and sheds microplastics.',
    bestFor: ['Activewear', 'Outerwear linings', 'Budget-friendly performance'],
    avoid: ['Hot weather', 'If you run warm'],
  },
  '80% Polyester 20% Elastane': {
    breathability: 5, durability: 8, sustainability: 2, careEase: 7,
    description: 'High-stretch synthetic blend. Excellent recovery and shape retention. Common in fitted activewear and base layers.',
    bestFor: ['Compression garments', 'Fitted base layers', 'Athletic wear'],
    avoid: ['Chlorine (pool) exposure', 'High heat washing or drying'],
  },
  '100% Nylon': {
    breathability: 5, durability: 10, sustainability: 3, careEase: 8,
    description: 'Strongest synthetic fibre by weight. Abrasion-resistant, water-repellent, and lightweight. Industry-standard for outerwear shells.',
    bestFor: ['Outerwear', 'Cargo pants', 'Technical shells'],
    avoid: ['Prolonged UV exposure — degrades over time', 'High heat ironing'],
  },
  '100% Merino Wool': {
    breathability: 10, durability: 6, sustainability: 7, careEase: 4,
    description: 'Fine natural protein fibre with natural temperature regulation and odour resistance. Premium feel, delicate care.',
    bestFor: ['Base layers', 'Travel', 'Cold climates', 'Next-to-skin wear'],
    avoid: ['Machine wash agitation', 'Heat — felts permanently'],
  },
  '100% Linen': {
    breathability: 10, durability: 8, sustainability: 9, careEase: 6,
    description: 'Derived from flax plant. One of the most breathable natural fibres. Gets softer with each wash. Creases naturally.',
    bestFor: ['Summer garments', 'Relaxed-fit shirts', 'Hot climates'],
    avoid: ['Expecting wrinkle-free results — creasing is inherent'],
  },
  '60% Cotton 40% Polyester': {
    breathability: 7, durability: 8, sustainability: 5, careEase: 9,
    description: 'Popular poly-cotton blend. Combines the softness and breathability of cotton with the durability and wrinkle-resistance of polyester.',
    bestFor: ['T-shirts', 'Hoodies', 'Everyday essentials'],
    avoid: ['Heavy performance use — moisture management is average'],
  },
};

const Bar = ({ value, color = 'bg-enark-red' }: { value: number; color?: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-1 bg-white/10">
      <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${value * 10}%` }} />
    </div>
    <span className="text-[10px] font-black text-white/40 w-4">{value}</span>
  </div>
);

export default function FabricDecoder() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const decode = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    const match = Object.keys(FABRICS).find(
      (k) => k.toLowerCase() === q.toLowerCase()
    ) || Object.keys(FABRICS).find(
      (k) => k.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(k.toLowerCase().split(' ')[1] || '')
    );
    setResult(match ?? '__NOT_FOUND__');
  };

  const fabric = result && result !== '__NOT_FOUND__' ? FABRICS[result] : null;

  return (
    <div className="space-y-10 py-4">
      <div>
        <h2 className="text-xl font-black uppercase tracking-tighter mb-1">Fabric Decoder</h2>
        <p className="text-[11px] text-white/40 uppercase tracking-widest">Enter the fabric composition from your garment tag</p>
      </div>

      <form onSubmit={decode} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setResult(null); }}
            placeholder="e.g. 100% Cotton or 80% Polyester 20% Elastane"
            className="w-full bg-white/5 border border-white/10 pl-10 pr-5 py-4 text-sm outline-none focus:border-white/30 transition-all placeholder:text-white/20"
          />
        </div>
        <button type="submit" className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all">
          Decode
        </button>
      </form>

      {/* Quick picks */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(FABRICS).map((f) => (
          <button
            key={f}
            onClick={() => { setQuery(f); setResult(f); }}
            className="text-[9px] border border-white/10 px-3 py-2 uppercase tracking-wider hover:border-white/30 hover:text-white text-white/40 transition-all"
          >
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {result === '__NOT_FOUND__' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-enark-red uppercase tracking-widest">
            Composition not in database. Try a common variant like &quot;100% Cotton&quot; or &quot;100% Nylon&quot;.
          </motion.p>
        )}
        {fabric && result && (
          <motion.div key={result} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-white/10 bg-white/2 p-8 space-y-8">
            <div>
              <p className="text-[10px] text-enark-red font-black uppercase tracking-widest mb-1">Fabric Analysis</p>
              <h3 className="text-2xl font-black uppercase tracking-tighter">{result}</h3>
              <p className="text-xs text-white/50 mt-3 leading-relaxed max-w-xl">{fabric.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                {[
                  { label: 'Breathability', val: fabric.breathability },
                  { label: 'Durability', val: fabric.durability },
                  { label: 'Sustainability', val: fabric.sustainability },
                  { label: 'Care Ease', val: fabric.careEase },
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">{m.label}</p>
                    <Bar value={m.val} />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-3">Best For</p>
                  <ul className="space-y-2">
                    {fabric.bestFor.map((b) => (
                      <li key={b} className="text-xs flex items-start gap-2">
                        <span className="text-enark-red mt-0.5">▸</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-3">Avoid</p>
                  <ul className="space-y-2">
                    {fabric.avoid.map((a) => (
                      <li key={a} className="text-xs text-white/50 flex items-start gap-2">
                        <span className="text-white/20 mt-0.5">✕</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
