'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Box, 
  Activity,
  AlertCircle,
  Calendar
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function OrderInfoContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setOrder(data);
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*, products(name, images)')
          .eq('order_id', data.id);
        if (itemsData) setItems(itemsData);
      }
      setLoading(false);
    }

    fetchOrder();

    // Real-time subscription for status updates
    const channel = supabase
      .channel(`order_info_${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
        setOrder(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6">
        <Activity size={32} className="text-enark-red animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red">DECRYPTING_MANIFEST_STREAMS...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <AlertCircle size={40} className="text-enark-red mb-4" />
        <p className="text-xs uppercase tracking-widest font-black">MANIFEST_NOT_FOUND</p>
      </div>
    );
  }

  const stages = [
    { name: 'Order Placed', status: 'Awaiting Manifest', icon: Box },
    { name: 'Asset Acquired', status: 'Asset Acquired', icon: Shield },
    { name: 'Quality Control', status: 'Quality Control', icon: Activity },
    { name: 'In Packing', status: 'In Packing', icon: Package },
    { name: 'Dispatched', status: 'Handed to Carrier', icon: Truck },
    { name: 'Delivered', status: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStageIndex = stages.findIndex(s => s.status === order.detailed_status);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-enark-red mono pt-32 pb-20 px-6">
      <Header />
      
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-foreground/10 pb-12">
           <div className="space-y-4">
              <p className="text-enark-red text-[11px] font-black uppercase tracking-[0.4em]">OPERATIVE_MANIFEST // DETAILS</p>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter-x italic">ORDER_0x{order.id.slice(0, 8).toUpperCase()}</h1>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                 <span>{new Date(order.created_at).toLocaleDateString()}</span>
                 <span>//</span>
                 <span>{order.email}</span>
              </div>
           </div>
           
           {order.is_back_ordered && (
             <div className="p-6 border border-enark-red bg-enark-red/5 space-y-2 max-w-xs">
                <div className="flex items-center gap-3 text-enark-red">
                   <Clock size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">BACK_ORDERED_PROTOCOL</span>
                </div>
                <p className="text-[9px] uppercase tracking-widest text-foreground/60 leading-relaxed">
                   This asset is currently in production. Estimated deployment: <span className="text-foreground">{order.back_order_eta || 'TBD'}</span>
                </p>
             </div>
           )}
        </div>

        {/* Real-time Tracking Timeline */}
        <div className="space-y-8 py-12">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-12">DEPLOYMENT_TIMELINE</h3>
           
           <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = stage.icon;

                return (
                  <div key={idx} className="relative group">
                     <div className={`p-6 border flex flex-col items-center gap-4 transition-all duration-500 ${
                       isCompleted ? 'border-enark-red bg-enark-red/5' : 'border-foreground/5 bg-foreground/[0.02] opacity-30'
                     }`}>
                        <Icon size={24} className={isCompleted ? 'text-enark-red' : 'text-foreground/30'} />
                        <span className={`text-[8px] font-black uppercase tracking-widest text-center ${isCompleted ? 'text-foreground' : 'text-foreground/30'}`}>
                           {stage.name}
                        </span>
                        {isCurrent && (
                          <motion.div 
                            layoutId="indicator"
                            className="absolute -top-1 -left-1 -right-1 -bottom-1 border border-enark-red animate-pulse"
                          />
                        )}
                     </div>
                     {idx < stages.length - 1 && (
                       <div className={`hidden md:block absolute top-1/2 -right-2 w-4 h-[1px] ${isCompleted ? 'bg-enark-red' : 'bg-foreground/5'}`} />
                     )}
                  </div>
                );
              })}
           </div>
        </div>

        {/* Grid: Logistics & Manifest Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* Left: Manifest Summary */}
           <div className="lg:col-span-7 p-8 border border-foreground/10 bg-foreground/5 space-y-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-4">ASSET_MANIFEST_SUMMARY</h3>
              <div className="space-y-6">
                 {items.map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-center">
                       <div className="w-16 h-20 bg-background border border-foreground/10 overflow-hidden">
                          <img src={item.products?.images?.[0]} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                       </div>
                       <div className="flex-1">
                          <p className="text-xs font-black uppercase">{item.products?.name}</p>
                          <p className="text-[9px] text-foreground/40 uppercase mt-1">VARIANT: {item.size} // QTY: {item.quantity}</p>
                          <p className="text-[11px] font-black mt-2 text-enark-red">₹{(item.unit_price * item.quantity).toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-8 border-t border-foreground/10 space-y-3">
                 <div className="flex justify-between text-[10px] uppercase text-foreground/40 tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{order.total_amount > 5000 ? (order.total_amount).toLocaleString() : (order.total_amount - 150).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-[10px] uppercase text-foreground/40 tracking-widest">
                    <span>Deployment Fee</span>
                    <span>{order.total_amount > 5000 ? 'WAIVED' : '₹150'}</span>
                 </div>
                 <div className="flex justify-between text-xl font-black uppercase italic tracking-tighter-x pt-2">
                    <span>TOTAL_MANIFEST_VALUE</span>
                    <span className="text-enark-red">₹{order.total_amount.toLocaleString()}</span>
                 </div>
              </div>
           </div>

           {/* Right: Logistics Node Details */}
           <div className="lg:col-span-5 space-y-8">
              <div className="p-8 border border-foreground/10 bg-foreground/5 space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-4">LOGISTICS_NODE_ID</h3>
                 
                 <div className="space-y-6">
                    <div>
                       <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-2">Carrier_Partner</p>
                       <p className="text-sm font-black uppercase">{order.carrier_name || 'ENARK_INTERNAL'}</p>
                    </div>
                    <div>
                       <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-2">Tracking_Ref_ID</p>
                       <p className="text-sm font-black uppercase font-mono text-enark-red">{order.tracking_id || 'UPLINK_PENDING'}</p>
                    </div>
                    <div>
                       <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-2">Delivery_Baseline</p>
                       <p className="text-xs font-black uppercase leading-relaxed text-foreground/60">
                          {typeof order.shipping_address === 'object' ? order.shipping_address.full_address : order.shipping_address}
                       </p>
                    </div>
                 </div>

                 {order.tracking_id && (
                   <button 
                     onClick={() => router.push(`/track?id=${order.id}`)}
                     className="w-full bg-foreground text-background py-5 font-black uppercase tracking-widest text-[10px] hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-3"
                   >
                     RE-ESTABLISH_UPLINK <Truck size={14} />
                   </button>
                 )}
              </div>

              <div className="p-8 border border-dashed border-foreground/10 space-y-4">
                 <div className="flex items-center gap-3 text-foreground/40">
                    <Calendar size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol_Notification</span>
                 </div>
                 <p className="text-[9px] text-foreground/30 uppercase tracking-widest leading-relaxed">
                    Automated updates are dispatched to your registered email node upon every manifest status transition.
                 </p>
              </div>
           </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}

export default function OrderInfoPage() {
  return (
    <Suspense fallback={null}>
      <OrderInfoContent />
    </Suspense>
  );
}
