'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '@/store/useCart';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Truck, Database, FileText, CheckCircle2, Lock, ChevronDown, Tag, RefreshCw, AlertTriangle, CreditCard, Banknote, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/hooks/useAudio';
import Link from 'next/link';

declare global {
  interface Window {
    Cashfree: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { playClick, playSuccess, playError, playHum } = useAudio();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [cashfree, setCashfree] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [config, setConfig] = useState({ freeShippingThreshold: 5000, codEnabled: true });
  const [globalOffers, setGlobalOffers] = useState<any[]>([]);
  const [dispatchId] = useState(() => `ENRK-${Math.random().toString(36).toUpperCase().slice(2, 6)}-${Date.now().toString().slice(-4)}`);

  const total = getTotal();
  const discountedTotal = appliedDiscount > 0 ? total * (1 - appliedDiscount / 100) : total;
  const shippingCost = discountedTotal >= config.freeShippingThreshold ? 0 : 150;
  const finalTotal = discountedTotal + shippingCost;
  const router = useRouter();

  // Abandoned cart tracking
  const abandonedCartRef = useRef<string | null>(null);

  useEffect(() => {
    fetchConfig();
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      setCashfree(new window.Cashfree({
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
      }));
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  async function fetchConfig() {
    const { data } = await supabase.from('app_config').select('*').eq('id', 'main').single();
    if (data) {
      setConfig({
        freeShippingThreshold: data.free_shipping_threshold || 5000,
        codEnabled: data.cod_enabled !== undefined ? data.cod_enabled : true
      });
    }

    // Fetch Global Offers
    const { data: offers } = await supabase
      .from('operative_offers')
      .select('*')
      .eq('assigned_email', 'GLOBAL')
      .eq('is_active', true)
      .limit(5);
    if (offers) setGlobalOffers(offers);
  }

  // Save abandoned cart when email is entered and cart has items
  useEffect(() => {
    if (!email || items.length === 0) return;
    const t = setTimeout(async () => {
      if (abandonedCartRef.current) return; // already saved
      const { data } = await supabase.from('abandoned_carts').insert({
        email: email.toLowerCase(),
        cart_items: items,
        total_amount: getTotal(),
        status: 'abandoned',
        dispatch_id: dispatchId
      }).select('id').single();
      if (data?.id) abandonedCartRef.current = data.id;
    }, 5000); // 5 sec delay to ensure they are actually "in" the checkout
    return () => clearTimeout(t);
  }, [email, items, getTotal, dispatchId]);

  const handleValidatePromo = async () => {
    if (!promoCode || !email) {
      setPromoError('VALID_EMAIL_AND_CODE_REQUIRED');
      playError();
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    
    try {
      const { data: matches, error } = await supabase
        .from('operative_offers')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .order('created_at', { ascending: false });

      if (error || !matches || matches.length === 0) {
        setPromoError("INVALID_ENCRYPTION_KEY");
        playError();
        return;
      }

      const activeOffer = matches.find(o => o.is_active && !(o.used && o.is_single_use));

      if (!activeOffer) {
        setPromoError("CODE_REVOKED_OR_BURNED");
        playError();
      } else if (activeOffer.assigned_email !== 'GLOBAL' && activeOffer.assigned_email !== email.toLowerCase()) {
        setPromoError("UNAUTHORIZED_USER_FOR_CODE");
        playError();
      } else {
        setAppliedDiscount(activeOffer.discount_percentage);
        playSuccess();
      }
    } catch (err) {
      setPromoError("SYSTEM_ERROR");
      playError();
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    
    if (!email || !address || !pincode) {
      alert("PLEASE COMPLETE ALL REQUIRED LOGISTICS FIELDS.");
      playError();
      return;
    }

    if (paymentMethod === 'ONLINE' && !cashfree) {
      alert("CASHFREE_SDK_NOT_INITIALIZED.");
      playError();
      return;
    }

    setIsProcessing(true);
    playHum();

    try {
      const fullAddress = `${address}, PIN: ${pincode}`;
      
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email,
          address: fullAddress,
          idempotencyKey: crypto.randomUUID(),
          appliedPromoCode: appliedDiscount > 0 ? promoCode : null,
          amount: finalTotal,
          paymentMethod,
          dispatchId
        }),
      });

      const responseText = await res.text();
      let orderData;
      try {
        orderData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`SERVER_CRASH: ${responseText.slice(0, 100)}...`);
      }

      if (!res.ok) {
        throw new Error(`${orderData.error || 'CHECKOUT_FAILURE'}: ${orderData.details || ''}`);
      }

      if (paymentMethod === 'COD') {
        if (orderData.dbOrderId) {
          playSuccess();
          clearCart();
          router.push(`/success?id=${orderData.orderId}`);
        } else {
          throw new Error("Failed to secure COD uplink.");
        }
        return;
      }

      if (!orderData.paymentSessionId) {
        throw new Error(orderData.error || "Failed to initialize ENARK_PROTOCOL.");
      }

      const checkoutOptions = {
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self", 
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          alert(result.error.message);
          playError();
          setIsProcessing(false);
        }
      });

    } catch (err: any) {
      alert(`SYSTEM_ERROR: ${err.message || 'UNABLE TO ESTABLISH UPLINK.'}`);
      playError();
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 space-y-8 mono">
         <Database size={48} className="text-enark-red animate-pulse" />
          <h1 className="text-3xl font-black uppercase tracking-tighter-x">Cart is empty</h1>
          <p className="text-xs text-foreground/40 tracking-widest uppercase">Your cart is currently empty.</p>
          <button onClick={() => router.push('/shop')} className="px-8 py-4 bg-foreground text-background font-black uppercase tracking-[0.2em] text-xs hover:bg-enark-red transition-all">
            Return to Shop
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-enark-red selection:text-white pb-32 dark relative mono">
      
      <div className="absolute top-0 left-0 w-full p-6 border-b border-foreground/5 flex justify-between items-center bg-background z-50">
         <h1 className="text-xl font-black tracking-tighter-x uppercase">ENARK<span className="text-enark-red">.</span></h1>
         <div className="flex items-center gap-2">
            <Lock size={12} className="text-green-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hidden md:inline">Secure Checkout</span>
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 border border-foreground/5 mt-12 bg-background shadow-[0_40px_100px_rgba(0,0,0,0.03)]">
        
        <div className="lg:col-span-7 border-r border-foreground/5 relative p-8 md:p-16">
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePayment} className="space-y-24">
            
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
                <div className="flex items-center gap-4">
                  <span className="bg-foreground text-background w-6 h-6 flex items-center justify-center text-xs font-black">1</span>
                  <h2 className="text-2xl font-black tracking-tighter-x uppercase">Contact Information</h2>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-foreground/40 uppercase tracking-widest">Asset_Dispatch_ID</p>
                  <p className="text-[10px] font-black text-enark-red uppercase tracking-widest">{dispatchId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="mono text-xs text-foreground/40 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com" 
                  className="w-full bg-white border border-foreground/10 p-6 text-sm font-black outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20" 
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-foreground/5 pb-4">
                <span className="bg-foreground text-background w-6 h-6 flex items-center justify-center text-xs font-black">2</span>
                <h2 className="text-2xl font-black tracking-tighter-x uppercase">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                   <label className="mono text-xs text-foreground/40 uppercase">Address</label>
                   <textarea 
                     required
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="Apartment, suite, etc." 
                     className="w-full bg-white border border-foreground/10 p-6 text-sm font-black outline-none focus:border-enark-red transition-all h-24 resize-none text-black placeholder:text-black/20" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="mono text-xs text-foreground/40 uppercase">Pincode</label>
                   <input 
                     type="text" 
                     required
                     value={pincode}
                     onChange={(e) => setPincode(e.target.value)}
                     placeholder="600001" 
                     className="w-full bg-white border border-foreground/10 p-6 text-sm font-black outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20" 
                   />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-foreground/5 pb-4">
                <span className="bg-foreground text-background w-6 h-6 flex items-center justify-center text-xs font-black">3</span>
                <h2 className="text-2xl font-black tracking-tighter-x uppercase">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('ONLINE'); playClick(); }}
                  className={`p-6 border flex flex-col gap-4 text-left transition-all relative overflow-hidden group ${paymentMethod === 'ONLINE' ? 'border-enark-red bg-enark-red/[0.03]' : 'border-foreground/10 hover:border-foreground/20'}`}
                >
                  <CreditCard size={20} className={paymentMethod === 'ONLINE' ? 'text-enark-red' : 'text-foreground/40'} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Secure Online Payment</p>
                    <p className="text-[10px] text-foreground/40 uppercase mt-1">Cards, UPI, Netbanking</p>
                  </div>
                  {paymentMethod === 'ONLINE' && <motion.div layoutId="method-active" className="absolute top-2 right-2"><CheckCircle2 size={14} className="text-enark-red" /></motion.div>}
                </button>

                {config.codEnabled && (
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('COD'); playClick(); }}
                    className={`p-6 border flex flex-col gap-4 text-left transition-all relative overflow-hidden group ${paymentMethod === 'COD' ? 'border-enark-red bg-enark-red/[0.03]' : 'border-foreground/10 hover:border-foreground/20'}`}
                  >
                    <Banknote size={20} className={paymentMethod === 'COD' ? 'text-enark-red' : 'text-foreground/40'} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest">Cash on Delivery</p>
                      <p className="text-[10px] text-foreground/40 uppercase mt-1">Pay during asset arrival</p>
                    </div>
                    {paymentMethod === 'COD' && <motion.div layoutId="method-active" className="absolute top-2 right-2"><CheckCircle2 size={14} className="text-enark-red" /></motion.div>}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full py-8 font-black text-xl tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isProcessing ? 'bg-foreground/5 text-foreground/20 cursor-not-allowed border border-foreground/5' : 'bg-foreground text-background hover:bg-enark-red hover:text-white'}`}
              >
                {isProcessing ? (
                  <span className="animate-pulse flex items-center gap-3"><RefreshCw className="animate-spin" size={20} /> SYNCHRONIZING...</span>
                ) : (
                  <>
                    <Zap size={24} className="animate-pulse" />
                    {paymentMethod === 'COD' ? 'CONFIRM ORDER' : 'AUTHORIZE PAYMENT'}
                  </>
                )}
              </button>
              <p className="text-[11px] md:text-[9px] text-center text-foreground/50 uppercase tracking-[0.2em] md:tracking-[0.4em] mt-6">
                By authorizing, you agree to the <Link href="/terms" className="text-foreground/60 hover:text-enark-red underline transition-colors">ENARK_OPERATIONAL_PROTOCOLS</Link>.
              </p>
            </div>
            
          </motion.form>
        </div>

        <div className="lg:col-span-5 bg-background p-8 md:p-12 border-l border-foreground/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-8 border-b border-foreground/5 pb-6">
              <Database size={16} className="text-foreground/30" />
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase">Order Summary</h3>
            </div>
            
            <div className="space-y-4 mb-8 max-h-[30vh] overflow-y-auto momentum-scroll pr-4 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 group">
                  <div className="w-12 h-16 bg-foreground/5 border border-foreground/10 flex-shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-xs font-black uppercase text-foreground leading-tight">{item.name}</h4>
                    <p className="text-[11px] text-foreground/60 uppercase tracking-widest mt-1">QTY: {item.quantity} // {item.size}</p>
                    <p className="text-xs font-black text-enark-red mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-foreground/5 pt-6 pb-2 space-y-4">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={promoCode}
                   onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                   placeholder="OFFER_CODE"
                   className="flex-1 bg-white border border-foreground/10 p-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-enark-red transition-all text-black placeholder:text-black/20"
                   disabled={appliedDiscount > 0}
                 />
                  <button 
                   onClick={handleValidatePromo}
                   disabled={isValidatingPromo || appliedDiscount > 0}
                   className="px-6 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all disabled:opacity-50"
                 >
                   {isValidatingPromo ? <RefreshCw className="animate-spin" size={12} /> : appliedDiscount > 0 ? 'ACCEPTED' : 'VALIDATE'}
                 </button>
               </div>

               {/* Global Offers Display */}
               {globalOffers.length > 0 && appliedDiscount === 0 && (
                 <div className="mt-4 space-y-2">
                   <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest flex items-center gap-2">
                     <Tag size={10} /> AVAILABLE_DISPATCHES
                   </p>
                   <div className="flex flex-wrap gap-2">
                     {globalOffers.map((offer) => (
                       <button
                         key={offer.id}
                         onClick={() => { setPromoCode(offer.code); playClick(); }}
                         className="px-3 py-2 border border-foreground/5 bg-foreground/5 text-[9px] font-bold uppercase tracking-widest hover:border-enark-red hover:text-enark-red transition-all flex items-center gap-2"
                       >
                         {offer.code} <span className="opacity-40">{offer.discount_percentage}%</span>
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {promoError && (
                 <p className="text-[8px] text-enark-red uppercase tracking-widest flex items-center gap-2 animate-pulse">
                   <AlertTriangle size={10} /> {promoError}
                 </p>
               )}
            </div>

            <div className="space-y-3 border-t border-foreground/5 pt-6">
                <div className="flex justify-between items-center text-foreground/60 text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600 text-xs uppercase tracking-widest">
                    <span>Discount (-{appliedDiscount}%)</span>
                    <span>-₹{(total - discountedTotal).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-foreground/60 text-xs uppercase tracking-widest">
                  <span>Logistics</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between items-end border-t border-foreground/5 pt-4">
                  <span className="text-xs uppercase tracking-widest text-foreground/60">Total</span>
                  <h3 className="text-3xl font-black text-foreground italic">₹{finalTotal.toLocaleString()}</h3>
                </div>
            </div>
          </div>

          <div className="mt-12 p-4 border border-foreground/5 bg-foreground/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={14} className="text-green-600" />
              <span className="text-[9px] font-black uppercase tracking-widest">ENARK_SECURE_NODE</span>
            </div>
            <p className="text-[8px] text-foreground/40 uppercase leading-relaxed tracking-wider">
              YOUR TRANSACTION IS SECURED VIA 256-BIT ENCRYPTION PROTOCOLS. TAX-COMPLIANT INVOICE WILL BE DISPATCHED AUTOMATICALLY.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
