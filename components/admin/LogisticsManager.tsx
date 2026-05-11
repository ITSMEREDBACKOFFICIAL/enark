'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSystemAction } from '@/lib/audit';

export default function LogisticsManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
    fetchAbandoned();

    // Enable Real-time for Orders and Abandoned Carts
    const channel = supabase
      .channel('logistics_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'abandoned_carts' }, () => {
        fetchAbandoned();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  async function fetchAbandoned() {
    const { data } = await supabase.from('abandoned_carts').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setAbandonedCarts(data);
  }

  async function fetchOrders() {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query.limit(20);
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      await logSystemAction('ORDER_STATUS_UPDATED', `ORDER_${id.slice(0, 8)}`, { newStatus });
      fetchOrders();
    }
  }

  async function updateOrderField(id: string, field: string, value: any) {
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
    if (!error) {
      // Update local state for immediate feedback
      setOrders(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, [field]: value });
      }
      await logSystemAction('ORDER_FIELD_UPDATED', `ORDER_${id.slice(0, 8)}`, { field, value });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Logistics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[10px] md:text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">PENDING</p>
          <h4 className="text-3xl md:text-4xl font-black">{orders.filter(o => o.status === 'pending').length}</h4>
        </div>
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[10px] md:text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">SHIPPED</p>
          <h4 className="text-3xl md:text-4xl font-black text-blue-500">{orders.filter(o => o.status === 'shipped').length}</h4>
        </div>
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[10px] md:text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">DELIVERED</p>
          <h4 className="text-3xl md:text-4xl font-black text-green-500">{orders.filter(o => o.status === 'delivered').length}</h4>
        </div>
      </div>

      {/* Operations Table */}
      <div className="border-1 border-white/10 bg-black overflow-hidden">
        <div className="p-4 md:p-6 border-b-1 border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xs font-black tracking-widest uppercase">ORDERS</h3>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {['all', 'pending', 'shipped', 'delivered', 'abandoned'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest border-1 transition-all ${filter === f ? 'bg-white text-black border-white' : 'text-white/60 border-white/10 hover:border-white/40'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 custom-scrollbar">
          <table className="w-full text-left text-xs mono border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b-1 border-white/10 text-white/60 uppercase">
                <th className="p-4 md:p-6 text-[10px] tracking-[0.3em]">ORDER ID</th>
                <th className="p-4 md:p-6 text-[10px] tracking-[0.3em]">CUSTOMER</th>
                <th className="p-4 md:p-6 text-[10px] tracking-[0.3em]">TOTAL</th>
                <th className="p-4 md:p-6 text-[10px] tracking-[0.3em]">STATUS</th>
                <th className="p-4 md:p-6 text-right text-[10px] tracking-[0.3em]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-1 divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-white/60">LOADING ORDERS...</td></tr>
              ) : (filter === 'abandoned' ? abandonedCarts : orders).length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-white/60 uppercase tracking-[0.5em]">NO DATA FOUND</td></tr>
              ) : (filter === 'abandoned' ? abandonedCarts : orders).map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 md:p-6 font-black group-hover:text-enark-red transition-colors">#{item.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 md:p-6">
                    <p className="font-bold truncate max-w-[150px]">{item.email}</p>
                    {filter === 'abandoned' && <p className="text-[10px] text-white/30 uppercase">In-Cart Session</p>}
                  </td>
                  <td className="p-4 md:p-6 font-bold text-white/80">₹{item.total_amount.toLocaleString()}</td>
                  <td className="p-4 md:p-6">
                    <span className={`px-3 py-1 border-1 font-black text-[10px] md:text-xs ${filter === 'abandoned' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : item.status === 'delivered' ? 'border-green-500 text-green-500 bg-green-500/5' : item.status === 'shipped' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-enark-red text-enark-red bg-enark-red/5'}`}>
                      {filter === 'abandoned' ? 'ABANDONED' : item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-right">
                    <div className="flex justify-end gap-2">
                      {filter !== 'abandoned' && item.status !== 'delivered' && (
                        <button 
                          onClick={() => updateOrderStatus(item.id, item.status === 'pending' ? 'shipped' : 'delivered')}
                          className="p-3 border-1 border-white/10 hover:border-enark-red hover:text-enark-red transition-all"
                          title={item.status === 'pending' ? "Mark as Shipped" : "Mark as Delivered"}
                        >
                          {item.status === 'pending' ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedOrder(item)}
                        className="p-3 border-1 border-white/10 hover:border-white transition-all"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Slide-over */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'circOut', duration: 0.5 }}
              className="relative w-full md:max-w-2xl bg-black border-l border-white/10 h-full flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="p-6 md:p-12 pb-6 md:pb-8 border-b border-white/10 flex justify-between items-start flex-shrink-0 bg-black z-20">
                <div className="space-y-2">
                  <p className="text-enark-red text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em]">ORDER // #{selectedOrder.id.slice(0, 8)}</p>
                  <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter-x">ORDER DETAILS</h2>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest p-2 -mr-2 -mt-2"
                >
                  CLOSE [X]
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-12 pt-6 md:pt-8 space-y-8 md:space-y-12 custom-scrollbar pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pb-8 border-b border-white/10">
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">CUSTOMER EMAIL</p>
                  <p className="text-lg md:text-xl font-black break-all">{selectedOrder.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">ORDER TOTAL</p>
                  <p className="text-lg md:text-xl font-black text-enark-red">₹{selectedOrder.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <Package size={14} /> ITEMS
                 </h4>
                 <div className="space-y-4">
                   {selectedOrder.items?.map((item: any, i: number) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 flex-shrink-0" />
                         <div>
                           <p className="text-[10px] md:text-xs font-black uppercase truncate max-w-[120px] md:max-w-none">{item.name || 'PRODUCT'}</p>
                           <p className="text-[9px] md:text-[10px] text-white/40 uppercase">QTY: {item.quantity || 1} // SIZE: {item.size || 'OS'}</p>
                         </div>
                       </div>
                       <p className="text-[10px] md:text-xs font-bold">₹{(item.price || 0).toLocaleString()}</p>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <Truck size={14} /> SHIPPING & LOGISTICS
                 </h4>
                 <div className="p-4 md:p-6 bg-white/5 border border-white/10 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">CARRIER_NODE</label>
                       <select 
                         value={selectedOrder.carrier_name || ''}
                         onChange={(e) => updateOrderField(selectedOrder.id, 'carrier_name', e.target.value)}
                         className="w-full bg-black border border-white/10 p-4 text-[10px] md:text-xs font-black uppercase"
                       >
                          <option value="ENARK_LOGISTICS">ENARK_INTERNAL</option>
                          <option value="DELHIVERY">DELHIVERY_GLOBAL</option>
                          <option value="BLUEDART">BLUEDART_EXPRESS</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">TRACKING_ID</label>
                       <input 
                         type="text"
                         value={selectedOrder.tracking_id || ''}
                         onChange={(e) => updateOrderField(selectedOrder.id, 'tracking_id', e.target.value)}
                         placeholder="ASSIGN_TRACKING_ID"
                         className="w-full bg-black border border-white/10 p-4 text-[10px] md:text-xs font-black uppercase outline-none focus:border-enark-red"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">DETAILED_STATUS</label>
                       <select 
                         value={selectedOrder.detailed_status || 'Awaiting Manifest'}
                         onChange={(e) => updateOrderField(selectedOrder.id, 'detailed_status', e.target.value)}
                         className="w-full bg-black border border-white/10 p-4 text-[10px] md:text-xs font-black uppercase"
                       >
                          <option value="Awaiting Manifest">Awaiting Manifest</option>
                          <option value="Asset Acquired">Asset Acquired</option>
                          <option value="Quality Control">Quality Control</option>
                          <option value="In Packing">In Packing</option>
                          <option value="Handed to Carrier">Handed to Carrier</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                       </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                       <span className="text-[10px] text-white/40 uppercase font-black">BACK_ORDERED</span>
                       <button 
                         onClick={() => updateOrderField(selectedOrder.id, 'is_back_ordered', !selectedOrder.is_back_ordered)}
                         className={`px-4 py-1 text-[10px] font-black transition-all ${selectedOrder.is_back_ordered ? 'bg-enark-red text-white' : 'bg-white/10 text-white/40'}`}
                       >
                         {selectedOrder.is_back_ordered ? 'ACTIVE' : 'INACTIVE'}
                       </button>
                    </div>

                    {selectedOrder.is_back_ordered && (
                      <div className="space-y-2">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">BACK_ORDER_ETA</label>
                        <input 
                          type="text"
                          value={selectedOrder.back_order_eta || ''}
                          onChange={(e) => updateOrderField(selectedOrder.id, 'back_order_eta', e.target.value)}
                          placeholder="e.g. 15th OCT 2026"
                          className="w-full bg-black border border-white/10 p-4 text-[10px] md:text-xs font-black uppercase outline-none focus:border-enark-red"
                        />
                      </div>
                    )}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <Clock size={14} /> DEPLOYMENT CONTROL
                 </h4>
                 <button 
                   onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'pending' ? 'shipped' : 'delivered')}
                   disabled={selectedOrder.status === 'delivered'}
                   className="w-full bg-enark-red text-white py-5 md:py-6 text-[11px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all disabled:opacity-20"
                 >
                   {selectedOrder.status === 'pending' ? 'MARK AS SHIPPED' : selectedOrder.status === 'shipped' ? 'MARK AS DELIVERED' : 'ORDER COMPLETE'}
                 </button>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
