'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ShoppingBag, TrendingUp, ShieldAlert, Mail, X, Gift, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logSystemAction } from '@/lib/audit';

export default function OperativeManager() {
  const [operatives, setOperatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOp, setSelectedOp] = useState<any>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(15);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    fetchOperatives();
  }, []);

  async function fetchOperatives() {
    setLoading(true);
    const { data: orders } = await supabase.from('orders').select('email, total_amount, status, created_at');
    
    if (orders) {
      const grouped = orders.reduce((acc: any, order: any) => {
        if (!acc[order.email]) {
          acc[order.email] = {
            email: order.email,
            totalSpent: 0,
            orderCount: 0,
            lastOrder: order.created_at,
            status: 'ACTIVE'
          };
        }
        acc[order.email].totalSpent += order.total_amount;
        acc[order.email].orderCount += 1;
        if (new Date(order.created_at) > new Date(acc[order.email].lastOrder)) {
          acc[order.email].lastOrder = order.created_at;
        }
        return acc;
      }, {});
      
      setOperatives(Object.values(grouped).sort((a: any, b: any) => b.totalSpent - a.totalSpent));
    }
    setLoading(false);
  }

  async function handleQuickDispatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOp || !promoCode) return;
    
    setIsDispatching(true);
    const { error } = await supabase.from('operative_offers').insert({
      assigned_email: selectedOp.email,
      code: promoCode.toUpperCase(),
      discount_percentage: discountAmount,
      is_active: true,
      is_single_use: true
    });

    if (!error) {
      await logSystemAction('OFFER_DISPATCHED', selectedOp.email, { code: promoCode, discount: discountAmount });
      setSelectedOp(null);
      setPromoCode('');
    } else {
      alert('DISPATCH_FAILED: ' + error.message);
    }
    setIsDispatching(false);
  }

  const filtered = operatives.filter(op => 
    op.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Operative HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 border border-white/10 bg-black">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">TOTAL_OPERATIVES</p>
           <h4 className="text-4xl font-black">{operatives.length}</h4>
        </div>
        <div className="p-8 border border-white/10 bg-black">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">AVG_LIFETIME_VALUE</p>
           <h4 className="text-4xl font-black text-enark-red">
             ₹{operatives.length ? Math.round(operatives.reduce((acc, curr) => acc + curr.totalSpent, 0) / operatives.length).toLocaleString() : 0}
           </h4>
        </div>
        <div className="p-8 border border-white/10 bg-black relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <TrendingUp size={64} className="text-green-500" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">RETENTION_RATE</p>
           <h4 className="text-4xl font-black text-green-500">
             {operatives.length ? Math.round((operatives.filter(o => o.orderCount > 1).length / operatives.length) * 100) : 0}%
           </h4>
        </div>
      </div>

      {/* Operative Registry */}
      <div className="border border-white/10 bg-black overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <Users size={18} className="text-enark-red" />
              <h3 className="text-xs font-black tracking-[0.3em] uppercase">Operative_Registry_Manifest</h3>
           </div>
           <div className="flex bg-white/5 border border-white/10 p-1 w-full md:w-80">
              <Search size={14} className="text-white/20 m-2" />
              <input 
                type="text" 
                placeholder="SEARCH_OPERATIVE..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[10px] uppercase tracking-widest p-2"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">OPERATIVE_ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">ORDER_COUNT</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">LIFETIME_VALUE</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">LAST_UPLINK</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">PROTOCOL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-white/20 uppercase tracking-[0.5em] animate-pulse">Syncing_Nodes...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-white/20 uppercase tracking-[0.5em]">No_Operatives_In_Registry</td></tr>
              ) : (
                filtered.map((op) => (
                  <tr key={op.email} className="group hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-enark-red group-hover:border-enark-red transition-all">
                            <Users size={16} />
                         </div>
                         <div>
                            <p className="text-sm font-black uppercase tracking-tighter-x">{op.email.split('@')[0]}</p>
                            <p className="text-[10px] text-white/40 uppercase">{op.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-2">
                          <ShoppingBag size={12} className="text-white/20" />
                          <span className="text-xs font-bold">{op.orderCount}</span>
                       </div>
                    </td>
                    <td className="p-6 text-sm font-black text-enark-red">₹{op.totalSpent.toLocaleString()}</td>
                    <td className="p-6 text-[10px] text-white/40 uppercase font-mono">{new Date(op.lastOrder).toLocaleDateString()}</td>
                    <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedOp(op);
                              setPromoCode(`ELITE_${Math.floor(Math.random() * 1000)}`);
                            }}
                            className="p-3 border border-white/10 text-white/40 hover:text-enark-red hover:border-enark-red transition-all"
                            title="Dispatch Offer"
                          >
                             <Mail size={14} />
                          </button>
                          <button className="p-3 border border-white/10 text-white/40 hover:text-enark-red hover:border-enark-red transition-all">
                             <ShieldAlert size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Dispatch Modal */}
      <AnimatePresence>
        {selectedOp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border border-white/20 bg-black p-12 relative"
            >
              <button onClick={() => setSelectedOp(null)} className="absolute top-8 right-8 text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest">CLOSE [X]</button>
              
              <div className="flex items-center gap-4 mb-8">
                <Gift size={24} className="text-enark-red" />
                <h3 className="text-xl font-black uppercase tracking-widest">QUICK_DISPATCH</h3>
              </div>

              <form onSubmit={handleQuickDispatch} className="space-y-8">
                <div className="space-y-4">
                   <div className="p-4 bg-white/5 border border-white/10">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">TARGET_OPERATIVE</p>
                      <p className="text-xs font-black uppercase">{selectedOp.email}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DISCOUNT_%</label>
                        <input 
                          type="number" 
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-mono outline-none focus:border-enark-red"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">PROMO_CODE</label>
                        <input 
                          type="text" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="w-full bg-white/5 border border-white/10 p-4 text-xs font-black outline-none focus:border-enark-red uppercase"
                        />
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isDispatching}
                  className="w-full bg-enark-red text-white py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                >
                  {isDispatching ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                  {isDispatching ? 'UPLINKING...' : 'DISPATCH_OFFER_NOW'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper for Refresh icon if needed, or import from lucide
import { RefreshCw } from 'lucide-react';
