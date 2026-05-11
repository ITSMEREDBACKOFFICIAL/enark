'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Tag, Send, AlertTriangle, RefreshCw, X, Gift } from 'lucide-react';
import { logSystemAction } from '@/lib/audit';

export default function OfferManager() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [offerType, setOfferType] = useState<'targeted' | 'global'>('targeted');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(10);
  const [isSingleUse, setIsSingleUse] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View State
  const [viewType, setViewType] = useState<'targeted' | 'global'>('global');

  useEffect(() => {
    fetchOffers();

    const channel = supabase
      .channel('offers_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operative_offers' }, () => {
        fetchOffers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOffers() {
    setLoading(true);
    const { data } = await supabase
      .from('operative_offers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOffers(data);
    setLoading(false);
  }

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: Email is only required for targeted offers
    const isEmailValid = offerType === 'global' || (offerType === 'targeted' && email);
    if (!isEmailValid || !code || discount <= 0) {
      alert('DISPATCH_FAILURE: Incomplete parameters for uplink.');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase
      .from('operative_offers')
      .insert([
        { 
          code: code.toUpperCase(), 
          assigned_email: offerType === 'global' ? 'GLOBAL' : email.toLowerCase(), 
          discount_percentage: discount,
          is_active: true,
          used: false,
          is_single_use: isSingleUse
        }
      ]);
      
    if (!error) {
      await logSystemAction('OFFER_DISPATCHED', offerType === 'global' ? 'GLOBAL' : email, { code, discount });
      alert(`DISPATCH_SUCCESS: Code [${code.toUpperCase()}] is now live.`);
      setEmail('');
      setCode('');
      setDiscount(10);
      setIsSingleUse(true);
      fetchOffers();
    } else {
      alert('DISPATCH_ERROR: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const revokeOffer = async (id: string) => {
    const { error } = await supabase.from('operative_offers').update({ is_active: false }).eq('id', id);
    if (!error) {
      await logSystemAction('OFFER_REVOKED', id.slice(0, 8));
      fetchOffers();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Creation Node */}
      <div className="p-6 md:p-8 border border-white/10 bg-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <Gift size={24} className="text-enark-red flex-shrink-0" />
          <div>
             <h2 className="text-base md:text-lg font-black tracking-widest uppercase">DISPATCH_OFFER_PROTOCOL</h2>
             <p className="text-[10px] md:text-xs text-white/40 font-mono">Assign targeted encrypted discount codes to specific operatives.</p>
          </div>
        </div>

        <form onSubmit={handleDispatch} className="flex flex-col gap-6">
          <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto hide-scrollbar">
            <button 
              type="button"
              onClick={() => setOfferType('targeted')}
              className={`flex-shrink-0 text-[10px] md:text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${offerType === 'targeted' ? 'border-enark-red text-enark-red' : 'border-transparent text-white/40'}`}
            >
              TARGETED_OPERATIVE
            </button>
            <button 
              type="button"
              onClick={() => setOfferType('global')}
              className={`flex-shrink-0 text-[10px] md:text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${offerType === 'global' ? 'border-enark-red text-enark-red' : 'border-transparent text-white/40'}`}
            >
              GLOBAL_OVERRIDE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Target_Operative_Email</label>
              {offerType === 'targeted' ? (
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operative@domain.com"
                  className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-sm font-mono outline-none focus:border-enark-red transition-all"
                />
              ) : (
                <div className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-sm font-black uppercase tracking-widest text-white/40">
                  [ALL_OPERATIVES_AUTHORIZED]
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Override_Code</label>
              <input 
                type="text" 
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ELITE20"
                className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-sm font-black outline-none focus:border-enark-red transition-all uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/60">Discount_%</label>
              <input 
                type="number" 
                required
                min={1}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-sm font-mono outline-none focus:border-enark-red transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-white/10 bg-white/5 p-4 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">USAGE_LIMIT</p>
              <p className="text-[9px] text-white/40 uppercase font-mono tracking-widest mt-1">
                {isSingleUse ? 'Offer self-destructs after a single transaction.' : 'Offer remains active indefinitely.'}
              </p>
            </div>
            <div className="flex bg-black border border-white/10 p-1 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => setIsSingleUse(true)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSingleUse ? 'bg-enark-red text-white' : 'text-white/40 hover:text-white'}`}
              >
                SINGLE
              </button>
              <button 
                type="button"
                onClick={() => setIsSingleUse(false)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${!isSingleUse ? 'bg-enark-red text-white' : 'text-white/40 hover:text-white'}`}
              >
                INFINITE
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`p-4 md:p-5 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-enark-red text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(220,38,38,0.2)]'}`}
          >
            {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
            {isSubmitting ? 'ENCRYPTING...' : 'DISPATCH_OFFER'}
          </button>
        </form>
      </div>

      {/* Active Manifest */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
            <Tag size={16} className="text-white/60" /> ACTIVE_OFFER_MANIFEST
          </h3>
          <div className="flex bg-white/5 border border-white/10 p-1 w-full sm:w-auto">
            <button 
              onClick={() => setViewType('global')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'global' ? 'bg-enark-red text-white' : 'text-white/40 hover:text-white'}`}
            >
              GLOBAL
            </button>
            <button 
              onClick={() => setViewType('targeted')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'targeted' ? 'bg-enark-red text-white' : 'text-white/40 hover:text-white'}`}
            >
              TARGETED
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-32 flex items-center justify-center border border-dashed border-white/10">
             <RefreshCw size={24} className="text-white/20 animate-spin" />
          </div>
        ) : offers.filter(o => viewType === 'global' ? o.assigned_email === 'GLOBAL' : o.assigned_email !== 'GLOBAL').length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/10 bg-black/50">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">NO_ACTIVE_OFFERS_DETECTED</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {offers.filter(o => viewType === 'global' ? o.assigned_email === 'GLOBAL' : o.assigned_email !== 'GLOBAL').map((offer) => (
              <motion.div 
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 md:p-6 border relative overflow-hidden flex flex-col justify-between ${offer.used || !offer.is_active ? 'border-white/10 bg-white/5 opacity-50' : 'border-enark-red/30 bg-enark-red/5'}`}
              >
                {(!offer.is_active || offer.used) && (
                  <div className="absolute top-4 right-4 border border-white/20 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white/40">
                    {offer.used ? 'BURNED' : 'REVOKED'}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1">Assigned_Operative</p>
                    <p className="font-mono text-[11px] md:text-xs truncate" title={offer.assigned_email}>
                      {offer.assigned_email === 'GLOBAL' ? '[ALL_OPERATIVES_AUTHORIZED]' : offer.assigned_email}
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1 flex items-center gap-2">
                        Access_Code
                        <span className={`px-1.5 py-0.5 text-[8px] border ${offer.is_single_use ? 'border-orange-500/50 text-orange-500' : 'border-blue-500/50 text-blue-500'}`}>
                          {offer.is_single_use ? '1-USE' : 'MULTI'}
                        </span>
                      </p>
                      <p className="font-black text-lg md:text-xl tracking-widest text-enark-red">{offer.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-widest text-white/60 mb-1">Discount</p>
                      <p className="font-mono text-base md:text-lg font-bold">{offer.discount_percentage}%</p>
                    </div>
                  </div>
                </div>

                {offer.is_active && !offer.used && (
                  <button 
                    onClick={() => revokeOffer(offer.id)}
                    className="mt-6 w-full py-3 border border-enark-red/50 text-enark-red text-[10px] font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <X size={12} /> REVOKE_ACCESS
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
