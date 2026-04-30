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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Logistics Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">PENDING_FULFILLMENT</p>
          <h4 className="text-4xl font-black">{orders.filter(o => o.status === 'pending').length}</h4>
        </div>
        <div className="p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">IN_TRANSIT</p>
          <h4 className="text-4xl font-black text-blue-500">{orders.filter(o => o.status === 'shipped').length}</h4>
        </div>
        <div className="p-8 border-1 border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">DELIVERED_30D</p>
          <h4 className="text-4xl font-black text-green-500">{orders.filter(o => o.status === 'delivered').length}</h4>
        </div>
      </div>

      {/* Operations Table */}
      <div className="border-1 border-white/10 bg-black overflow-hidden">
        <div className="p-6 border-b-1 border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="text-xs font-black tracking-widest uppercase">SHIPMENT_MANIFEST</h3>
          <div className="flex gap-2">
            {['all', 'pending', 'shipped', 'delivered'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-widest border-1 transition-all ${filter === f ? 'bg-white text-black border-white' : 'text-white/60 border-white/10 hover:border-white/40'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <table className="w-full text-left text-xs mono border-collapse">
          <thead>
            <tr className="border-b-1 border-white/10 text-white/60 uppercase">
              <th className="p-6 text-[10px] tracking-[0.3em]">TRACKING_ID</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">DESTINATION_NODE</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">VALUE</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">LATEST_STATUS</th>
              <th className="p-6 text-right text-[10px] tracking-[0.3em]">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-1 divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-white/60">FETCHING_MANIFEST...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-white/60 uppercase tracking-[0.5em]">NO_ORDERS_FOUND_IN_MANIFEST</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6 font-black group-hover:text-enark-red transition-colors">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-6">
                   <p className="font-bold">{order.email}</p>
                   <p className="text-[11px] text-white/40 uppercase">INDIA_ZONE_01</p>
                </td>
                <td className="p-6 font-bold text-white/80">₹{order.total_amount.toLocaleString()}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 border-1 font-black ${order.status === 'delivered' ? 'border-green-500 text-green-500 bg-green-500/5' : order.status === 'shipped' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-enark-red text-enark-red bg-enark-red/5'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    {order.status !== 'delivered' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, order.status === 'pending' ? 'shipped' : 'delivered')}
                        className="p-3 border-1 border-white/10 hover:border-enark-red hover:text-enark-red transition-all"
                        title={order.status === 'pending' ? "Mark as Shipped" : "Mark as Delivered"}
                      >
                        {order.status === 'pending' ? <Truck size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedOrder(order)}
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
              className="relative w-full max-w-2xl bg-black border-l border-white/10 h-full overflow-y-auto p-12 space-y-12 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-8 right-8 text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
              >
                CLOSE [X]
              </button>

              <div className="space-y-4">
                <p className="text-enark-red text-[11px] font-black uppercase tracking-[0.4em]">MANIFEST_ENTRY // #{selectedOrder.id.slice(0, 8)}</p>
                <h2 className="text-5xl font-black uppercase tracking-tighter-x">ORDER_DETAIL</h2>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/10">
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">DESTINATION_OPERATIVE</p>
                  <p className="text-xl font-black">{selectedOrder.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">TRANSACTION_VALUE</p>
                  <p className="text-xl font-black text-enark-red">₹{selectedOrder.total_amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <Package size={14} /> ITEM_MANIFEST
                 </h4>
                 <div className="space-y-4">
                   {selectedOrder.items?.map((item: any, i: number) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/10">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white/10" />
                         <div>
                           <p className="text-xs font-black uppercase">{item.name || 'ASSET_PRODUCT'}</p>
                           <p className="text-[10px] text-white/40 uppercase">QTY: {item.quantity || 1} // SIZE: {item.size || 'OS'}</p>
                         </div>
                       </div>
                       <p className="text-xs font-bold">₹{(item.price || 0).toLocaleString()}</p>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   <Truck size={14} /> SHIPPING_LOGISTICS
                 </h4>
                 <div className="p-6 bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between">
                       <span className="text-[10px] text-white/40 uppercase">STATUS</span>
                       <span className="text-[10px] font-black uppercase text-enark-red">{selectedOrder.status}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-[10px] text-white/40 uppercase">CARRIER</span>
                       <span className="text-[10px] font-black uppercase">ENARK_LOGISTICS_X1</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-[10px] text-white/40 uppercase">ADDRESS</span>
                       <span className="text-[10px] font-black uppercase text-right max-w-[200px]">
                         {selectedOrder.shipping_address || 'PRIMARY_NODE_ADDRESS_STUB'}
                       </span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'pending' ? 'shipped' : 'delivered')}
                disabled={selectedOrder.status === 'delivered'}
                className="w-full bg-enark-red text-white py-6 font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all disabled:opacity-20"
              >
                {selectedOrder.status === 'pending' ? 'INITIALIZE_SHIPMENT' : selectedOrder.status === 'shipped' ? 'CONFIRM_DELIVERY' : 'ORDER_COMPLETE'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
