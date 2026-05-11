'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function ExchangePage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      // Simulate API call
      setStatus('success');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red transition-colors duration-500">
      <Header />

      
      <div className="pt-[140px] px-6 md:px-12 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="mb-8">
            <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">EXCHANGE_PROTOCOL // INITIALIZED</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter-x uppercase mt-2">RETURNS PORTAL</h1>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-green-500/30 bg-green-500/10 p-8 flex flex-col items-center justify-center text-center"
            >
              <ShieldAlert className="text-green-500 mb-4" size={32} />
              <h2 className="text-xl font-black tracking-widest uppercase mb-2">REQUEST LOGGED</h2>
              <p className="text-xs text-foreground/50 uppercase tracking-[0.2em] leading-loose">
                Your exchange request for {orderId} has been logged.<br/>
                We will dispatch a courier within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">ORDER_ID</label>
                <input 
                  type="text" 
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="ENK-XXXXX"
                  className="w-full bg-background border border-foreground/20 p-4 text-sm focus:border-enark-red outline-none transition-colors uppercase placeholder:text-foreground/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">ACCOUNT_EMAIL</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@system.com"
                  className="w-full bg-background border border-foreground/20 p-4 text-sm focus:border-enark-red outline-none transition-colors placeholder:text-foreground/20"
                />
              </div>

              <div className="bg-foreground/5 p-4 border-l-2 border-enark-red">
                <p className="text-[10px] uppercase tracking-widest text-foreground/60 leading-relaxed">
                  Items must be returned in their original packaging with all security tags intact. Removal of the red authentication tie voids the exchange protocol.
                </p>
              </div>

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-foreground text-background font-black uppercase tracking-[0.3em] py-4 hover:bg-enark-red hover:text-white transition-colors"
              >
                {status === 'loading' ? 'AUTHENTICATING...' : 'INITIATE EXCHANGE'}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
