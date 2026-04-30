'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal as TerminalIcon, AlertTriangle, Cpu, Database, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MaintenancePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const messages = [
      'INITIALIZING_LOCKDOWN_PROTOCOL...',
      'ENCRYPTING_CORE_DATABASES...',
      'NODE_TOKYO: OFFLINE',
      'NODE_NYC: OFFLINE',
      'ROTATING_SECURE_KEYS...',
      'BLOCKING_EXTERNAL_UPLINKS...',
      'NEURAL_CORE_RECALIBRATING...',
      'HARDENING_FIREWALL_LAYERS...',
      'SENSING_INTRUSION_ATTEMPTS... BLOCKED',
      'DIVERSION_PROTOCOLS_ACTIVE'
    ];

    const interval = setInterval(() => {
      setLogs(prev => [...prev.slice(-8), messages[Math.floor(Math.random() * messages.length)]]);
      if (Math.random() > 0.8) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-12 mono selection:bg-enark-red overflow-hidden relative ${glitch ? 'opacity-50' : 'opacity-100'}`}>
      
      {/* Background Noise & Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Pulsating Perimeter */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-8 border border-enark-red/20 pointer-events-none" 
      />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Main Alert Section */}
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-enark-red">
              <ShieldAlert size={32} className="animate-pulse" />
              <div className="h-[1px] flex-1 bg-enark-red/20" />
              <span className="text-xs font-black tracking-[0.5em] uppercase">SYSTEM_STATE: CRITICAL</span>
            </div>

            <motion.h1 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-7xl md:text-9xl font-black tracking-tighter-x leading-none uppercase italic"
            >
              LOCK<br/>DOWN<span className="text-enark-red animate-pulse">_</span>
            </motion.h1>

            <p className="text-white/40 text-sm leading-relaxed uppercase tracking-widest max-w-lg">
              ENARK_OS HAS ENTERED A SECURE RECALIBRATION CYCLE. ALL PUBLIC ASSETS ARE TEMPORARILY TETHERED. 
              CORE SERVERS ARE OPERATING IN THE SHADOWS. UNAUTHORIZED UPLINK ATTEMPTS ARE BEING LOGGED.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="p-6 border border-white/5 bg-white/2 space-y-2">
               <Cpu size={20} className="text-enark-red" />
               <p className="text-[10px] text-white/40 uppercase tracking-widest">PROCESSOR</p>
               <p className="text-xs font-black uppercase tracking-tighter">RECONFIGURING</p>
            </div>
            <div className="p-6 border border-white/5 bg-white/2 space-y-2">
               <Database size={20} className="text-enark-red" />
               <p className="text-[10px] text-white/40 uppercase tracking-widest">VAULT_STATUS</p>
               <p className="text-xs font-black uppercase tracking-tighter">ENCRYPTED</p>
            </div>
            <div className="p-6 border border-white/5 bg-white/2 space-y-2">
               <WifiOff size={20} className="text-enark-red" />
               <p className="text-[10px] text-white/40 uppercase tracking-widest">NETWORK</p>
               <p className="text-xs font-black uppercase tracking-tighter">ISOLATED</p>
            </div>
          </div>
        </div>

        {/* Live System Logs Section */}
        <div className="lg:col-span-5 flex flex-col h-full border border-white/10 bg-black/80 backdrop-blur-md relative">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-enark-red/5">
            <div className="flex items-center gap-3">
              <TerminalIcon size={14} className="text-enark-red" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live_System_Logs</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-enark-red animate-ping" />
              <div className="w-1 h-1 rounded-full bg-enark-red/40" />
            </div>
          </div>
          
          <div className="flex-1 p-8 space-y-4 font-mono text-[11px] overflow-hidden min-h-[300px]">
            <AnimatePresence mode="popLayout">
              {logs.map((log, i) => (
                <motion.div
                  key={log + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4"
                >
                  <span className="text-enark-red font-bold">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="text-white/60 uppercase tracking-wider">{log}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="animate-pulse text-enark-red">_</div>
          </div>

          <div className="p-8 border-t border-white/10 space-y-4">
             <div className="flex items-center gap-2 text-enark-red">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Security_Breach_Warning</span>
             </div>
             <p className="text-[9px] text-white/40 uppercase leading-relaxed italic">
               ATTEMPTS TO BYPASS LOCKDOWN WILL RESULT IN PERMANENT OPERATIVE BAN AND ASSET FORFEITURE.
             </p>
          </div>
        </div>

      </div>

      {/* Decorative HUD Elements */}
      <div className="absolute top-0 right-0 p-12 hidden lg:block opacity-20">
         <div className="text-[100px] font-black tracking-tighter text-white/5 rotate-90 translate-x-1/2">
           ENARK_OS
         </div>
      </div>

      <div className="absolute bottom-12 left-12 flex gap-12 items-end">
         <div className="space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Uplink_Node</p>
            <p className="text-xs font-black uppercase">GLOBAL_MAIN_01</p>
         </div>
         <div className="w-px h-12 bg-white/10" />
         <div className="space-y-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Protocol</p>
            <p className="text-xs font-black uppercase">V4_SECURE_LOCK</p>
         </div>
      </div>

      {/* Big Center Logo (Watermark) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
         <ShieldAlert size={800} />
      </div>

    </div>
  );
}
