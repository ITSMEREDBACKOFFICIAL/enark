'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Shield, Package, LogOut, ExternalLink, Activity, Database, AlertTriangle, Tag } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      // Fetch Orders
      const { data: userOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('email', session.user.email)
        .order('created_at', { ascending: false });

      if (userOrders) {
        setOrders(userOrders);
        const spent = userOrders.reduce((sum, order) => {
          if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
            return sum + order.total_amount;
          }
          return sum;
        }, 0);
        setTotalSpent(spent);
      }

      // Fetch Offers
      const { data: userOffers } = await supabase
        .from('operative_offers')
        .select('*')
        .eq('assigned_email', session.user.email)
        .eq('is_active', true)
        .eq('used', false);
      
      if (userOffers) setOffers(userOffers);
      
      setLoading(false);
    }

    checkAuthAndFetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getClearanceLevel = (spent: number) => {
    if (spent > 50000) return { level: '03', rank: 'ELITE', color: 'text-green-500', bar: 'w-full bg-green-500' };
    if (spent > 10000) return { level: '02', rank: 'OPERATIVE', color: 'text-blue-500', bar: 'w-2/3 bg-blue-500' };
    return { level: '01', rank: 'NOVICE', color: 'text-white/60', bar: 'w-1/3 bg-white/20' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-6">
         <Activity size={32} className="text-enark-red animate-pulse" />
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red">SYNCING_WITH_ENARK_CORE...</p>
      </div>
    );
  }

  const clearance = getClearanceLevel(totalSpent);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-6 md:px-12 selection:bg-enark-red selection:text-white">
      <Header />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        
        {/* Left Column: Identity & Clearance */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="p-8 border border-white/10 bg-black relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-enark-red" />
             <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
               <Shield size={24} className="text-enark-red" />
               <div>
                 <h2 className="text-sm font-black tracking-[0.3em] uppercase">OPERATIVE_PROFILE</h2>
                 <p className="mono text-[10px] text-white/40 tracking-widest">{user?.email}</p>
               </div>
             </div>
             
             <div className="space-y-6">
               <div>
                 <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Clearance_Level</p>
                 <div className="flex items-baseline gap-2">
                   <span className={`text-4xl font-black ${clearance.color}`}>{clearance.level}</span>
                   <span className="text-xs font-black uppercase tracking-widest text-white">{clearance.rank}</span>
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] mono uppercase text-white/60">
                   <span>Capital_Deployed</span>
                   <span>₹{totalSpent.toLocaleString()}</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${clearance.bar}`} />
                 </div>
               </div>

               {clearance.level !== '03' && (
                 <div className="p-4 border border-enark-red/20 bg-enark-red/5 flex items-start gap-3 mt-8">
                   <AlertTriangle size={14} className="text-enark-red shrink-0 mt-0.5" />
                   <p className="text-[9px] uppercase tracking-widest text-white/60 leading-relaxed">
                     Deploy more capital to reach the next clearance tier. Higher tiers unlock access to secured vault protocols and restricted drops.
                   </p>
                 </div>
               )}

               <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Clearance_Benefits</h3>
                 
                 <div className="space-y-3">
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '01' ? 'border-white/20 bg-white/5 text-white' : 'border-white/5 text-white/40'}`}>
                     <span>01_NOVICE</span>
                     <span className="opacity-50 text-[9px]">Standard Logistics</span>
                   </div>
                   
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '02' ? 'border-blue-500/50 bg-blue-500/10 text-blue-500' : 'border-white/5 text-white/40'}`}>
                     <span>02_OPERATIVE</span>
                     <span className="opacity-50 text-[9px]">Priority Support // Early Access</span>
                   </div>
                   
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '03' ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-white/5 text-white/40'}`}>
                     <span>03_ELITE</span>
                     <span className="opacity-50 text-[9px]">Vault Access // Classified Drops</span>
                   </div>
                 </div>
               </div>

               {offers.length > 0 && (
                 <div className="pt-6 border-t border-white/10 mt-6 space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-enark-red flex items-center gap-2">
                     <Tag size={12} /> ACTIVE_UPLINK_OFFERS
                   </h3>
                   <div className="space-y-3">
                     {offers.map((offer) => (
                       <div key={offer.id} className="p-4 border border-enark-red/30 bg-enark-red/5 flex flex-col gap-2">
                         <div className="flex justify-between items-center">
                           <span className="text-[10px] uppercase tracking-widest text-white/60">DISCOUNT_OVERRIDE</span>
                           <span className="text-sm font-black text-white">{offer.discount_percentage}% OFF</span>
                         </div>
                         <div className="flex justify-between items-end mt-2">
                           <div>
                             <p className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Access_Code</p>
                             <p className="font-mono text-lg font-bold tracking-widest text-enark-red">{offer.code}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-6 border border-white/10 bg-black text-xs font-black tracking-[0.3em] uppercase hover:bg-enark-red hover:border-enark-red transition-all"
          >
            <LogOut size={16} /> TERMINATE_UPLINK
          </button>

        </div>

        {/* Right Column: Logistics Tracking */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="flex items-center gap-4 mb-6">
             <Database size={20} className="text-white/60" />
             <h2 className="text-lg font-black tracking-tighter-x uppercase">LOGISTICS_MANIFEST</h2>
          </div>

          {orders.length === 0 ? (
            <div className="h-64 border border-dashed border-white/20 flex flex-col items-center justify-center space-y-4 bg-black/50">
               <Package size={32} className="text-white/20" />
               <p className="text-xs uppercase tracking-[0.3em] text-white/40 font-black">NO_ASSETS_ACQUIRED_YET</p>
               <button 
                 onClick={() => router.push('/shop')}
                 className="text-[10px] uppercase tracking-widest text-enark-red underline underline-offset-4 mt-2"
               >
                 BROWSE_REGISTRY
               </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id} 
                  className="p-6 border border-white/10 bg-black hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${
                        order.status === 'paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                        'bg-white/10 text-white/60 border border-white/20'
                      }`}>
                        {order.status === 'paid' ? 'UPLINK_SECURED' : order.status}
                      </span>
                      <span className="mono text-[10px] text-white/40">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1">TRANSACTION_ID: {order.razorpay_order_id || order.id.split('-')[0]}</p>
                      <p className="mono text-[10px] text-white/40 max-w-sm truncate">{order.shipping_address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t border-white/10 pt-4 md:border-0 md:pt-0">
                    <p className="text-lg font-black mono text-enark-red">₹{order.total_amount.toLocaleString()}</p>
                    <button 
                      onClick={() => router.push(`/track?id=${order.id}`)}
                      className="text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                    >
                       TRACK_ASSET <ExternalLink size={10} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
