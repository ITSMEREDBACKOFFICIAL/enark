'use client';

import { useState } from 'react';
import { Truck, MapPin, Package, Clock, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShippingPage() {
  const [isSimple, setIsSimple] = useState(false);

  const sections = [
    { 
      id: '01', 
      title: 'DISPATCH_PROTOCOL', 
      content: 'ALL ASSETS ARE DISPATCHED FROM OUR CENTRAL LOGISTICS HUB WITHIN 24-48 OPERATIONAL HOURS OF UPLINK CONFIRMATION. ORDERS PLACED ON SUNDAYS OR PUBLIC HOLIDAYS ARE QUEUED FOR THE NEXT BUSINESS CYCLE.',
      simple: 'We ship your items within 1-2 days of your order. We dont ship on Sundays or holidays.' 
    },
    { 
      id: '02', 
      title: 'LOGISTICS_PARTNERS', 
      content: 'ENARK UTILIZES TIER-1 COURIER NETWORKS INCLUDING BLUEDART, DELHIVERY, AND SHADOWFAX TO ENSURE MAXIMUM SECURITY AND VELOCITY. PARTNER SELECTION IS AUTOMATED BASED ON OPERATIVE DESTINATION.',
      simple: 'We use the best couriers like Bluedart and Delhivery to get your order to you fast.' 
    },
    { 
      id: '03', 
      title: 'DELIVERY_ESTIMATES', 
      content: 'METRO SECTORS: 3-5 BUSINESS DAYS. TIER-2/3 SECTORS: 5-8 BUSINESS DAYS. REMOTE ZONES: UP TO 12 BUSINESS DAYS. DELAYS DUE TO ATMOSPHERIC CONDITIONS OR SECONAL LOGISTICS SURGES MAY OCCUR.',
      simple: 'Metros take 3-5 days. Other areas take about a week. Sometimes weather or holidays can slow things down.' 
    },
    { 
      id: '04', 
      title: 'FREE_SHIPPING_THRESHOLD', 
      content: 'OPERATIONAL UPLINKS EXCEEDING ₹5,000 ARE ELIGIBLE FOR COMPLIMENTARY AIR-FREIGHT LOGISTICS. ORDERS BELOW THIS THRESHOLD INCUR A FLAT SHIPPING SUBSIDY OF ₹150.',
      simple: 'Free shipping on orders over ₹5,000. Otherwise, its a flat ₹150 fee.' 
    },
    { 
      id: '05', 
      title: 'TRACKING_SYSTEM', 
      content: 'UPON DISPATCH, A UNIQUE TRACKING ID IS BROADCAST TO THE OPERATIVE VIA REGISTERED EMAIL AND SMS. THE UPLINK STATUS CAN BE MONITORED IN REAL-TIME VIA OUR PARTNER NODES.',
      simple: 'Well email and text you a tracking link as soon as your package leaves our warehouse.' 
    },
    { 
      id: '06', 
      title: 'TRANSIT_INSURANCE', 
      content: 'ALL SHIPMENTS ARE INSURED AGAINST THEFT OR TOTAL LOSS DURING TRANSIT. RISK TRANSFERS TO THE OPERATIVE UPON SUCCESSFUL DELIVERY CONFIRMATION (POD).',
      simple: 'Your package is insured until it reaches your door. Once delivered, its your responsibility.' 
    },
    { 
      id: '07', 
      title: 'DAMAGE_MANIFEST', 
      content: 'OPERATIVES MUST INSPECT THE ASSET PACKAGING ON ARRIVAL. IF THE SEAL IS BREACHED, REFUSE DELIVERY. DAMAGES MUST BE REPORTED WITHIN 24 HOURS WITH PHOTO EVIDENCE.',
      simple: 'Check your package before accepting it. If the seal is broken, dont take it. Report damages to us within 24 hours.' 
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red">
      <Header />

      
      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Page Header */}
          <div className="space-y-8 mb-24">
            <div className="flex justify-between items-end border-b border-foreground/10 pb-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-enark-red">
                    <Truck size={18} />
                    <span className="text-xs font-black uppercase tracking-[0.5em]">LOGISTICS_MANIFEST</span>
                 </div>
                 <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic text-foreground">
                   SHIPPING<br />POLICY
                 </h1>
              </div>
              <button 
                onClick={() => setIsSimple(!isSimple)}
                className={`px-8 py-4 border font-black uppercase tracking-widest text-xs transition-all ${isSimple ? 'bg-enark-red border-enark-red text-white' : 'border-foreground/10 hover:border-foreground hover:bg-foreground hover:text-background'}`}
              >
                {isSimple ? 'ENCRYPT_DATA' : 'DECRYPT_DATA'}
              </button>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {sections.map((section) => (
                <div key={section.id} className="p-8 border border-foreground/5 bg-foreground/[0.02] space-y-6 group hover:border-enark-red transition-all">
                   <div className="flex items-center justify-between">
                      <h2 className="text-xs font-black uppercase tracking-widest text-foreground/40">{section.title}</h2>
                      <span className="text-[10px] font-mono text-enark-red/50">NODE_{section.id}</span>
                   </div>
                   <AnimatePresence mode="wait">
                      <motion.p 
                        key={isSimple ? 's' : 'c'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs leading-relaxed uppercase tracking-wider ${isSimple ? 'text-enark-red font-bold' : 'text-foreground/60'}`}
                      >
                        {isSimple ? section.simple : section.content}
                      </motion.p>
                   </AnimatePresence>
                </div>
             ))}
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-12 p-8 bg-enark-red/5 border border-enark-red/10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
             <div className="space-y-2">
                <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Processing</p>
                <p className="text-lg font-black italic text-foreground">24-48HR</p>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Free_Over</p>
                <p className="text-lg font-black italic text-foreground">₹5,000</p>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] text-foreground/40 uppercase tracking-widest">Logistics</p>
                <p className="text-lg font-black italic text-foreground">TIER_1</p>
             </div>
             <div className="space-y-2">
                <p className="text-[9px] text-foreground/40 uppercase tracking-widest">In_Transit</p>
                <p className="text-lg font-black italic text-foreground">INSURED</p>
             </div>
          </div>

          {/* Navigation Matrix */}
          <div className="mt-32 pt-12 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-12">
             <Link href="/privacy" className="group flex flex-col items-start gap-2">
                <span className="text-[10px] text-foreground/60 uppercase tracking-widest flex items-center gap-2 group-hover:text-enark-red transition-colors">
                   <ArrowLeft size={10} /> PREVIOUS_PROTOCOL
                </span>
                <span className="text-sm font-black uppercase group-hover:text-enark-red transition-all text-foreground">PRIVACY_POLICY</span>
             </Link>

             <Link href="/" className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 hover:text-foreground transition-all">
                RETURN_TO_CENTRAL
             </Link>

             <Link href="/terms" className="group flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] text-foreground/60 uppercase tracking-widest flex items-center gap-2 group-hover:text-enark-red transition-colors">
                   NEXT_PROTOCOL <ArrowRight size={10} />
                </span>
                <span className="text-sm font-black uppercase group-hover:text-enark-red transition-all text-foreground">TERMS_OF_SERVICE</span>
             </Link>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
