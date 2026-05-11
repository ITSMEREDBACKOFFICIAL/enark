'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewsletterUplink() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const hasSeen = localStorage.getItem('alienkind-uplink-seen');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 12000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('newsletter_subs').insert([{ email }]);
      if (error) throw error;
      setStatus('success');
      localStorage.setItem('alienkind-uplink-seen', 'true');
      setTimeout(() => setIsOpen(false), 2500);
    } catch {
      setStatus('error');
    }
  };

  const closeUplink = () => {
    setIsOpen(false);
    localStorage.setItem('alienkind-uplink-seen', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeUplink}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0%)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 50% 0 50%)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-black border border-white/5 p-10 corner-top-left corner-bottom-right shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Background Texture/Effect */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.02] to-transparent" />
            
            <button
              onClick={closeUplink}
              className="absolute top-5 right-5 text-white/20 hover:text-white transition-colors z-20"
            >
              <X size={18} />
            </button>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 relative z-10"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-12 h-12 rounded-full border border-enark-red flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-enark-red rounded-full" />
                  </div>
                </div>
                <p className="text-sm font-black uppercase tracking-[0.5em] text-enark-red mono animate-pulse">Access Granted</p>
                <div className="h-[1px] w-12 bg-enark-red/30 mx-auto my-6" />
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] leading-relaxed mono">
                  Encryption complete. <br /> Uplink established with server.
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <div className="h-[1px] flex-1 bg-enark-red/30" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-enark-red mono whitespace-nowrap">
                    Early Access Protocol
                  </p>
                  <div className="h-[1px] flex-1 bg-enark-red/30" />
                </motion.div>

                <div className="relative mb-6">
                  <h2 className="text-4xl font-black uppercase tracking-tighter-x leading-[0.9] text-white relative z-10">
                    Get First <br /> Access.
                  </h2>
                  <div className="absolute -top-1 -left-1 text-enark-red/20 text-4xl font-black uppercase tracking-tighter-x leading-[0.9] pointer-events-none select-none blur-[2px]">
                    Get First <br /> Access.
                  </div>
                </div>
                
                <p className="text-[11px] text-white/40 uppercase tracking-[0.2em] leading-relaxed mb-10 mono max-w-[280px]">
                  Drop alerts and exclusive releases — before anyone else.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div className="relative group">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER EMAIL ADDRESS"
                      className="w-full bg-white/[0.02] border border-white/10 px-5 py-5 text-xs outline-none focus:border-enark-red/50 transition-all placeholder:text-white/20 mono text-white"
                    />
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                      <div className="w-1 h-1 bg-enark-red" />
                    </div>
                    <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-enark-red group-focus-within:w-full transition-all duration-500" />
                  </div>

                  <button
                    disabled={status === 'loading'}
                    className="w-full bg-white text-black py-5 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-enark-red hover:text-white transition-all duration-500 relative group overflow-hidden"
                  >
                    <span className="relative z-10">
                      {status === 'loading' ? 'TRANSMITTING...' : 'INITIALIZE UPLINK'}
                    </span>
                    <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </button>
                  
                  {status === 'error' && (
                    <p className="text-[9px] text-enark-red uppercase tracking-widest text-center mono mt-2 animate-pulse">
                      Transmission failed. Retrying...
                    </p>
                  )}
                </form>

                <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-white mono tracking-[0.2em]">REF: ENARK_OS_V2.0</span>
                    <span className="text-[7px] text-white/50 mono tracking-[0.1em]">ENCRYPTION: AES-256</span>
                  </div>
                  <button
                    onClick={closeUplink}
                    className="text-[9px] text-white/50 hover:text-white uppercase tracking-widest transition-colors mono border-b border-transparent hover:border-white/20 pb-0.5"
                  >
                    Decline Access
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
