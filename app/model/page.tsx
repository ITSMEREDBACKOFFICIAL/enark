'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Loader2, ArrowRight, User, Mail, Sparkle } from 'lucide-react';

export default function ModelForUsPage() {
  const [step, setStep] = useState<'idle' | 'form' | 'submitting' | 'success'>('idle');
  const [playRequested, setPlayRequested] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    height: '',
    waist: '',
    chest: '',
    portfolio: ''
  });

  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted || !document.getElementById('youtube-player')) return;
      
      try {
        playerRef.current = new (window as any).YT.Player('youtube-player', {
          height: '0',
          width: '0',
          videoId: 'X_0t46Z0VbE', // Kiasmos - Looped
          playerVars: {
            autoplay: 0,
            loop: 1,
            playlist: 'X_0t46Z0VbE',
            controls: 0,
            showinfo: 0,
            modestbranding: 1
          },
          events: {
            onReady: () => {
              if (isMounted) {
                setIsPlayerReady(true);
              }
            }
          }
        });
      } catch (e) {
        console.error("YT Player init error", e);
      }
    };

    const loadYT = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        initPlayer();
        return;
      }

      if (!document.getElementById('youtube-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api-script';
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      const interval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(interval);
          initPlayer();
        }
      }, 100);
    };

    loadYT();

    return () => {
      isMounted = false;
      try {
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlayerReady && playRequested && playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
        playerRef.current.setVolume(40);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isPlayerReady, playRequested]);

  const handleJoinClick = () => {
    setStep('form');
    setPlayRequested(true);
  };

  const toggleMute = () => {
    if (!playerRef.current || typeof playerRef.current.mute !== 'function' || typeof playerRef.current.unMute !== 'function') return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');

    try {
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setStep('success');
        try {
          if (playerRef.current) playerRef.current.stopVideo();
        } catch (e) {}
        
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        alert('SUBMISSION_FAILED: Please verify your credentials.');
        setStep('form');
      }
    } catch (err) {
      console.error(err);
      setStep('form');
    }
  };

  return (
    <main className="h-screen w-full bg-[#050505] text-white overflow-hidden relative flex items-center justify-center mono select-none">
      
      {/* Hidden YouTube Player Hook */}
      <div id="youtube-player" className="absolute opacity-0 pointer-events-none" />

      {/* Audio Controls */}
      {step !== 'idle' && (
        <button 
          onClick={toggleMute}
          className="absolute top-8 right-8 z-50 border border-white/20 bg-white/5 hover:border-white px-4 py-2 text-[10px] uppercase font-black tracking-widest flex items-center gap-2 transition-all"
        >
          {isMuted ? 'UNMUTE_AUDIO' : 'MUTE_AUDIO'}
        </button>
      )}

      {/* Background Orbital Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border border-dashed border-white/10 rounded-full flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-enark-red rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
        </motion.div>
        
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border border-dashed border-white/5 rounded-full"
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* IDLE state - Massive 3D interactive button */}
        {step === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 flex flex-col items-center gap-12"
          >
            <div className="text-center space-y-4">
              <span className="text-[10px] text-enark-red font-black tracking-[0.4em] uppercase flex items-center justify-center gap-2">
                <Sparkles size={12} /> GLOBAL_MODEL_CASTING_CALL
              </span>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase select-none">
                ENARK <span className="text-white/20">//</span> ROSTER
              </h1>
            </div>

            <button 
              onClick={handleJoinClick}
              className="relative group w-64 h-64 md:w-80 md:h-80 rounded-full border border-white/20 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-enark-red shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_80px_rgba(220,38,38,0.2)]"
            >
              <div className="absolute inset-0 bg-enark-red/10 scale-0 group-hover:scale-100 transition-transform duration-700 rounded-full ease-out" />
              <div className="z-10 text-center space-y-2">
                <span className="text-2xl md:text-3xl font-black tracking-widest block uppercase transition-colors group-hover:text-white">JOIN US</span>
                <span className="text-[10px] text-white/40 block uppercase tracking-wider group-hover:text-white/60">INITIATE_UPLINK</span>
              </div>
            </button>
          </motion.div>
        )}

        {/* FORM state - Multi-step interactive parameters */}
        {step === 'form' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 w-full max-w-xl px-6"
          >
            <form onSubmit={handleSubmit} className="space-y-8 bg-black/80 border border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
              
              <div className="border-b border-white/10 pb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                    <User size={18} className="text-enark-red" /> BIO_IDENTITY
                  </h2>
                  <p className="text-[10px] text-white/40 uppercase mt-1">Fill the metrics exactly.</p>
                </div>
                <span className="text-[9px] text-white/40 border border-white/20 px-3 py-1 font-mono uppercase">SOUND_ACTIVE</span>
              </div>

              {/* Grid Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">FULL_NAME</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">EMAIL_ADDRESS</label>
                    <input 
                      required 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@enark.io"
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">HEIGHT (CM)</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="175"
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">WAIST (IN)</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.waist}
                      onChange={(e) => setFormData({...formData, waist: e.target.value})}
                      placeholder="28"
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">CHEST (IN)</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.chest}
                      onChange={(e) => setFormData({...formData, chest: e.target.value})}
                      placeholder="36"
                      className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">PORTFOLIO_LINK (OPTIONAL)</label>
                  <input 
                    type="url" 
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
              >
                SUBMIT_APPLICATION <ArrowRight size={14} />
              </button>
            </form>
          </motion.div>
        )}

        {/* SUBMITTING state */}
        {step === 'submitting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center gap-4"
          >
            <Loader2 className="animate-spin text-enark-red w-12 h-12" />
            <p className="text-xs font-black uppercase tracking-widest animate-pulse">RECORDING_BIOMETRICS...</p>
          </motion.div>
        )}

        {/* SUCCESS state */}
        {step === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 flex flex-col items-center gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full border-1 border-green-500 bg-green-500/10 flex items-center justify-center text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce">
              <Shield size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-widest">TRANSMISSION_COMPLETE</h3>
              <p className="text-[11px] text-white/40 uppercase">Returning to operative baseline...</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </main>
  );
}
