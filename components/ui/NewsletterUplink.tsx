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
      const timer = setTimeout(() => setIsOpen(true), 5000);
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-10"
          >
            <button
              onClick={closeUplink}
              className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <p className="text-sm font-black uppercase tracking-widest text-green-400">You&apos;re in.</p>
                <p className="text-xs text-white/40 mt-2 uppercase tracking-widest">We&apos;ll be in touch.</p>
              </motion.div>
            ) : (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red mb-4">Early Access</p>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-3">
                  Get First Access.
                </h2>
                <p className="text-xs text-white/50 uppercase tracking-widest leading-relaxed mb-8">
                  Drop alerts and exclusive releases — before anyone else.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 text-sm outline-none focus:border-white/30 transition-all placeholder:text-white/30"
                  />
                  <button
                    disabled={status === 'loading'}
                    className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-[0.25em] hover:bg-enark-red hover:text-white transition-all"
                  >
                    {status === 'loading' ? 'Submitting...' : 'Join the List'}
                  </button>
                  {status === 'error' && (
                    <p className="text-[10px] text-enark-red uppercase tracking-widest text-center">
                      Something went wrong. Try again.
                    </p>
                  )}
                </form>

                <button
                  onClick={closeUplink}
                  className="mt-6 w-full text-center text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest transition-colors"
                >
                  No thanks
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
