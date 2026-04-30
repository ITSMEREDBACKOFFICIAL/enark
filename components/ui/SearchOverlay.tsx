'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Reset on close
  useEffect(() => { if (!isOpen) { setQuery(''); setResults([]); } }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, variants(*)')
        .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(6);
      if (data) setResults(data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/97 backdrop-blur-xl flex flex-col p-6 md:p-12 mono"
        >
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
              <p className="text-xs text-enark-red font-black tracking-widest uppercase">Search</p>
              <div className="flex items-center gap-4">
                <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-widest">esc to close</span>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="relative group mb-10">
              <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-b border-white/10 pb-4 pl-10 text-3xl md:text-5xl font-black outline-none focus:border-white/30 transition-all tracking-tight"
              />
            </div>

            {/* Quick categories — show when idle */}
            {query.length < 2 && !loading && (
              <div className="mb-8">
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Browse by category</p>
                <div className="flex flex-wrap gap-3">
                  {['Outerwear', 'Tops', 'Bottoms', 'Accessories'].map((cat) => (
                    <a
                      key={cat}
                      href={`/shop?category=${cat.toUpperCase()}`}
                      onClick={onClose}
                      className="px-5 py-2 border border-white/10 text-xs font-black uppercase tracking-widest text-white/40 hover:border-white/40 hover:text-white transition-all"
                    >
                      {cat}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {loading && <p className="text-xs text-white/30 animate-pulse uppercase tracking-widest">Searching...</p>}

              {results.map((product, i) => (
                <motion.a
                  key={product.id}
                  href={`/shop?product_id=${product.id}`}
                  onClick={onClose}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-5 border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 overflow-hidden shrink-0">
                      <img src={product.metadata?.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black group-hover:text-enark-red transition-colors">{product.name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{product.category} · ₹{product.base_price.toLocaleString()}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-enark-red -translate-x-2 group-hover:translate-x-0 transition-all" />
                </motion.a>
              ))}

              {query.length >= 2 && results.length === 0 && !loading && (
                <div className="text-center py-16 space-y-3">
                  <p className="text-sm text-white/20 font-black uppercase tracking-widest">No results for &ldquo;{query}&rdquo;</p>
                  <a href="/shop" onClick={onClose} className="text-xs text-enark-red font-black uppercase tracking-widest hover:underline">Browse all products →</a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
