'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DinoGame from '@/components/ui/DinoGame';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-enark-red mono flex flex-col pt-32">
      <Header />

      {/* Background Noise Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="flex-1 container max-w-6xl mx-auto px-6 flex flex-col justify-center items-center relative z-10 pb-20">
        
        {/* Error Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 text-enark-red mb-8"
          >
            <AlertTriangle size={24} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">STATUS_CODE // 404</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter-x uppercase italic leading-[0.8] mb-6"
          >
            NODE_NOT_<br/>FOUND
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed"
          >
            The requested resource has been purged from the neural mesh or never existed in this dimension.
          </motion.p>
        </div>

        {/* Interactive Element: Dino Game */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-6 mb-2">
            <div className="h-[1px] w-12 bg-white/10" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">RECOVERY_PROTOCOL_MINIGAME</span>
            <div className="h-[1px] w-12 bg-white/10" />
          </div>
          
          <DinoGame />
          
          <div className="mt-4 flex flex-col items-center gap-2">
             <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Controls: [SPACE] to jump / [TAP] to interact</p>
          </div>
        </motion.div>

        {/* Action Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-col md:flex-row gap-6"
        >
          <Link 
            href="/"
            className="group flex items-center gap-4 px-8 py-4 border border-white/10 hover:border-enark-red transition-all"
          >
            <ArrowLeft size={16} className="text-white group-hover:text-enark-red transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return_to_Mainframe</span>
          </Link>
          
          <button 
            onClick={() => window.location.reload()}
            className="group flex items-center gap-4 px-8 py-4 border border-white/10 hover:border-white transition-all"
          >
            <RefreshCw size={16} className="text-white/40 group-hover:text-white transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">Re-Sync_Uplink</span>
          </button>
        </motion.div>
      </div>

      {/* Decorative Side Text */}
      <div className="fixed bottom-12 left-12 opacity-10 hidden lg:block">
        <p className="vertical-text text-[10px] font-black uppercase tracking-[0.6em]">SYSTEM_ERROR_MANIFEST</p>
      </div>
      <div className="fixed top-1/2 -right-6 -translate-y-1/2 opacity-5 hidden lg:block">
        <p className="vertical-text text-[80px] font-black uppercase tracking-tighter text-white">404</p>
      </div>

      <Footer />
    </main>
  );
}
