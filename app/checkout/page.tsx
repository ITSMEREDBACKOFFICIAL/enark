'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/store/useCart';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Shield, Truck, Database, FileText, CheckCircle2, Lock, ChevronDown, Tag, RefreshCw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const total = getTotal();
  const finalTotal = appliedDiscount > 0 ? total * (1 - appliedDiscount / 100) : total;
  const router = useRouter();

  // Abandoned cart tracking
  const abandonedCartRef = useRef<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

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
      }).select('id').single();
      if (data?.id) abandonedCartRef.current = data.id;
    }, 2000);
    return () => clearTimeout(t);
  }, [email, items, getTotal]);

  const handleValidatePromo = async () => {
    if (!promoCode || !email) {
      setPromoError('VALID_EMAIL_AND_CODE_REQUIRED');
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    
    try {
      const { data, error } = await supabase
        .from('operative_offers')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .single();

      if (error || !data) {
        setPromoError("INVALID_ENCRYPTION_KEY");
      } else if (!data.is_active || (data.used && data.is_single_use)) {
        setPromoError("CODE_REVOKED_OR_BURNED");
      } else if (data.assigned_email !== 'GLOBAL' && data.assigned_email !== email.toLowerCase()) {
        setPromoError("UNAUTHORIZED_USER_FOR_CODE");
      } else {
        setAppliedDiscount(data.discount_percentage);
      }
    } catch (err) {
      setPromoError("SYSTEM_ERROR");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !address || !pincode) {
      alert("PLEASE COMPLETE ALL REQUIRED LOGISTICS FIELDS.");
      return;
    }

    setIsProcessing(true);

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
          amount: finalTotal
        }),
      });

      const orderData = await res.json();

      if (!orderData.orderId) {
        throw new Error("Failed to initialize ENARK_PROTOCOL.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ENARK_SYSTEMS',
        description: 'SECURE_ASSET_TRANSFER',
        order_id: orderData.orderId,
        theme: { color: '#000000' },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: orderData.dbOrderId,
              items: items,
              appliedPromoCode: appliedDiscount > 0 ? promoCode : null
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            // Mark abandoned cart as converted
            if (abandonedCartRef.current) {
              await supabase.from('abandoned_carts').update({ status: 'converted' }).eq('id', abandonedCartRef.current);
            }
            clearCart();
            router.push(`/success?id=${orderData.dbOrderId}`);
          } else {
            alert("VERIFICATION FAILED. SECURITY PROTOCOL TRIGGERED.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        },
        prefill: {
          email: email,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert(`TRANSACTION ABORTED: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("SYSTEM_ERROR: UNABLE TO ESTABLISH UPLINK.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-8">
         <Database size={48} className="text-enark-red animate-pulse" />
          <h1 className="text-3xl font-black uppercase tracking-tighter-x">Cart is empty</h1>
          <p className="text-xs text-white/60 tracking-widest uppercase">Your cart is currently empty.</p>
          <button onClick={() => router.push('/shop')} className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-enark-red hover:text-white transition-all">
            Return to Shop
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-20 px-6 selection:bg-enark-red selection:text-white relative">
      
      <div className="absolute top-0 left-0 w-full p-6 border-b border-white/10 flex justify-between items-center bg-black z-50">
         <h1 className="text-xl font-black tracking-tighter-x uppercase">ENARK<span className="text-enark-red">.</span></h1>
         <div className="flex items-center gap-2">
            <Lock size={12} className="text-green-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hidden md:inline">Secure Checkout</span>
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 border border-white/20 mt-12 bg-[#020202]">
        
        <div className="lg:col-span-7 border-r border-white/20 relative p-8 md:p-16">
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handlePayment} className="space-y-24">
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="bg-white text-black w-6 h-6 flex items-center justify-center text-xs font-black">1</span>
                <h2 className="text-2xl font-black tracking-tighter-x uppercase">Contact Information</h2>
              </div>
              <div className="space-y-2">
                <label className="mono text-xs text-white/60 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com" 
                  className="w-full bg-white/5 border border-white/10 p-6 text-sm outline-none focus:border-enark-red transition-all" 
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <span className="bg-white text-black w-6 h-6 flex items-center justify-center text-xs font-black">2</span>
                <h2 className="text-2xl font-black tracking-tighter-x uppercase">Shipping Address</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                   <label className="mono text-xs text-white/60 uppercase">Address</label>
                   <textarea 
                     required
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="Apartment, suite, etc." 
                     className="w-full bg-white/5 border border-white/10 p-6 text-sm outline-none focus:border-enark-red transition-all h-24 resize-none" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="mono text-xs text-white/60 uppercase">Pincode</label>
                   <input 
                     type="text" 
                     required
                     value={pincode}
                     onChange={(e) => setPincode(e.target.value)}
                     placeholder="600001" 
                     className="w-full bg-white/5 border border-white/10 p-6 text-sm outline-none focus:border-enark-red transition-all" 
                   />
                </div>
                <div className="p-6 border border-enark-red bg-enark-red/5 flex items-center gap-4">
                   <Truck size={18} className="text-enark-red shrink-0" />
                   <div>
                     <p className="font-black text-sm uppercase">Express Shipping</p>
                     <p className="mono text-[10px] text-white/60 tracking-widest">48-72 HOURS (FREE)</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit"
                disabled={isProcessing}
                className={`w-full py-8 font-black text-xl tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isProcessing ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/20' : 'bg-enark-red text-white hover:bg-white hover:text-black'}`}
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Shield size={24} />
                    AUTHORIZE ₹{finalTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  </>
                )}
              </button>
            </div>
            
          </motion.form>
        </div>

        <div className="lg:col-span-5 bg-[#050505] p-8 md:p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
              <Database size={20} className="text-white/60" />
              <h3 className="text-xs font-black tracking-[0.4em] uppercase">Order Summary</h3>
            </div>
            
            <div className="space-y-6 mb-12 max-h-[40vh] overflow-y-auto momentum-scroll pr-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-6 group">
                  <div className="w-16 h-24 bg-white/5 border border-white/10 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-xs font-black leading-none mb-2">{item.name}</h4>
                    <p className="mono text-[9px] text-white/60 uppercase tracking-widest">QTY: {item.quantity} // {item.size}</p>
                    <p className="text-xs font-black text-enark-red mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-8 pb-4 space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 flex items-center gap-2 mb-4">
                 <Tag size={12} /> Discount Code
               </h3>
               
               <div className="flex gap-4">
                 <input 
                   type="text" 
                   value={promoCode}
                   onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                   placeholder="Enter code"
                   className="flex-1 bg-black border border-white/10 p-4 text-xs font-black uppercase tracking-widest outline-none focus:border-enark-red transition-all"
                   disabled={appliedDiscount > 0}
                 />
                 <button 
                   type="button"
                   onClick={handleValidatePromo}
                   disabled={isValidatingPromo || appliedDiscount > 0}
                   className={`px-6 py-4 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center min-w-[120px] ${appliedDiscount > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/50' : 'bg-white/5 border border-white/10 hover:bg-white hover:text-black'}`}
                 >
                   {isValidatingPromo ? <RefreshCw className="animate-spin" size={14} /> : appliedDiscount > 0 ? 'ACCEPTED' : 'VALIDATE'}
                 </button>
               </div>
               {promoError && (
                 <p className="text-[9px] text-red-500 uppercase tracking-widest flex items-center gap-2">
                   <AlertTriangle size={10} /> {promoError}
                 </p>
               )}
               {appliedDiscount > 0 && (
                 <div className="p-4 border border-green-500/30 bg-green-500/5 flex justify-between items-center mt-4">
                   <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">DISCOUNT_APPLIED: {promoCode}</span>
                   <span className="text-xs font-black text-green-500">-{appliedDiscount}%</span>
                 </div>
               )}
            </div>

            <div className="space-y-4 border-t border-white/10 pt-8">
              
              <details className="group border border-white/10 bg-white/5 mb-6">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                  VIEW COST ARCHITECTURE
                  <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-4 pt-0 space-y-2 border-t border-white/5 mt-2">
                  <div className="flex justify-between items-center text-white/40">
                    <span className="mono text-[9px] uppercase tracking-widest">Raw_Materials</span>
                    <span className="mono text-[9px]">₹{(total * 0.4).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span className="mono text-[9px] uppercase tracking-widest">Precision_Engineering</span>
                    <span className="mono text-[9px]">₹{(total * 0.3).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span className="mono text-[9px] uppercase tracking-widest">Quality_Assurance</span>
                    <span className="mono text-[9px]">₹{(total * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/40">
                    <span className="mono text-[9px] uppercase tracking-widest">GST_&_Compliance</span>
                    <span className="mono text-[9px]">₹{(total * 0.15).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
                </div>
              </details>
              
              <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <span className="mono text-[10px] uppercase tracking-widest text-white/40">Total</span>
                <div className="text-right">
                  {appliedDiscount > 0 && (
                    <p className="text-sm text-white/40 line-through decoration-enark-red decoration-2 mb-1">₹{total.toLocaleString()}</p>
                  )}
                  <h3 className="text-4xl font-black text-enark-red">₹{finalTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 p-6 border border-white/10 bg-white/5 space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-enark-red border-b border-white/10 pb-4 mb-4">Our Pledge</h4>
              <p className="text-[10px] text-white/60 leading-relaxed uppercase">
                ENARK operates on a strict <strong className="text-white">Zero-Markup Protocol</strong>. We bypass traditional retail algorithms to deliver engineered garments at their true cost. High performance does not require a luxury tax.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={12} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/60 uppercase tracking-widest leading-relaxed">
                  14-Day Defect Exchange Policy.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={12} className="text-green-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-white/60 uppercase tracking-widest leading-relaxed">
                  Tax-compliant invoice dispatched via secure email routing.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] text-white/40 uppercase">ENARK_GSTIN</span>
                <span className="mono text-[9px] text-white font-bold">29ABCDE1234F1Z5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] text-white/40 uppercase">Entity_Registration</span>
                <span className="mono text-[9px] text-white font-bold">ENARK_SYSTEMS_LLP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="mono text-[9px] text-white/40 uppercase">Payment_Gateway</span>
                <span className="mono text-[9px] text-white font-bold text-blue-400">RAZORPAY_SECURE</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
