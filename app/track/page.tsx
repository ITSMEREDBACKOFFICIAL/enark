'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Activity, Globe, Locate, Navigation, Shield, Zap, Compass, Satellite } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import Header from '@/components/layout/Header';

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('initializing'); // initializing, scanning, locating, redirecting, fallback
  const { playHum, playSuccess, playError, playClick } = useAudio();
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (!orderId) {
      router.push('/account');
      return;
    }

    const addTerminalLine = (line: string) => {
      setTerminalLines(prev => [...prev.slice(-10), `> ${line}`]);
    };

    async function initializeTracking() {
      addTerminalLine("INITIALIZING_SATELLITE_UPLINK...");
      playHum();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        setPhase('fallback');
        setLoading(false);
        playError();
        return;
      }

      setOrder(data);
      
      // Phase Timing
      setTimeout(() => {
        setPhase('scanning');
        addTerminalLine("SCANNING_INDIAN_SUBCONTINENT...");
      }, 1500);

      setTimeout(() => {
        setPhase('locating');
        addTerminalLine(`ASSET_FOUND: [${data.tracking_id || 'ID_PENDING'}]`);
      }, 4000);

      setTimeout(() => {
        if (data.tracking_id && data.carrier_name) {
          setPhase('redirecting');
          addTerminalLine(`HANDING_OVER_TO_${data.carrier_name}_PROTOCOLS...`);
          playSuccess();
        } else {
          setPhase('fallback');
          addTerminalLine("ERROR: NO_LOGISTICS_PARTNER_ASSIGNED_YET");
        }
        setLoading(false);
      }, 6500);
    }

    initializeTracking();
  }, [orderId, router]);

  // Handle Redirection after animation
  useEffect(() => {
    if (phase === 'redirecting' && order?.tracking_id && order?.carrier_name) {
      const timer = setTimeout(() => {
        let url = '';
        const carrier = order.carrier_name?.toUpperCase() || '';
        
        if (carrier.includes('DELHIVERY') && order.tracking_id) {
          url = `https://www.delhivery.com/track/package/${order.tracking_id}`;
        } else if (carrier.includes('BLUEDART') && order.tracking_id) {
          url = `https://www.bluedart.com/tracking?trackid=${order.tracking_id}`;
        } 

        if (url) {
          window.location.href = url;
        } else {
          // If no specific URL or tracking ID, redirect to the new "Order Info" page
          router.push(`/order/${order.id}?status=deployment_pending`);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, order]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-enark-red mono overflow-hidden flex flex-col items-center justify-center relative p-6">
      <Header />

      {/* Background Grid/Noise */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#ff000005,transparent)]" />
      </div>

      <div className="w-full max-w-4xl relative z-10">
        
        <AnimatePresence mode="wait">
          {/* INITIALIZING / SCANNING PHASE */}
          {(phase === 'initializing' || phase === 'scanning' || phase === 'locating') && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-12"
            >
              {/* India Map Geometric Representation */}
              <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
                 {/* Decorative Rings */}
                 <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
                 <div className="absolute inset-10 border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                 
                 {/* The "Map" - Using a stylized geometric SVG of India */}
                 <svg viewBox="0 0 400 450" className="w-full h-full opacity-40 fill-none stroke-enark-red/30 stroke-1">
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 5, ease: "easeInOut" }}
                      d="M178 435 L160 410 L130 380 L110 340 L100 300 L110 260 L140 220 L160 180 L180 140 L210 100 L240 70 L280 40 L310 20 L330 40 L340 80 L330 120 L310 160 L280 200 L260 240 L250 280 L260 320 L280 360 L300 400 L280 420 L240 430 L200 440 Z" // Stylized Triangle-ish India
                    />
                    {/* Scanning Line */}
                    {phase === 'scanning' && (
                      <motion.line 
                        initial={{ x1: 0, x2: 400, y1: 0, y2: 0 }}
                        animate={{ y1: 450, y2: 450 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="stroke-enark-red stroke-2"
                      />
                    )}
                 </svg>

                 {/* Pulse at a "Location" (e.g., Delhi or Bangalore) */}
                 {phase === 'locating' && (
                   <motion.div 
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                     className="absolute top-[40%] left-[55%] flex flex-col items-center"
                   >
                     <div className="w-4 h-4 bg-enark-red rounded-full animate-ping absolute" />
                     <div className="w-4 h-4 bg-enark-red rounded-full" />
                     <div className="mt-4 p-2 border border-enark-red bg-black/80 backdrop-blur-sm">
                        <p className="text-[8px] font-black tracking-widest text-enark-red">ASSET_PING_RECEIVED</p>
                        <p className="text-[6px] text-white/60">LAT: 28.6139 | LON: 77.2090</p>
                     </div>
                   </motion.div>
                 )}

                 {/* Satellite Icon */}
                 <div className="absolute top-0 right-0 p-4 opacity-40">
                    <Satellite size={32} className="animate-pulse" />
                 </div>
              </div>

              {/* Status Section */}
              <div className="w-full max-w-md space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-enark-red animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                          {phase.toUpperCase()}_PROTOCOL
                       </span>
                    </div>
                    <span className="text-[10px] mono text-white/40">UPLINK_STRENGTH: 98%</span>
                 </div>

                 {/* Terminal Emulator */}
                 <div className="bg-white/5 border border-white/10 p-6 font-mono text-[9px] space-y-1 h-40 overflow-hidden">
                    {terminalLines.map((line, i) => (
                      <motion.p 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={line.includes('ERROR') ? 'text-enark-red' : 'text-white/60'}
                      >
                        {line}
                      </motion.p>
                    ))}
                    <motion.span 
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-3 bg-white/40 ml-1"
                    />
                 </div>
              </div>
            </motion.div>
          )}

          {/* FALLBACK PHASE (No tracking assigned) */}
          {phase === 'fallback' && (
            <motion.div 
              key="fallback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="w-24 h-24 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
                 <Shield size={40} className="text-white/20" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black tracking-tighter-x uppercase italic">AWAITING_DEPLOYMENT</h2>
                 <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] max-w-xs leading-relaxed">
                   Your asset is secured in our vault. Logistics partner assignment is in progress.
                 </p>
              </div>
              <button 
                onClick={() => router.push('/account')}
                className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-8 py-4 hover:bg-white hover:text-black transition-all"
              >
                 Return_to_Manifest
              </button>
            </motion.div>
          )}

          {/* REDIRECTING PHASE */}
          {phase === 'redirecting' && (
            <motion.div 
              key="redirecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-8"
            >
              <div className="w-20 h-20 bg-green-500/10 border border-green-500 rounded-full flex items-center justify-center animate-pulse">
                 <Navigation size={32} className="text-green-500" />
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-3xl font-black tracking-tighter-x uppercase italic">UPLINK_ESTABLISHED</h2>
                 <p className="text-[10px] text-green-500/60 uppercase tracking-[0.3em]">
                   Switching to {order?.carrier_name}_NETWORK
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end opacity-20 pointer-events-none">
         <div className="text-[8px] font-black uppercase tracking-[0.5em] vertical-text">ENARK_LOGISTICS_PROTOCOLS</div>
         <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-widest">SATELLITE_UPLINK_v4.0.2</p>
            <p className="text-[6px] mono opacity-50">NODE_ID: {orderId?.slice(0, 8)}</p>
         </div>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Activity size={32} className="text-enark-red animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red animate-pulse">BOOTING_TRACKING_OS...</p>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
