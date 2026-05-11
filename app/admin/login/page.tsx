'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Terminal, Shield, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
        } else {
          const user = data.user;
          const isAdmin = 
            user?.app_metadata?.role === 'admin' || 
            user?.user_metadata?.role === 'admin' ||
            user?.email?.toLowerCase().trim() === 'boddurunagabushan@gmail.com';

          if (isAdmin) {
            window.location.assign('/command');
          } else {
            setError('ACCESS_DENIED: UNAUTHORIZED_IDENTITY');
            await supabase.auth.signOut();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 mono selection:bg-enark-red selection:text-white transition-colors duration-500">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.1
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="border border-foreground/5 bg-background p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-enark-red flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter-x uppercase">
                {isSignUp ? 'New_Admin_Node' : 'Admin_Auth_Node'}
              </h1>
              <div className="flex items-center gap-2 text-enark-red">
                <Terminal size={12} />
                <p className="text-[11px] font-bold uppercase tracking-widest leading-none">
                  {isSignUp ? 'INITIALIZING_ADMIN_UPLINK' : 'COMMAND_CENTER_ACCESS_REQUIRED'}
                </p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="space-y-8 text-center py-12">
              <div className="w-16 h-16 bg-green-600 mx-auto flex items-center justify-center rounded-full animate-bounce">
                <Shield className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2">ADMIN_UPLINK_CREATED</h3>
                <p className="text-xs text-foreground/60 uppercase tracking-widest">VERIFY YOUR IDENTITY VIA EMAIL TO PROCEED.</p>
              </div>
              <button 
                onClick={() => { setSuccess(false); setIsSignUp(false); }}
                className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all"
              >
                RETURN_TO_LOGIN
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-xs font-black text-foreground/40 uppercase tracking-widest">ADMIN_IDENTITY</label>
                <input 
                  required
                  id="admin-email"
                  name="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL_ADDRESS"
                  className="w-full bg-foreground/5 border border-foreground/10 p-4 text-xs outline-none focus:border-enark-red transition-all text-foreground"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-xs font-black text-foreground/40 uppercase tracking-widest">CIPHER_KEY</label>
                <input 
                  required
                  id="admin-password"
                  name="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-foreground/5 border border-foreground/10 p-4 text-xs outline-none focus:border-enark-red transition-all text-foreground"
                />
              </div>

              {error && (
                <div className="bg-enark-red/10 border-1 border-enark-red p-4 flex items-center gap-4">
                  <div className="w-2 h-2 bg-enark-red rounded-full animate-pulse" />
                  <p className="text-xs font-black uppercase text-enark-red leading-tight">
                    ERROR: {error.toUpperCase()}
                  </p>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-enark-red text-white py-4 font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-foreground hover:text-background transition-all group disabled:opacity-50"
              >
                {loading ? 'PROCESSING...' : 'INITIALIZE_COMMAND_SESSION'}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="w-full text-center text-[11px] font-black text-foreground/40 hover:text-foreground uppercase tracking-[0.3em] mt-4 transition-all"
              >
                {isSignUp ? 'ALREADY_HAVE_ADMIN_NODE? LOGIN' : 'NEED_NEW_ADMIN_NODE? SIGN_UP'}
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-foreground/5 flex items-center justify-between opacity-20">
            <p className="text-[11px] font-bold uppercase tracking-tighter text-foreground">SECURED_BY_ALIENKIND_OS_COMMAND</p>
            <Lock size={12} className="text-foreground" />
          </div>
        </div>

        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-enark-red pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-enark-red pointer-events-none" />
      </motion.div>
    </div>
  );
}
