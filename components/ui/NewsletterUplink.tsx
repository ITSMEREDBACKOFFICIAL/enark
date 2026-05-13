'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Zap, Radio, Terminal } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewsletterUplink() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const hasSeen = localStorage.getItem('enark-uplink-v2-seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 8000); // Trigger after 8s
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subs').insert([{ email }]);
      if (error) throw error;
      setStatus('success');
      localStorage.setItem('enark-uplink-v2-seen', 'true');
      setTimeout(() => setIsOpen(false), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const closeUplink = () => {
    setIsOpen(false);
    localStorage.setItem('enark-uplink-v2-seen', 'true');
  };

  const systemData = useMemo(() => [
    { label: 'UPLINK', value: 'ESTABLISHED' },
    { label: 'SIGNAL', value: '78.2 dBm' },
    { label: 'NODE', value: 'EN-ARK_09' },
  ], []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-[200] w-[340px] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9, skewX: -10 }}
            animate={{ opacity: 1, x: 0, scale: 1, skewX: 0 }}
            exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="pointer-events-auto relative bg-black/90 backdrop-blur-xl border border-white/10 p-1 overflow-hidden"
            style={{
              clipPath: 'polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%)'
            }}
          >
            {/* Industrial Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-enark-red/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-enark-red/50" />
            
            {/* Scanner Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-enark-red/20 z-10 pointer-events-none blur-[1px]"
            />

            {/* Content Container */}
            <div className="relative p-6 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
              
              {/* Header Bar */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Radio size={14} className="text-enark-red animate-pulse" />
                    <div className="absolute inset-0 bg-enark-red/40 blur-[4px] animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white leading-none tracking-widest">NEURAL_UPLINK</span>
                    <span className="text-[8px] text-white/40 mono tracking-tighter">OS_VERSION_2.4.0</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-enark-red mono font-bold">{currentTime}</span>
                  <button 
                    onClick={closeUplink}
                    className="mt-1 opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>

              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <Zap size={32} className="text-enark-red animate-bounce" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Access_Granted</h3>
                  <p className="text-[9px] text-white/40 mono uppercase">Encrypted packet received. <br />Welcome to the collective.</p>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2 italic">
                      Initialize <br /> Interface.
                    </h2>
                    <p className="text-[10px] text-white/50 mono leading-relaxed uppercase max-w-[200px]">
                      Register your neural signature for early drop access and secure data-feeds.
                    </p>
                  </div>

                  {/* System Loadout */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {systemData.map((item, i) => (
                      <div key={i} className="bg-white/5 p-2 border border-white/5">
                        <div className="text-[7px] text-white/30 mono uppercase">{item.label}</div>
                        <div className="text-[8px] text-white/80 mono font-bold truncate">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="SIGNATURE@EMAIL.COM"
                        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-[10px] text-white outline-none focus:border-enark-red/50 transition-all mono placeholder:text-white/20"
                      />
                      <Terminal size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" />
                    </div>

                    <button
                      disabled={status === 'loading'}
                      className="w-full py-4 bg-enark-red text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 relative group overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {status === 'loading' ? (
                          <>
                            <Cpu size={12} className="animate-spin" />
                            Transmitting...
                          </>
                        ) : (
                          'Establish_Link'
                        )}
                      </span>
                    </button>
                  </form>

                  {status === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-2 bg-enark-red/10 border border-enark-red/20 text-[8px] text-enark-red mono text-center uppercase tracking-widest"
                    >
                      Protocol Error: Link Failed
                    </motion.div>
                  )}

                  <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-[7px] text-white/20 mono">
                      SECURED BY EN-ARK_CORE
                    </div>
                    <button 
                      onClick={closeUplink}
                      className="text-[8px] text-white/40 hover:text-white mono uppercase tracking-widest transition-colors"
                    >
                      Abort
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
