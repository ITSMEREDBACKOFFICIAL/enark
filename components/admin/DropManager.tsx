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

    const channel = supabase
      .channel('drop_manager_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  const toggleProduct = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert('UPDATE_FAILED: ' + (data.error || 'Unknown error'));
        return;
      }
      
      fetchProducts();
    } catch (err: any) {
      alert('NETWORK_ERROR: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Drop Strategy Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="p-6 md:p-8 border border-enark-red/20 bg-enark-red/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-8 h-8 md:w-12 md:h-12 text-enark-red" />
           </div>
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-enark-red mb-4">ACTIVE_LAUNCH_SEQUENCE</p>
           <h4 className="text-2xl md:text-3xl font-black mb-2 uppercase">READY_TO_DEPLOY</h4>
           <p className="text-[10px] md:text-xs text-white/40 uppercase leading-relaxed">System ready for global product uplink. High latency protocol engaged.</p>
        </div>

        <div className="p-6 md:p-8 border border-white/10 bg-black">
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">SCHEDULED_DROPS</p>
           <h4 className="text-2xl md:text-3xl font-black mb-2">0</h4>
           <p className="text-[10px] md:text-xs text-white/40 uppercase leading-relaxed">No future drops queued in the neural buffer.</p>
        </div>

        <div className="p-6 md:p-8 border border-white/10 bg-black sm:col-span-2 lg:col-span-1">
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">TOTAL_ASSETS_ONLINE</p>
           <h4 className="text-2xl md:text-3xl font-black text-green-500 mb-2">
              {products.filter(p => p.is_active).length}
           </h4>
           <p className="text-[10px] md:text-xs text-white/40 uppercase leading-relaxed">Verified assets currently visible to public operatives.</p>
        </div>
      </div>

      {/* Deployment Control */}
      <div className="border border-white/10 bg-black overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <Zap size={18} className="text-enark-red flex-shrink-0" />
              <h3 className="text-xs font-black tracking-[0.3em] uppercase">Deployment_Control_Module</h3>
           </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-12 md:p-20 text-center text-white/20 mono text-[10px] md:text-xs uppercase tracking-[0.5em] animate-pulse">Scanning_For_Assets...</div>
          ) : products.length === 0 ? (
            <div className="p-12 md:p-20 text-center text-white/20 mono text-[10px] md:text-xs uppercase tracking-[0.5em]">No_Assets_Detected_In_Vault</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between group hover:bg-white/5 transition-all gap-6">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto overflow-hidden">
                  <div className={`w-1 h-10 md:h-12 flex-shrink-0 ${p.is_active ? 'bg-green-500' : 'bg-white/10'}`} />
                  <div className="overflow-hidden">
                    <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter-x group-hover:text-enark-red transition-colors truncate">{p.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1">
                       <span className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase truncate max-w-[150px] md:max-w-none">{p.slug}</span>
                       <span className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 border flex-shrink-0 ${p.is_active ? 'border-green-500/50 text-green-500' : 'border-white/20 text-white/20'}`}>
                          {p.is_active ? 'DEPLOYED' : 'IN_BUFFER'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t border-white/5 md:border-none pt-4 md:pt-0">
                   <div className="text-left md:text-right flex justify-between sm:block items-center">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40 mb-0 sm:mb-1">Current_Value</p>
                      <p className="font-mono text-[11px] md:text-xs font-bold">₹{p.base_price.toLocaleString()}</p>
                   </div>

                   <button 
                     onClick={() => toggleProduct(p.id, p.is_active)}
                     className={`w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${
                       p.is_active 
                         ? 'border-white/10 text-white/60 hover:border-enark-red hover:text-enark-red bg-black' 
                         : 'bg-enark-red text-white border-enark-red hover:bg-white hover:text-black'
                     }`}
                   >
                     {p.is_active ? <Pause size={14} className="flex-shrink-0" /> : <Play size={14} className="flex-shrink-0" />}
                     <span className="truncate">{p.is_active ? 'CEASE' : 'INITIALIZE'}</span>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Drop Protocol Info */}
      <div className="p-6 md:p-8 border border-dashed border-white/10 bg-black/50">
         <div className="flex items-center gap-4 text-white/40 mb-4 md:mb-6">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">DEPLOYMENT_PROTOCOL_NOTICE</h4>
         </div>
         <p className="text-[10px] md:text-xs text-white/30 md:text-white/40 uppercase leading-relaxed max-w-3xl font-mono">
            Initializing a drop will instantly propagate the asset through the global edge network. Operatives will receive real-time notifications via encrypted channels. Ensure all inventory and metadata nodes are verified before execution.
         </p>
      </div>
    </div>
  );
}
