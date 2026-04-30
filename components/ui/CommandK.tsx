'use client';

import { useState, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandK() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-3xl bg-black border-1 border-white/20 overflow-hidden"
          >
            <div className="flex items-center p-8 border-b-1 border-white/10">
              <Search className="text-enark-red mr-6" size={24} />
              <input 
                autoFocus
                type="text"
                placeholder="EXECUTE SEARCH..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-3xl font-black placeholder:text-white/50 uppercase tracking-tighter"
              />
              <div className="flex items-center gap-4">
                <span className="mono text-xs text-white/60 border-1 border-white/10 px-2 py-1">ESC</span>
                <button onClick={() => setIsOpen(false)} className="hover:text-enark-red">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[50vh] overflow-y-auto">
              {query.toLowerCase() === 'command' || query.toLowerCase() === 'admin' ? (
                <div className="border-1 border-enark-red p-12 text-center bg-enark-red/5">
                  <p className="mono text-xs text-enark-red font-black mb-4">ACCESS LEVEL: OVERRIDE</p>
                  <h3 className="text-5xl font-black mb-8">COMMAND CENTER</h3>
                  <a href="/command" className="alien-button inline-block text-sm">INITIALIZE UPLINK</a>
                </div>
              ) : query === '' ? (
                <div className="grid grid-cols-2 gap-4">
                  {['NEW DROPS', 'SYSTEM LOGS', 'ARCHIVE', 'TRACK ORDER'].map((item) => (
                    <button key={item} className="p-6 border-1 border-white/5 text-left hover:border-enark-red transition-all group">
                      <p className="mono text-[11px] text-white/60 mb-2">QUERY // 0{item.length}</p>
                      <span className="text-xl font-black group-hover:text-enark-red">{item}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mono text-xs text-white/60 italic">SCANNING ARCHIVE FOR: "{query}"...</p>
              )}
            </div>

            <div className="bg-white/5 p-4 flex justify-between items-center px-8">
              <div className="flex items-center gap-4">
                <Command size={14} className="text-white/60" />
                <p className="mono text-[11px] text-white/60 uppercase tracking-[0.2em]">Alienkind OS v1.0.5</p>
              </div>
              <p className="mono text-[11px] text-white/60">STATUS: SYSTEM_READY</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
