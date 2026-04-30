'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-12 selection:bg-enark-red selection:text-white">
       <div className="absolute top-0 left-0 w-full p-6 border-b border-white/10 flex justify-between items-center">
         <h1 className="text-xl font-black tracking-tighter-x uppercase">ENARK<span className="text-enark-red">.</span></h1>
         <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">PROTOCOL_SECURED</span>
         </div>
       </div>

       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="max-w-2xl w-full border border-white/20 p-12 md:p-24 text-center space-y-12 relative overflow-hidden"
       >
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,0,0.05),transparent)] pointer-events-none" />
         
         <div className="space-y-6 relative z-10">
            <Database size={64} className="mx-auto text-green-500 mb-8" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter-x uppercase leading-none">TRANSMISSION<br/><span className="text-green-500">SUCCESSFUL</span></h1>
            <p className="text-xs text-white/60 uppercase tracking-[0.3em] leading-relaxed max-w-md mx-auto">
              YOUR LOGISTICS TETHER HAS BEEN SECURED. ASSETS ARE CURRENTLY BEING PREPARED FOR UPLINK AT CORE_01.
            </p>
         </div>

         <div className="border border-white/10 bg-white/5 p-6 relative z-10">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">ENARK_RECEIPT_ID</p>
            <p className="text-xl font-black text-enark-red mono">{orderId || 'PENDING_VERIFICATION'}</p>
         </div>

         <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center relative z-10">
            <a href="/registry" className="px-8 py-4 border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-center">
              RETURN_TO_REGISTRY
            </a>
            <a href="/shop" className="px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-2">
              CONTINUE_EXPLORING <ArrowRight size={14} />
            </a>
         </div>
       </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-enark-red animate-pulse font-mono text-sm uppercase tracking-widest">
        VERIFYING_UPLINK...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
