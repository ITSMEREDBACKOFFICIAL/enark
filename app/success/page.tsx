'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Package, Truck, ArrowRight, Download, Share2, Shield, Activity, Globe, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function fetchOrderDetails() {
      // Fetch order by tracking_id or razorpay_order_id (dispatchId)
      const { data: orderData, error } = await supabase
        .from('orders')
        .select('*')
        .or(`tracking_id.eq.${orderId},razorpay_order_id.eq.${orderId}`)
        .single();

      if (orderData) {
        setOrder(orderData);
        // Fetch order items with product details
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products(name, images)')
          .eq('order_id', orderData.id);
        
        if (itemsData) setItems(itemsData);
      }
      setLoading(false);
    }

    fetchOrderDetails();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Activity size={32} className="text-enark-red animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red animate-pulse">DECRYPTING_UPLINK_MANIFEST...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Zap size={32} className="text-enark-red" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">UPLINK_NOT_FOUND</p>
        <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-8 py-4">Return_to_Base</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-enark-red mono pt-32 pb-20 px-6">
      <Header />
      
      <div className="max-w-4xl mx-auto">
        
        {/* Cinematic Success Animation */}
        <div className="relative mb-20">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="flex flex-col items-center text-center space-y-6"
           >
              <div className="relative">
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 border border-dashed border-enark-red/20 rounded-full scale-150"
                 />
                 <div className="w-24 h-24 rounded-full border border-green-500 bg-green-500/10 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 size={40} className="text-green-500" />
                 </div>
              </div>
              
              <div className="space-y-2">
                 <h1 className="text-4xl md:text-6xl font-black tracking-tighter-x uppercase italic">UPLINK_SECURED</h1>
                 <p className="text-xs text-foreground/40 uppercase tracking-[0.3em]">Transaction confirmed by the Enark Neural Mesh</p>
              </div>
           </motion.div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
           
           {/* Left: Summary */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="p-8 border border-foreground/10 bg-foreground/5 space-y-8"
           >
              <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">ORDER_MANIFEST</h3>
                 <span className="text-[10px] font-black text-enark-red uppercase tracking-widest">#{order.razorpay_order_id || order.tracking_id}</span>
              </div>

              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                 {items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                       <div className="w-12 h-16 bg-background border border-foreground/10 overflow-hidden">
                          <img src={item.products?.images?.[0]} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                       </div>
                       <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[10px] font-black uppercase">{item.products?.name}</p>
                          <p className="text-[8px] text-foreground/40 uppercase mt-1">QTY: {item.quantity} // SIZE: {item.size}</p>
                          <p className="text-[10px] font-black mt-1">₹{(item.unit_price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="border-t border-foreground/10 pt-6 space-y-3">
                 <div className="flex justify-between text-[10px] uppercase tracking-widest text-foreground/40">
                    <span>Logistics</span>
                    <span>{order.total_amount > 5000 ? 'FREE_AIR_FREIGHT' : '₹150'}</span>
                 </div>
                 <div className="flex justify-between text-lg font-black uppercase italic tracking-tighter-x">
                    <span>TOTAL_VALUE</span>
                    <span className="text-enark-red">₹{order.total_amount.toLocaleString()}</span>
                 </div>
              </div>
           </motion.div>

           {/* Right: Logistics & Actions */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.7 }}
             className="space-y-8"
           >
              <div className="p-8 border border-foreground/10 bg-foreground/5 space-y-6">
                 <div className="flex items-center gap-4 text-enark-red">
                    <Truck size={18} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">LOGISTICS_ROUTING</h3>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-1">Shipping_Baseline</p>
                       <p className="text-xs font-black uppercase leading-relaxed">
                         {order.shipping_address?.full_address || (typeof order.shipping_address === 'string' ? order.shipping_address : JSON.stringify(order.shipping_address))}
                       </p>
                    </div>
                    <div>
                       <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-1">Deployment_Method</p>
                       <p className="text-xs font-black uppercase">{order.payment_method === 'COD' ? 'CASH_ON_DELIVERY' : 'ONLINE_SECURED'}</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button className="flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-enark-red hover:bg-white/5 transition-all">
                    <Download size={20} className="text-white/40" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Download_Invoice</span>
                 </button>
                 <button className="flex flex-col items-center gap-3 p-6 border border-white/10 hover:border-enark-red hover:bg-white/5 transition-all">
                    <Share2 size={20} className="text-white/40" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Share_Uplink</span>
                 </button>
              </div>

              <button 
                onClick={() => router.push('/account')}
                className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.3em] text-xs hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-4 group"
              >
                 GO TO OPERATIVE DASHBOARD <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </motion.div>

        </div>

        {/* Support Banner */}
        <div className="p-6 border border-dashed border-white/10 text-center opacity-50">
           <p className="text-[9px] uppercase tracking-[0.4em]">Confirmation dispatched to {order.email}. Track your asset status in the Operative Dashboard.</p>
        </div>

      </div>

      <Footer />
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Activity size={32} className="text-enark-red animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red animate-pulse">SYNCHRONIZING_UPLINK...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
