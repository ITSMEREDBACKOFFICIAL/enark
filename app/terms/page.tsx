'use client';

import { useState } from 'react';
import { Scale, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  const [isSimple, setIsSimple] = useState(false);

  const sections = [
    { id: '01', title: 'PREAMBLE', content: 'ENARK SYSTEMS (REGISTERED AS ENARK RETAIL OS PVT LTD) IS COMMITTED TO FOSTERING A LEGALLY COMPLIANT, TRANSPARENT, AND CUSTOMER-FIRST ENVIRONMENT. BY ACCESSING THIS PLATFORM, YOU CONCUR WITH THESE STIPULATIONS.', simple: 'We try to be fair and honest with everything we sell. By using this site, you agree to these rules.' },
    { id: '02', title: 'DEFINITIONS', content: '“OPERATIVE” OR “USER” SHALL MEAN ANY INDIVIDUAL ACCESSING THE WEBSITE. “ASSETS” SHALL MEAN ALL MERCHANDISE SOLD. “UPLINK” REFERS TO THE DIGITAL INTERFACE.', simple: 'User/Operative = You. Assets = Our products.' },
    { id: '03', title: 'ELIGIBILITY', content: 'USER AFFIRMS THEY ARE 18+ YEARS OF AGE OR ACCESSING UNDER SUPERVISION, AND LEGALLY COMPETENT TO ENTER INTO BINDING CONTRACTS.', simple: 'You must be at least 18 years old to shop here.' },
    { id: '04', title: 'OPERATIVE ACCOUNTS', content: 'USERS ARE RESPONSIBLE FOR MAINTAINING ACCOUNT SECURITY. ENARK RESERVES THE RIGHT TO SUSPEND ACCESS TO ANY TERMINAL DEEMED TO BE IN BREACH OF SECURITY PROTOCOLS.', simple: 'Keep your login safe. We can lock accounts if we see suspicious activity.' },
    { id: '05', title: 'CONDUCT RESTRICTIONS', content: 'DATA SCRAPING, UNAUTHORIZED SYSTEM PENETRATION, OR DISRUPTING PLATFORM STABILITY IS STRICTLY PROHIBITED AND SUBJECT TO LEGAL ACTION.', simple: 'Dont hack us, scrape our data, or try to break the site.' },
    { id: '06', title: 'FISCAL TRANSACTIONS', content: 'ALL PRICES ARE IN INR AND INCLUSIVE OF APPLICABLE TAXES UNLESS STATED OTHERWISE. PAYMENTS ARE ENCRYPTED VIA SSL/TLS AND PROCESSED BY CERTIFIED GATEWAYS.', simple: 'Prices include tax. Payments are 100% secure and encrypted.' },
    { id: '07', title: 'LOGISTICS & RISK', content: 'RISK TRANSFERS TO THE LOGISTICS PARTNER UPON DISPATCH. WE PROVIDE END-TO-END TRACKING BUT ARE NOT LIABLE FOR THIRD-PARTY CARRIER DELAYS.', simple: 'Once shipped, the courier handles delivery. We give you a tracking number to watch it.' },
    { id: '08', title: 'EXCHANGE PROTOCOL', content: 'ASSETS MAY BE EXCHANGED WITHIN 7 CALENDAR DAYS OF DELIVERY. FINAL SALE ITEMS ARE NON-RETURNABLE. ALL EXCHANGES ARE SUBJECT TO QUALITY INSPECTION.', simple: 'You have a week to swap items. Make sure they are in original condition.' },
    { id: '09', title: 'NEURAL IP & ASSETS', content: 'ALL TRADEMARKS, SCHEMATICS, AND GENERATIVE DESIGNS ARE THE EXCLUSIVE PROPERTY OF ENARK SYSTEMS. UNAUTHORIZED REPRODUCTION IS PROHIBITED.', simple: 'Our designs and logos belong to us. Dont copy them.' },
    { id: '10', title: 'GRIEVANCE RESOLUTION', content: 'GRIEVANCE OFFICER: HARDIK VERMA // EMAIL: LEGAL@ENARK.IO // ENARK RETAIL OS PVT LTD, GSTIN: 29ABCDE1234F1Z5', simple: 'Problem? Email Hardik at legal@enark.io. He is here to help.' }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red">
      <Header />

      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto space-y-24">
          
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-foreground/10 pb-8">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-enark-red uppercase tracking-widest">v2.02 // LEGAL</p>
                <h1 className="text-4xl font-black uppercase tracking-tighter-x">
                  {isSimple ? 'THE_RULES' : 'TERMS_OF_SERVICE'}
                </h1>
              </div>
              <button 
                onClick={() => setIsSimple(!isSimple)}
                className="text-[11px] font-black uppercase tracking-[0.4em] px-4 py-2 border border-foreground/10 hover:bg-foreground hover:text-background transition-all"
              >
                {isSimple ? 'RE-ENCRYPT' : 'DECRYPT'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3 group border-l border-foreground/5 pl-6 hover:border-enark-red transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-foreground/60">{section.id}</span>
                  <h2 className="text-xs font-black uppercase tracking-widest">{section.title}</h2>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={isSimple ? 's' : 'c'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[11px] leading-relaxed tracking-widest uppercase ${isSimple ? 'text-enark-red font-bold' : 'text-foreground/50'}`}
                  >
                    {isSimple ? section.simple : section.content}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Navigation Matrix */}
          <div className="mt-32 pt-12 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-12">
             <Link href="/shipping" className="group flex flex-col items-start gap-2">
                <span className="text-[10px] text-foreground/60 uppercase tracking-widest flex items-center gap-2 group-hover:text-enark-red transition-colors">
                   <ArrowLeft size={10} /> PREVIOUS_PROTOCOL
                </span>
                <span className="text-sm font-black uppercase group-hover:text-enark-red transition-all">SHIPPING_POLICY</span>
             </Link>

             <Link href="/" className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/40 hover:text-foreground transition-all">
                RETURN_TO_CENTRAL
             </Link>

             <Link href="/privacy" className="group flex flex-col items-end gap-2 text-right">
                <span className="text-[10px] text-foreground/60 uppercase tracking-widest flex items-center gap-2 group-hover:text-enark-red transition-colors">
                   NEXT_PROTOCOL <ArrowRight size={10} />
                </span>
                <span className="text-sm font-black uppercase group-hover:text-enark-red transition-all">PRIVACY_POLICY</span>
             </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
