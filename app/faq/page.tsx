'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Zap, ShieldCheck, Truck, RotateCcw, Languages } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecentlyViewed from '@/components/product/RecentlyViewed';

const faqs = [
  {
    category: 'LOGISTICS_&_SHIPPING',
    icon: Truck,
    questions: [
      {
        q: 'WHERE DO ASSETS DISPATCH FROM?',
        a: 'ALL ENARK ASSETS ARE DISPATCHED FROM OUR PRIMARY HUB: INDIA_NODE_01. WE UTILIZE SECURE, ENCRYPTED LOGISTICS CHANNELS FOR GLOBAL DISTRIBUTION.',
        simple: 'We ship everything from our main warehouse in India using safe and fast couriers.'
      },
      {
        q: 'WHAT IS THE ESTIMATED UPLINK TIME?',
        a: 'DOMESTIC SHIPMENTS (INDIA) TYPICALLY ARRIVE WITHIN 3-5 BUSINESS DAYS. INTERNATIONAL TRANSFERS MAY TAKE 7-12 DAYS DEPENDING ON CUSTOMS PROTOCOLS.',
        simple: 'If you are in India, you get it in 3-5 days. If you are abroad, it takes about a week or two.'
      }
    ]
  },
  {
    category: 'PRODUCT_ARCHITECTURE',
    icon: Zap,
    questions: [
      {
        q: 'WHAT MATERIALS ARE UTILIZED?',
        a: 'WE SPECIALIZE IN HIGH-PERFORMANCE RAW SILK, ORGANIC COTTON (450+ GSM), AND PRECISION TECH-SHELLS. EACH GARMENT IS ARCHITECTED FOR INDUSTRIAL ENVIRONMENTS.',
        simple: 'We use really nice silk, heavy cotton, and technical materials that last a long time.'
      },
      {
        q: 'HOW DO I DECRYPT THE VAULT ITEMS?',
        a: 'VAULT ITEMS ARE LIMITED-RUN ASSETS. ONCE ACQUIRED, A UNIQUE ENCRYPTION KEY IS SENT TO YOUR REGISTERED CONTACT UPLINK TO UNLOCK THE SHIPMENT.',
        simple: 'Rare items are locked. We will text you a code to open the box when it arrives.'
      }
    ]
  },
  {
    category: 'EXCHANGES',
    icon: RotateCcw,
    questions: [
      {
        q: 'CAN I EXCHANGE AN ASSET?',
        a: 'YES. ASSETS CAN BE EXCHANGED WITHIN 7 DAYS OF DEPOSIT, PROVIDED THE SECURITY TAGS AND PACKAGING MANIFEST ARE INTACT. VAULT ITEMS ARE NON-EXCHANGEABLE.',
        simple: 'Yes, you can swap it for a different size within a week, as long as you dont rip the tags off. Rare items cant be swapped.'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isSimple, setIsSimple] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white mono">
      <Header />
      <div className="pt-48 pb-24 px-6 md:px-12 selection:bg-enark-red selection:text-white">
        <div className="max-w-4xl mx-auto space-y-20">
          
          {/* Header & Toggle */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-enark-red">
              <HelpCircle size={20} />
              <span className="text-xs font-black uppercase tracking-[0.5em]">System_Knowledge_Base // FAQ</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter-x leading-none">
                {isSimple ? 'Common_Questions' : 'Frequently_Asked_Questions'}
              </h1>
              <button
                onClick={() => setIsSimple(!isSimple)}
                className={`shrink-0 flex items-center gap-3 px-6 py-4 border transition-all ${isSimple ? 'bg-enark-red border-enark-red' : 'border-white/10 hover:border-white/40'}`}
              >
                <Languages size={16} />
                <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">
                  {isSimple ? 'Re-Encrypt' : 'Decrypt to Plain English'}
                </span>
              </button>
            </div>
          </div>


          {/* Categories */}
          <div className="space-y-16">
            {faqs.map((category) => (
              <div key={category.category} className="space-y-8">
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <category.icon size={16} className="text-enark-red" />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/60">{category.category}</h2>
                </div>

                <div className="divide-y divide-white/5 border border-white/10 bg-[#050505]">
                  {category.questions.map((item) => (
                    <div key={item.q} className="group">
                      <button 
                        onClick={() => setActiveItem(activeItem === item.q ? null : item.q)}
                        className="w-full p-8 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                      >
                        <span className="text-sm font-black uppercase tracking-tighter group-hover:text-enark-red transition-colors">{item.q}</span>
                        {activeItem === item.q ? <Minus size={18} className="text-enark-red" /> : <Plus size={18} className="text-white/60" />}
                      </button>
                      <AnimatePresence mode="wait">
                        {activeItem === item.q && (
                          <motion.div
                            key={isSimple ? 'simple' : 'complex'}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className={`p-8 pt-0 text-xs font-bold uppercase leading-relaxed tracking-widest max-w-2xl italic transition-colors ${isSimple ? 'text-enark-red' : 'text-white/60'}`}>
                              {isSimple ? item.simple : item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Uplink */}
          <div className="pt-20 border-t border-white/10 flex flex-col items-center text-center gap-8">
             <p className="text-xs font-black uppercase tracking-widest text-white/60">Still have unanswered queries?</p>
             <Link href="https://wa.me/910000000000" className="bg-white text-black px-12 py-6 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all">
               Initialize_Direct_Uplink
             </Link>
          </div>
        </div>
      </div>
      <RecentlyViewed />
      <Footer />
    </main>
  );
}
