'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';
import { Shield, Package, LogOut, ExternalLink, Activity, Database, AlertTriangle, Tag, Ruler } from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const { playClick, playSuccess, playError } = useAudio();
  
  // Asset Registry State
  const [isEditingDimensions, setIsEditingDimensions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: '',
    chest: '',
    waist: '',
    hips: '',
    age: ''
  });

  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (session) {
        setUser(session.user);
        if (session.user.user_metadata) {
          setDimensions({
            height: session.user.user_metadata.height || '',
            chest: session.user.user_metadata.chest || '',
            waist: session.user.user_metadata.waist || '',
            hips: session.user.user_metadata.hips || '',
            age: session.user.user_metadata.age || ''
          });
        }
      }

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

  const handleUpdateDimensions = async () => {
    setSaving(true);
    playClick();
    
    const { error } = await supabase.auth.updateUser({
      data: dimensions
    });

    if (error) {
      playError();
      alert('Error updating parameters: ' + error.message);
    } else {
      playSuccess();
      setIsEditingDimensions(false);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getClearanceLevel = (spent: number) => {
    if (spent > 50000) return { level: '03', rank: 'ELITE', color: 'text-green-600', bar: 'bg-green-600' };
    if (spent > 10000) return { level: '02', rank: 'OPERATIVE', color: 'text-blue-600', bar: 'bg-blue-600' };
    return { level: '01', rank: 'NOVICE', color: 'text-foreground/30', bar: 'bg-foreground/10' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F6] flex flex-col items-center justify-center p-6 space-y-6">
         <Activity size={32} className="text-enark-red animate-pulse" />
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-enark-red">SYNCING_WITH_ENARK_CORE...</p>
      </div>
    );
  }

  const clearance = getClearanceLevel(totalSpent);

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-6 md:px-12 selection:bg-enark-red selection:text-white dark">
      <Header />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        
        {/* Left Column: Identity & Clearance */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="p-8 border border-foreground/5 bg-background relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
             <div className="absolute top-0 left-0 w-full h-1 bg-enark-red" />
             <div className="flex items-center gap-4 mb-8 border-b border-foreground/5 pb-6">
               <Shield size={24} className="text-enark-red" />
               <div>
                 <h2 className="text-sm font-black tracking-[0.3em] uppercase">OPERATIVE_PROFILE</h2>
                 <p className="mono text-xs md:text-[10px] text-foreground/60 tracking-widest">{user?.email}</p>
               </div>
             </div>
             
             <div className="space-y-6">
               <div>
                 <p className="text-xs md:text-[10px] uppercase tracking-[0.2em] text-foreground/60 mb-2">Clearance_Level</p>
                 <div className="flex items-baseline gap-2">
                   <span className={`text-4xl font-black ${clearance.color}`}>{clearance.level}</span>
                   <span className="text-xs font-black uppercase tracking-widest text-foreground">{clearance.rank}</span>
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-[10px] mono uppercase text-foreground/60">
                   <span>Capital_Deployed</span>
                   <span>₹{totalSpent.toLocaleString()}</span>
                 </div>
                 <div className="h-2 w-full bg-foreground/5 overflow-hidden">
                   <div className={`h-full transition-all duration-1000 ${clearance.bar}`} style={{ width: clearance.level === '01' ? '33%' : clearance.level === '02' ? '66%' : '100%' }} />
                 </div>
               </div>

               {/* Asset Registry Section */}
               <div className="pt-6 border-t border-foreground/5 mt-6 space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 flex items-center gap-2">
                      <Activity size={12} className="text-enark-red" /> ASSET_REGISTRY
                    </h3>
                    {isEditingDimensions ? (
                      <button 
                        onClick={handleUpdateDimensions}
                        disabled={saving}
                        className="text-[9px] font-black uppercase text-enark-red hover:underline"
                      >
                        {saving ? 'SAVING...' : 'SAVE_CHANGES'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => { playClick(); setIsEditingDimensions(true); }}
                        className="text-[9px] font-black uppercase text-foreground/30 hover:text-foreground"
                      >
                        EDIT_PARAMETERS
                      </button>
                    )}
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'HEIGHT', key: 'height', unit: 'CM' },
                      { label: 'WAIST', key: 'waist', unit: 'IN' },
                      { label: 'AGE', key: 'age', unit: 'YRS' },
                    ].map((dim) => (
                      <div key={dim.key} className="p-3 border border-foreground/5 bg-foreground/[0.02]">
                        <p className="text-[8px] text-foreground/30 font-black uppercase mb-1">{dim.label} ({dim.unit})</p>
                        {isEditingDimensions ? (
                          <input 
                            type="number"
                            value={dimensions[dim.key as keyof typeof dimensions] || ''}
                            onChange={(e) => setDimensions({...dimensions, [dim.key]: e.target.value})}
                            className="w-full bg-transparent border-none outline-none text-xs font-black p-0 uppercase"
                          />
                        ) : (
                          <p className="text-xs font-black uppercase">{dimensions[dim.key as keyof typeof dimensions] || '---'}</p>
                        )}
                      </div>
                    ))}
                    <div className="col-span-3 p-3 bg-foreground/5 border border-foreground/5">
                       <p className="text-[7px] uppercase tracking-widest text-foreground/30 leading-relaxed">
                          Note: This information is used exclusively for size identity and perfect asset matching across the Enark ecosystem.
                       </p>
                    </div>
                 </div>
               </div>

               {clearance.level !== '03' && (
                 <div className="p-4 border border-enark-red/10 bg-enark-red/5 flex items-start gap-3 mt-8">
                   <AlertTriangle size={14} className="text-enark-red shrink-0 mt-0.5" />
                   <p className="text-[9px] uppercase tracking-widest text-foreground/40 leading-relaxed">
                     Deploy more capital to reach the next clearance tier. Higher tiers unlock access to secured vault protocols and restricted drops.
                   </p>
                 </div>
               )}

               <div className="pt-6 border-t border-foreground/5 mt-6 space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Clearance_Benefits</h3>
                 
                 <div className="space-y-3">
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '01' ? 'border-foreground/20 bg-foreground/5 text-foreground' : 'border-foreground/5 text-foreground/30'}`}>
                     <span>01_NOVICE</span>
                     <span className="opacity-50 text-[9px]">Standard Logistics</span>
                   </div>
                   
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '02' ? 'border-blue-600/30 bg-blue-600/5 text-blue-600' : 'border-foreground/5 text-foreground/30'}`}>
                     <span>02_OPERATIVE</span>
                     <span className="opacity-50 text-[9px]">Priority Support // Early Access</span>
                   </div>
                   
                   <div className={`p-3 border text-[10px] uppercase tracking-widest flex items-center justify-between ${clearance.level === '03' ? 'border-green-600/30 bg-green-600/5 text-green-600' : 'border-foreground/5 text-foreground/30'}`}>
                     <span>03_ELITE</span>
                     <span className="opacity-50 text-[9px]">Vault Access // Classified Drops</span>
                   </div>
                 </div>
               </div>

               {offers.length > 0 && (
                 <div className="pt-6 border-t border-foreground/5 mt-6 space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-enark-red flex items-center gap-2">
                     <Tag size={12} /> ACTIVE_UPLINK_OFFERS
                   </h3>
                   <div className="space-y-3">
                     {offers.map((offer) => (
                       <div key={offer.id} className="p-4 border border-enark-red/10 bg-enark-red/5 flex flex-col gap-2">
                         <div className="flex justify-between items-center">
                           <span className="text-[10px] uppercase tracking-widest text-foreground/40">DISCOUNT_OVERRIDE</span>
                           <span className="text-sm font-black text-foreground">{offer.discount_percentage}% OFF</span>
                         </div>
                         <div className="flex justify-between items-end mt-2">
                           <div>
                             <p className="text-[8px] uppercase tracking-widest text-foreground/40 mb-1">Access_Code</p>
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
            className="w-full flex items-center justify-center gap-3 p-6 border border-foreground/5 bg-background text-xs font-black tracking-[0.3em] uppercase hover:bg-enark-red hover:text-white transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
          >
            <LogOut size={16} /> TERMINATE_UPLINK
          </button>

        </div>

        {/* Right Column: Logistics Tracking */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="flex items-center gap-4 mb-6">
             <Database size={20} className="text-foreground/30" />
             <h2 className="text-lg font-black tracking-tighter-x uppercase">LOGISTICS_MANIFEST</h2>
          </div>

          {orders.length === 0 ? (
            <div className="h-64 border border-dashed border-foreground/10 flex flex-col items-center justify-center space-y-4 bg-foreground/[0.02]">
               <Package size={32} className="text-foreground/10" />
               <p className="text-xs uppercase tracking-[0.3em] text-foreground/20 font-black">NO_ASSETS_ACQUIRED_YET</p>
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
                  className="p-6 border border-foreground/5 bg-background hover:border-foreground/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 ${
                        order.status === 'paid' ? 'bg-green-600/10 text-green-600 border border-green-600/10' : 
                        order.status === 'pending' ? 'bg-yellow-600/10 text-yellow-600 border border-yellow-600/10' : 
                        'bg-foreground/5 text-foreground/40 border border-foreground/5'
                      }`}>
                        {order.status === 'paid' ? 'UPLINK_SECURED' : order.status}
                      </span>
                      <span className="mono text-[10px] text-foreground/30">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-1 text-foreground">TRANSACTION_ID: {order.razorpay_order_id || order.id.split('-')[0]}</p>
                      <p className="mono text-[10px] text-foreground/40 max-w-sm truncate">
                        {order.shipping_address?.full_address || (typeof order.shipping_address === 'string' ? order.shipping_address : JSON.stringify(order.shipping_address))}
                      </p>
                    </div>
                  </div>
                  
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t border-foreground/5 pt-4 md:border-0 md:pt-0">
                      <p className="text-lg font-black mono text-enark-red">₹{order.total_amount.toLocaleString()}</p>
                      <div className="flex flex-col gap-2 items-end">
                        <button 
                          onClick={() => { playClick(); router.push(`/order/${order.id}`); }}
                          className="text-[9px] uppercase font-bold tracking-widest text-foreground hover:text-enark-red flex items-center gap-1 transition-colors border border-foreground/10 px-3 py-1 hover:border-enark-red/30"
                        >
                           MANIFEST_DETAILS <Package size={10} />
                        </button>
                        <button 
                          onClick={() => { playClick(); router.push(`/track?id=${order.id}`); }}
                          className="text-[9px] uppercase font-bold tracking-widest text-foreground/40 hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                           TRACK_ASSET <ExternalLink size={10} />
                        </button>
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Protocol Transparency Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-24 p-8 border border-foreground/5 bg-foreground/[0.02] rounded-3xl"
          >
            <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="max-w-md space-y-4">
                <div className="flex items-center gap-3 text-enark-red">
                  <Shield size={16} />
                  <h3 className="text-sm font-black uppercase tracking-widest">Trust_Protocol_v2.1</h3>
                </div>
                <p className="text-xs text-foreground/50 leading-relaxed uppercase">
                  ENARK SYSTEMS OPERATES AS A FULLY REGISTERED LEGAL ENTITY. ALL TRANSACTIONS ARE PROCESSED THROUGH PCI-DSS COMPLIANT NODES. YOUR DATA IS ENCRYPTED AND NEVER SOLD TO THIRD-PARTY AGGREGATORS.
                </p>
              </div>
              <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span>GSTIN_VERIFIED: 29ABCDE1234F1Z5</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span>SSL_ENCRYPTION: ACTIVE (256-BIT)</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span>ENTITY_STATUS: LEGALLY_REGISTERED</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
