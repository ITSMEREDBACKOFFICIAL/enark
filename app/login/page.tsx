'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, Activity, ChevronRight, Info } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { playClick, playGlitch, playSuccess, playError } = useAudio();

  // Asset Registry Fields (Optional)
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [showRegistry, setShowRegistry] = useState(false);

  useEffect(() => {
    // Play a subtle glitch sound when switching modes
    playGlitch();
  }, [isSignUp, playGlitch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    playClick();

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              chest: chest || null,
              waist: waist || null,
              hips: hips || null,
              height: height || null,
            }
          }
        });

        if (signUpError) {
          setError(signUpError.message);
          playError();
        } else {
          setSuccess(true);
          playSuccess();
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError(loginError.message);
          setLoading(false);
          playError();
        } else {
          playSuccess();
          router.push('/account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
      playError();
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red flex flex-col lg:flex-row overflow-hidden relative">
      {/* Global Scantron Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* LEFT: The Monolith */}
      <div className="w-full lg:w-[45%] min-h-[40vh] lg:min-h-screen bg-background flex flex-col justify-end p-6 md:p-12 lg:p-20 relative border-b lg:border-b-0 lg:border-r border-foreground/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,0,0,0.05),_transparent_50%)] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 bg-enark-red animate-pulse" />
             <p className="text-enark-red text-[10px] font-black uppercase tracking-[0.5em]">ENARK // SYSTEM_UPLINK</p>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter-x uppercase leading-[0.85] mb-8 text-foreground italic">
            {isSignUp ? 'JOIN' : 'AUTH'}<span className="text-enark-red">_</span>
          </h1>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-foreground/40 max-w-sm leading-loose">
            INITIALIZE YOUR IDENTITY TO ACCESS THE ARCHIVE AND SECURE YOUR OPERATIVE PROTOCOLS.
          </p>
        </motion.div>
      </div>

      {/* RIGHT: The Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-12 lg:p-20 bg-background relative">
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="border border-green-500/20 bg-green-500/5 p-12 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                <CheckCircle2 className="text-green-600 mx-auto mb-6" size={48} />
                <h2 className="text-2xl font-black uppercase tracking-widest mb-4">UPLINK_ESTABLISHED</h2>
                <p className="text-xs text-foreground/60 uppercase tracking-[0.2em] leading-loose mb-8">
                  A SECURE VERIFICATION MODULE HAS BEEN DISPATCHED TO YOUR REGISTERED TERMINAL.
                </p>
                <button 
                  onClick={() => { playClick(); setSuccess(false); setIsSignUp(false); }}
                  className="group flex items-center gap-3 mx-auto text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground transition-colors"
                >
                  <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-2 transition-transform" /> 
                  RETURN TO LOGIN
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key={isSignUp ? "signup" : "login"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 group-focus-within:text-enark-red transition-colors flex justify-between">
                      <span>EMAIL_ADDRESS</span>
                      <span className="opacity-0 group-focus-within:opacity-100 transition-opacity">SYS_01</span>
                    </label>
                    <input 
                      required
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="OPERATIVE@ENARK.OS"
                      className="w-full bg-white border border-foreground/10 p-5 text-sm font-bold outline-none focus:border-enark-red transition-all uppercase text-black placeholder:text-black/20"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex justify-between items-end">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 group-focus-within:text-enark-red transition-colors">PASSWORD_PROTOCOL</label>
                      {!isSignUp && (
                        <Link href="/login" className="text-[8px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors">
                          RESET_KEY?
                        </Link>
                      )}
                    </div>
                    <input 
                      required
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-foreground/10 p-5 text-lg tracking-[0.3em] font-black outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20"
                    />
                  </div>

                  {isSignUp && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 border-t border-foreground/5 space-y-4"
                    >
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity size={12} className="text-enark-red" />
                            <span className="text-[9px] font-black uppercase tracking-widest">ASSET_REGISTRY</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => { playClick(); setShowRegistry(!showRegistry); }}
                            className="text-[8px] font-black uppercase tracking-widest text-enark-red/60 hover:text-enark-red"
                          >
                            {showRegistry ? '[ HIDE_DIAGNOSTICS ]' : '[ INITIALIZE_SCAN ]'}
                          </button>
                       </div>

                       <AnimatePresence>
                         {showRegistry && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="grid grid-cols-3 gap-3"
                           >
                              <div className="space-y-2">
                                <label className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">HEIGHT (CM)</label>
                                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="w-full bg-white border border-foreground/5 p-3 text-xs font-bold outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">WAIST (IN)</label>
                                <input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="32" className="w-full bg-white border border-foreground/5 p-3 text-xs font-bold outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">AGE</label>
                                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="24" className="w-full bg-white border border-foreground/5 p-3 text-xs font-bold outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20" />
                              </div>
                              <div className="col-span-3 p-3 bg-enark-red/5 border border-enark-red/10 flex gap-2">
                                <Info size={10} className="text-enark-red shrink-0 mt-0.5" />
                                <p className="text-[7px] uppercase tracking-widest text-foreground/40 leading-relaxed">
                                  THESE PARAMETERS ARE USED FOR SIZE IDENTITY ACROSS THE WEBSITE TO ENSURE A PERFECT ASSET MATCH.
                                </p>
                              </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </motion.div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4 bg-enark-red/5 border-l-2 border-enark-red p-4"
                  >
                    <AlertTriangle className="text-enark-red shrink-0" size={14} />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-enark-red leading-relaxed">{error}</p>
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full group bg-foreground text-background font-black uppercase tracking-[0.4em] py-6 flex items-center justify-center gap-4 hover:bg-enark-red hover:text-white transition-all disabled:opacity-50 relative overflow-hidden"
                >
                  <span className="relative z-10">{loading ? 'SYNCHRONIZING...' : (isSignUp ? 'CREATE_OPERATIVE' : 'INITIATE_UPLINK')}</span>
                  {!loading && <ArrowRight size={16} className="relative z-10 group-hover:translate-x-3 transition-transform" />}
                  <div className="absolute inset-0 bg-enark-red translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>

                <div className="text-center pt-8 border-t border-foreground/5">
                  <button 
                    type="button"
                    onClick={() => {
                      playGlitch();
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-colors"
                  >
                    {isSignUp ? 'IDENTITY_EXISTS? RE-AUTHENTICATE.' : 'NO_CREDENTIALS? INITIALIZE_JOIN_SEQUENCE.'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
