'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Calendar, CheckCircle2, AlertTriangle, Play, Pause } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DropManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  const toggleProduct = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchProducts();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Drop Strategy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 border border-enark-red/20 bg-enark-red/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={48} className="text-enark-red" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-enark-red mb-4">ACTIVE_LAUNCH_SEQUENCE</p>
           <h4 className="text-3xl font-black mb-2">READY_TO_DEPLOY</h4>
           <p className="text-xs text-white/40 uppercase leading-relaxed">System ready for global product uplink. High latency protocol engaged.</p>
        </div>

        <div className="p-8 border border-white/10 bg-black">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">SCHEDULED_DROPS</p>
           <h4 className="text-3xl font-black mb-2">0</h4>
           <p className="text-xs text-white/40 uppercase leading-relaxed">No future drops queued in the neural buffer.</p>
        </div>

        <div className="p-8 border border-white/10 bg-black">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">TOTAL_ASSETS_ONLINE</p>
           <h4 className="text-3xl font-black text-green-500 mb-2">
              {products.filter(p => p.is_active).length}
           </h4>
           <p className="text-xs text-white/40 uppercase leading-relaxed">Verified assets currently visible to public operatives.</p>
        </div>
      </div>

      {/* Deployment Control */}
      <div className="border border-white/10 bg-black overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Zap size={18} className="text-enark-red" />
              <h3 className="text-xs font-black tracking-[0.3em] uppercase">Deployment_Control_Module</h3>
           </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-20 text-center text-white/20 mono text-xs uppercase tracking-[0.5em] animate-pulse">Scanning_For_Assets...</div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-white/20 mono text-xs uppercase tracking-[0.5em]">No_Assets_Detected_In_Vault</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-8 flex flex-col md:flex-row items-center justify-between group hover:bg-white/5 transition-all">
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                  <div className={`w-1 h-12 ${p.is_active ? 'bg-green-500' : 'bg-white/10'}`} />
                  <div>
                    <h4 className="text-xl font-black uppercase tracking-tighter-x group-hover:text-enark-red transition-colors">{p.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-[10px] font-mono text-white/40 uppercase">{p.slug}</span>
                       <span className={`text-[9px] font-black px-2 py-0.5 border ${p.is_active ? 'border-green-500/50 text-green-500' : 'border-white/20 text-white/20'}`}>
                          {p.is_active ? 'DEPLOYED' : 'IN_BUFFER'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Current_Value</p>
                      <p className="font-mono text-xs font-bold">₹{p.base_price.toLocaleString()}</p>
                   </div>

                   <button 
                     onClick={() => toggleProduct(p.id, p.is_active)}
                     className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${
                       p.is_active 
                         ? 'border-white/10 text-white/60 hover:border-enark-red hover:text-enark-red' 
                         : 'bg-enark-red text-white border-enark-red hover:bg-white hover:text-black'
                     }`}
                   >
                     {p.is_active ? <Pause size={14} /> : <Play size={14} />}
                     {p.is_active ? 'CEASE_DEPLOYMENT' : 'INITIALIZE_DROP'}
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drop Protocol Info */}
      <div className="p-8 border border-dashed border-white/10 bg-black/50">
         <div className="flex items-center gap-4 text-white/40 mb-6">
            <AlertTriangle size={18} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">DEPLOYMENT_PROTOCOL_NOTICE</h4>
         </div>
         <p className="text-xs text-white/40 uppercase leading-relaxed max-w-3xl font-mono">
            Initializing a drop will instantly propagate the asset through the global edge network. Operatives will receive real-time notifications via encrypted channels. Ensure all inventory and metadata nodes are verified before execution.
         </p>
      </div>
    </div>
  );
}
