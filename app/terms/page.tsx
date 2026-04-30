'use client';

import { useState } from 'react';
import { Scale } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecentlyViewed from '@/components/product/RecentlyViewed';

export default function TermsPage() {
  const [isSimple, setIsSimple] = useState(false);

  const sections = [
    { id: '01', title: 'PREAMBLE', content: 'ENARK SYSTEMS IS COMMITTED TO FOSTERING A LEGALLY COMPLIANT, TRANSPARENT, AND CUSTOMER-FIRST ENVIRONMENT.', simple: 'We try to be fair and honest with everything we sell.' },
    { id: '02', title: 'DEFINITIONS', content: '“USER” SHALL MEAN ANY INDIVIDUAL ACCESSING THE WEBSITE. “PRODUCTS” SHALL MEAN ALL MERCHANDISE SOLD.', simple: 'User = You. Products = Our gear.' },
    { id: '03', title: 'ELIGIBILITY', content: 'USER AFFIRMS THEY ARE 18+ YEARS OF AGE AND LEGALLY COMPETENT TO CONTRACT.', simple: 'You must be at least 18 years old.' },
    { id: '04', title: 'ACCOUNTS', content: 'USERS ARE RESPONSIBLE FOR ACCOUNT SECURITY. INACTIVE ACCOUNTS MAY BE DEACTIVATED AFTER 24 MONTHS.', simple: 'Keep your password secret. We might close inactive accounts.' },
    { id: '05', title: 'RESTRICTIONS', content: 'DATA SCRAPING, HACKING, OR DISRUPTING PLATFORM SECURITY IS STRICTLY PROHIBITED.', simple: 'Dont hack us or steal our data.' },
    { id: '06', title: 'PAYMENTS', content: 'ALL PRICES ARE IN INR. PAYMENTS ARE ENCRYPTED VIA SSL PROTOCOLS.', simple: 'Prices include tax. Payments are safe.' },
    { id: '07', title: 'LOGISTICS', content: 'RISK TRANSFERS TO THE LOGISTICS PROVIDER UPON DISPATCH. WE ARE NOT LIABLE FOR COURIER DELAYS.', simple: 'Once shipped, the courier is responsible for delivery.' },
    { id: '08', title: 'EXCHANGES', content: 'ASSETS MAY BE EXCHANGED WITHIN 7 DAYS. SALE PRODUCTS ARE FINAL SALE.', simple: 'You have a week to swap items. Sales are final.' },
    { id: '09', title: 'INTELLECTUAL PROPERTY', content: 'ALL TRADEMARKS AND SCHEMATICS ARE THE EXCLUSIVE PROPERTY OF ENARK SYSTEMS.', simple: 'All drawings and logos belong to us.' },
    { id: '10', title: 'GRIEVANCE', content: 'GRIEVANCE OFFICER: HARDIK VERMA // EMAIL: LEGAL@ENARK.IO', simple: 'Problem? Email Hardik. He will fix it.' }
  ];

  return (
    <main className="min-h-screen bg-black text-white mono selection:bg-enark-red">
      <Header />
      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto space-y-24">
          
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-8">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-enark-red uppercase tracking-widest">v2.02 // LEGAL</p>
                <h1 className="text-4xl font-black uppercase tracking-tighter-x">
                  {isSimple ? 'THE_RULES' : 'TERMS_OF_SERVICE'}
                </h1>
              </div>
              <button 
                onClick={() => setIsSimple(!isSimple)}
                className="text-[11px] font-black uppercase tracking-[0.4em] px-4 py-2 border border-white/10 hover:bg-white hover:text-black transition-all"
              >
                {isSimple ? 'RE-ENCRYPT' : 'DECRYPT'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3 group border-l border-white/5 pl-6 hover:border-enark-red transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-white/60">{section.id}</span>
                  <h2 className="text-xs font-black uppercase tracking-widest">{section.title}</h2>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={isSimple ? 's' : 'c'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[11px] leading-relaxed tracking-widest uppercase ${isSimple ? 'text-enark-red font-bold' : 'text-white/50'}`}
                  >
                    {isSimple ? section.simple : section.content}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="pt-24 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4 text-white/50 text-xs font-bold uppercase tracking-widest">
              <Scale size={12} />
              <span>LAST_SYNC: 23_04_2026</span>
            </div>
            <Link href="/" className="text-[11px] font-black uppercase tracking-[0.5em] text-white/60 hover:text-enark-red transition-all">
              RETURN_TO_ORIGIN
            </Link>
          </div>
        </div>
      </div>
      <RecentlyViewed />
      <Footer />
    </main>
  );
}
