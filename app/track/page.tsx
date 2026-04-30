'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, AlertTriangle, ArrowRight, Database, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('id') || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('email', email.toLowerCase())
        .single();

      if (error || !data) {
        setError('ASSET_NOT_FOUND: ENSURE_CREDENTIALS_ARE_CORRECT');
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError('SYSTEM_CONNECTION_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-enark-red selection:text-white">
      <Header />
      
      <main className="pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-20 space-y-4">
             <p className="text-xs font-black text-enark-red uppercase tracking-[0.5em] mb-4">Logistics_Interface // Node_Status</p>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter-x uppercase leading-none">Track_Your<br/><span className="text-white/20">Assets</span></h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-5 space-y-8">
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">ENARK_RECEIPT_ID</label>
                  <input 
                    required
                    type="text" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="UPLINK_UUID"
                    className="w-full bg-white/5 border border-white/10 p-6 text-sm font-mono outline-none focus:border-enark-red transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">SECURE_EMAIL_ROUTING</label>
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATIVE@DOMAIN.COM"
                    className="w-full bg-white/5 border border-white/10 p-6 text-sm outline-none focus:border-enark-red transition-all uppercase"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black py-6 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  {loading ? 'SYNCING_NODES...' : 'INITIALIZE_TRACKING'}
                  <Search size={16} />
                </button>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-6 border border-red-500/50 bg-red-500/10 flex items-center gap-4"
                  >
                    <AlertTriangle className="text-red-500" size={20} />
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="md:col-span-7">
              <AnimatePresence mode="wait">
                {order ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-white/10 bg-white/5 p-8 md:p-12 space-y-12 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Database size={120} />
                    </div>

                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">STATUS_PROTOCOL</p>
                          <p className="text-2xl font-black uppercase text-enark-red">{order.status}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">LAST_UPLINK</p>
                          <p className="text-sm font-black uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="relative pt-8">
                       <div className="absolute top-[3.25rem] left-0 w-full h-[1px] bg-white/10" />
                       <div 
                         className="absolute top-[3.25rem] left-0 h-[1px] bg-enark-red transition-all duration-1000" 
                         style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
                       />
                       <div className="flex justify-between relative z-10">
                          {[
                            { id: 'pending', icon: Package, label: 'QUEUED' },
                            { id: 'processing', icon: Database, label: 'PREPARING' },
                            { id: 'shipped', icon: Truck, label: 'IN_TRANSIT' },
                            { id: 'delivered', icon: CheckCircle, label: 'DELIVERED' }
                          ].map((step, i) => {
                            const active = getStatusStep(order.status) >= i;
                            const Icon = step.icon;
                            return (
                              <div key={step.id} className="flex flex-col items-center gap-4">
                                <div className={`w-12 h-12 flex items-center justify-center border transition-all duration-700 ${active ? 'bg-enark-red border-enark-red text-white' : 'bg-black border-white/10 text-white/20'}`}>
                                   <Icon size={18} />
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/20'}`}>{step.label}</p>
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <MapPin size={14} className="text-enark-red" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Delivery_Coords</p>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed uppercase">{order.address}</p>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <Package size={14} className="text-enark-red" />
                             <p className="text-[10px] font-black uppercase tracking-widest">Asset_Total</p>
                          </div>
                          <p className="text-xl font-black uppercase">₹{order.total_amount.toLocaleString()}</p>
                       </div>
                    </div>

                    <div className="p-4 bg-enark-red/10 border border-enark-red/20 text-[10px] text-enark-red font-black uppercase tracking-widest text-center">
                       ASSET_TETHER_IS_STABLE // REAL-TIME_LOGISTICS_ACTIVE
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full border border-dashed border-white/10 flex flex-col items-center justify-center p-20 text-center space-y-6"
                  >
                    <Package size={48} className="text-white/10" />
                    <p className="text-xs text-white/20 font-black uppercase tracking-[0.5em]">Awaiting_Input_Sequence</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-enark-red animate-pulse">SYNCHRONIZING...</div>}>
      <TrackContent />
    </Suspense>
  );
}
