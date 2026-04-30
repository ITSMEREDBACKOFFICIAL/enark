'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Shield, Languages } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  {
    title: 'What We Collect',
    legal: `Upon initiation of a transactional uplink or account registration, ENARK Systems collects personally identifiable information including but not limited to electronic mail addresses, physical delivery coordinates, and payment reference identifiers. Cardholder data is not retained within ENARK infrastructure; all financial transmissions are delegated to Razorpay's PCI-DSS compliant processing nodes. Standard telemetric data including session vectors and device class signatures may be collected during platform interaction.`,
    simple: `When you order or sign up, we take your email, delivery address, and payment reference. We never see your card number — Razorpay handles that. We also collect basic analytics like which pages you visit.`,
  },
  {
    title: 'How We Use Your Data',
    legal: `Collected data is utilised exclusively for order fulfilment, transactional communication dispatch, and — contingent upon operative opt-in consent — for priority drop notification and early-access uplink broadcasts. ENARK Systems does not engage in the sale, rental, transfer, or commercial exploitation of personally identifiable information to third-party entities.`,
    simple: `We use your data to send your order and, if you opted in, to notify you of new drops. We don't sell your data to anyone. Ever.`,
  },
  {
    title: 'Cookies',
    legal: `ENARK Systems deploys functional session-scoped cookies solely to maintain cart persistence and authentication state across operative sessions. No third-party advertising networks, behavioural tracking pixels, or cross-site identification mechanisms are integrated within this platform.`,
    simple: `We only use cookies to keep your bag and login working. No ad tracking. No creepy stuff.`,
  },
  {
    title: 'Payment Security',
    legal: `All financial transaction data is processed exclusively through Razorpay, operating in full compliance with Payment Card Industry Data Security Standards (PCI-DSS). ENARK Systems maintains no access to, nor retention of, primary account numbers, card verification values, or banking credential data. All platform communications are secured via 256-bit SSL/TLS encryption protocols.`,
    simple: `Razorpay handles all payments. We never see your card details. The site uses 256-bit encryption — same as your bank.`,
  },
  {
    title: 'Data Retention',
    legal: `Order and transaction records are retained for a mandatory period not exceeding 36 calendar months in compliance with applicable statutory and fiscal regulatory requirements. Upon receipt of a verified data deletion request, ENARK Systems will execute the requested erasure within 7 business days, subject to legally mandated retention obligations.`,
    simple: `We keep your order records for up to 3 years for tax reasons. If you want your data deleted, email us and we'll do it within a week.`,
  },
  {
    title: 'Your Rights',
    legal: `Operatives retain the right to access, rectify, or request erasure of their personally identifiable data at any time, subject to applicable data protection legislation. Consent for marketing communications may be revoked via the unsubscribe mechanism embedded within all outbound correspondence.`,
    simple: `You can ask to see, fix, or delete your data anytime. You can unsubscribe from our emails whenever you want.`,
  },
  {
    title: 'Contact',
    legal: `For the resolution of privacy-related queries or the exercise of data subject rights, direct correspondence to the designated Grievance Officer: Hardik Verma, reachable via electronic uplink at legal@enark.io. Response time does not exceed 48 operational hours.`,
    simple: `Questions? Email Hardik Verma at legal@enark.io. We reply within 48 hours.`,
  },
];

export default function PrivacyPage() {
  const [isSimple, setIsSimple] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white mono selection:bg-enark-red">
      <Header />

      <div className="pt-48 pb-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto space-y-16">

          {/* Header */}
          <div className="space-y-6 border-b border-white/10 pb-12">
            <div className="flex items-center gap-3 text-enark-red">
              <Shield size={16} />
              <span className="text-xs font-black uppercase tracking-[0.5em]">Legal // Privacy</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Privacy<br />Policy
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
            <p className="text-xs text-white/40 uppercase tracking-widest">
              Last updated: April 2026 · Applies to enark.io and all ENARK digital properties.
            </p>
          </div>

          {/* Intro */}
          <p className="text-sm text-white/60 leading-relaxed">
            {isSimple
              ? 'Here\'s exactly what we do with your data — no jargon.'
              : 'ENARK Systems maintains a strict data governance protocol. The following policy delineates the collection, processing, and protection parameters applied to all operative personal data within ENARK digital infrastructure.'}
          </p>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((s, i) => (
              <div key={s.title} className="grid grid-cols-12 gap-6 border-t border-white/10 pt-8">
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <p className="text-[10px] text-enark-red font-black uppercase tracking-widest">0{i + 1}</p>
                  <h2 className="text-sm font-black uppercase tracking-tight">{s.title}</h2>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={isSimple ? 'simple' : 'legal'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`col-span-12 md:col-span-8 text-sm leading-relaxed ${isSimple ? 'text-enark-red' : 'text-white/60'}`}
                  >
                    {isSimple ? s.simple : s.legal}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">
              ENARK Systems LLP · GSTIN: 29ABCDE1234F1Z5
            </p>
            <Link href="/terms" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              View Terms of Service →
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
