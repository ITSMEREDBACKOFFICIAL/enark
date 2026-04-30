'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, Fingerprint, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRAND_STATEMENTS = [
  "ENARK.COLLECTIVE",
  "SYSTEM.INTEGRITY.VERIFIED",
  "BEYOND.THE.GATES",
  "ARCHIVE.ACCESS.GRANTED",
  "UTILITY.DRIVEN.DESIGN"
];

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStatement, setCurrentStatement] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  const router = useRouter();

  // Carousel Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatement((prev) => (prev + 1) % BRAND_STATEMENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Initializing Animation
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess(true);
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          setLoading(false);
        } else {
          console.log('Customer authentication successful. Redirecting to /account');
          window.location.assign('/account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center"
        >
          <div className="w-24 h-24 border border-enark-red/30 flex items-center justify-center mb-8 relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-t-enark-red"
            />
            <Zap className="text-enark-red animate-pulse" size={32} />
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            className="h-1 bg-enark-red/20 overflow-hidden"
          >
            <motion.div 
              animate={{ x: [-120, 120] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full bg-enark-red"
            />
          </motion.div>
          <p className="mt-4 text-[11px] font-black mono text-enark-red tracking-[0.5em] uppercase">Booting_Enark_OS</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 md:p-12 overflow-hidden selection:bg-enark-red selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-enark-red/10 via-transparent to-transparent"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "circOut" }}
        className="relative w-full max-w-[420px]"
      >
        {/* Virtual Device Frame */}
        <div className="relative bg-black/40 backdrop-blur-3xl border border-white/10 p-8 md:p-12 shadow-[0_0_100px_-20px_rgba(255,0,0,0.15)] overflow-hidden">
          
          {/* Biometric Scan Line Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ top: -10, opacity: 0 }}
                animate={{ top: '100%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-enark-red shadow-[0_0_20px_2px_rgba(255,0,0,0.5)] z-50 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Text Story Carousel */}
          <div className="mb-16 relative h-8 overflow-hidden flex items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStatement}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="text-xs font-black uppercase tracking-[0.4em] text-white/60 w-full text-center"
              >
                {BRAND_STATEMENTS[currentStatement]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mb-12">
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-enark-red to-transparent mb-8"
            />
            <h1 className="text-4xl font-black tracking-tighter-x uppercase text-center mb-2">
              {isSignUp ? 'New_Identity' : 'Uplink'}
            </h1>
            <div className="flex items-center justify-center gap-2 opacity-30">
              <div className="w-1 h-1 bg-enark-red rounded-full" />
              <p className="text-[11px] font-bold uppercase tracking-widest">Protocol: 0X442-A</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 text-center py-8"
              >
                <div className="w-20 h-20 border border-enark-red mx-auto flex items-center justify-center relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-enark-red"
                  />
                  <CheckCircle2 className="text-enark-red" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase mb-3">Beacon Sent</h3>
                  <p className="text-xs text-white/60 uppercase tracking-widest leading-relaxed px-4">
                    Verify your connection via the link sent to your inbox to complete the uplink.
                  </p>
                </div>
                <button 
                  onClick={() => { setSuccess(false); setIsSignUp(false); }}
                  className="w-full bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all duration-300"
                >
                  Return to Base
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit} 
                className="space-y-10"
              >
                <div className="space-y-8">
                  <div className="group relative">
                    <label className="text-xs font-black text-white/50 uppercase tracking-[0.4em] mb-3 block group-focus-within:text-enark-red transition-colors">
                      Identity_V01
                    </label>
                    <div className="relative">
                      <input 
                        required
                        name="email"
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER_EMAIL_ADDRESS"
                        className="w-full bg-transparent border-b border-white/5 pb-4 text-[11px] font-bold outline-none focus:border-enark-red transition-all placeholder:text-white/5 tracking-[0.1em] text-white"
                      />
                      <Mail className="absolute right-0 top-0 text-white/5 group-focus-within:text-enark-red transition-colors" size={12} />
                    </div>
                  </div>

                  <div className="group relative">
                    <label className="text-xs font-black text-white/50 uppercase tracking-[0.4em] mb-3 block group-focus-within:text-enark-red transition-colors">
                      Cipher_Key
                    </label>
                    <div className="relative">
                      <input 
                        required
                        name="password"
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-transparent border-b border-white/5 pb-4 text-[11px] font-bold outline-none focus:border-enark-red transition-all placeholder:text-white/5 tracking-[0.2em] text-white"
                      />
                      <Lock className="absolute right-0 top-0 text-white/5 group-focus-within:text-enark-red transition-colors" size={12} />
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 border-l-2 border-enark-red bg-enark-red/5">
                      <p className="text-[11px] font-black uppercase text-enark-red tracking-widest leading-relaxed">
                        Critical_Error: {error.toUpperCase()}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 space-y-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-white hover:bg-enark-red py-6 font-black uppercase tracking-[0.4em] transition-all duration-500"
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black transition-transform duration-500 group-hover:translate-y-full">
                      <span className="text-white text-[11px]">INITIALIZE_UPLINK</span>
                    </div>
                    <div className="flex items-center justify-center text-white text-[11px] bg-enark-red h-full">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                      <motion.div 
                        animate={{ y: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-[1px] bg-white opacity-50 shadow-[0_0_10px_white]"
                      />
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="w-full text-center text-xs font-black text-white/60 hover:text-white uppercase tracking-[0.4em] transition-all"
                  >
                    {isSignUp ? 'Existent_Identity?_Login' : 'Create_New_Identity'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer Security Badge */}
          <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Fingerprint size={16} className="text-white/50 group-hover:text-enark-red transition-colors" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 leading-none">Security_Protocol</p>
                <p className="text-xs font-black uppercase tracking-tighter text-white/60 leading-none text-enark-red">Active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest text-white/50">Version</p>
              <p className="text-xs font-black uppercase tracking-widest text-white/60">EN.OS.V4</p>
            </div>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-enark-red/30 pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-enark-red/30 pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-enark-red/30 pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-enark-red/30 pointer-events-none" />
      </motion.div>

      {/* Side HUD Elements */}
      <div className="fixed left-8 bottom-8 hidden lg:block opacity-20">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-1 h-1 bg-white" />
              <div className="w-12 h-1 bg-white/10" />
            </div>
          ))}
          <p className="text-xs font-black mono uppercase tracking-widest">Global_Sync: OK</p>
        </div>
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
        <div className="writing-vertical text-xs font-black mono uppercase tracking-[1em] rotate-180">
          ENARK_ECOSYSTEM_PROTOCOL
        </div>
      </div>
    </div>
  );
}
