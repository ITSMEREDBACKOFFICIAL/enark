'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';

export default function MaintenanceMode() {
  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-6 mono overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
      
      <div className="relative flex flex-col items-center text-center space-y-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-24 h-24 border-2 border-enark-red flex items-center justify-center text-enark-red shadow-[0_0_50px_rgba(220,38,38,0.3)]"
        >
          <Lock size={40} className="animate-pulse" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black tracking-tighter-x uppercase"
          >
            System<span className="text-enark-red">_</span>Locked
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3 text-xs font-black tracking-[0.5em] text-white/40 uppercase"
          >
            <ShieldAlert size={14} className="text-enark-red" />
            Maintenance_Protocol_Active
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm space-y-6"
        >
          <p className="text-sm leading-relaxed text-white/80">
            The ENARK neural core is currently undergoing a scheduled update sequence. 
            All public uplinks have been temporarily suspended to ensure data integrity during the transition.
          </p>
          
          <div className="flex flex-col gap-3">
             <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                <span>Status:</span>
                <span className="text-enark-red font-bold">RECONFIGURING_NODES</span>
             </div>
             <div className="w-full h-1 bg-white/10 overflow-hidden">
                <motion.div 
                   animate={{ x: ['-100%', '100%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="w-1/2 h-full bg-enark-red"
                />
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Uplink_Retrying_In_Background</p>
          <div className="flex gap-4">
            <Terminal size={16} className="text-white/20" />
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="w-1 h-1 bg-enark-red rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}
