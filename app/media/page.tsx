'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { FileArchive, Mail } from 'lucide-react';

export default function MediaPage() {
  const assets = [
    { name: 'ENARK_BRAND_GUIDELINES.PDF', size: '14.2 MB', date: '2026.01.12', status: 'AVAILABLE' },
    { name: 'LOGOMARK_VECTOR_PACK.ZIP', size: '2.4 MB', date: '2026.02.04', status: 'AVAILABLE' },
    { name: 'SS26_CAMPAIGN_RAW.ZIP', size: '890.1 MB', date: '2026.03.15', status: 'REQUEST_ONLY' },
    { name: 'PRESS_RELEASE_Q1.TXT', size: '12 KB', date: '2026.04.01', status: 'AVAILABLE' },
    { name: 'FOUNDER_INTERVIEW_TRANSCRIPT.PDF', size: '1.1 MB', date: '2026.04.10', status: 'AVAILABLE' },
  ];

  return (
    <main className="min-h-screen bg-[#000000] text-white mono selection:bg-enark-red">
      <Header />

      <div className="pt-[120px] md:pt-[140px] px-5 md:px-12 pb-32 min-h-screen flex flex-col">
        <div className="max-w-screen-xl mx-auto w-full flex-1">

          <div className="border-b border-white/10 pb-10 md:pb-12 mb-10 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">DIRECTORY // PUBLIC</span>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter-x uppercase mt-3 leading-none">PRESS_ARCHIVE</h1>
            </div>
            <div className="text-xs uppercase tracking-widest text-white/40 leading-relaxed">
              For press enquiries, contact<br />
              <a href="mailto:press@enark.io" className="text-white/70 hover:text-enark-red transition-colors underline underline-offset-4">
                press@enark.io
              </a>
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/20 text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
            <div className="col-span-7 md:col-span-8">FILENAME</div>
            <div className="col-span-2 text-right hidden md:block">SIZE</div>
            <div className="col-span-5 md:col-span-2 text-right">STATUS</div>
          </div>

          <div className="space-y-2">
            {assets.map((asset, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                key={asset.name}
                className="grid grid-cols-12 gap-4 px-4 py-5 border border-white/10 hover:border-white/30 hover:bg-white/[0.03] transition-all group"
              >
                <div className="col-span-7 md:col-span-8 flex items-center gap-3 min-w-0">
                  <FileArchive className="text-enark-red opacity-50 group-hover:opacity-100 transition-opacity shrink-0" size={18} />
                  <span className="text-xs font-black uppercase tracking-widest truncate group-hover:text-enark-red transition-colors">
                    {asset.name}
                  </span>
                </div>
                <div className="hidden md:flex col-span-2 items-center justify-end">
                  <span className="text-xs font-mono text-white/50">{asset.size}</span>
                </div>
                <div className="col-span-5 md:col-span-2 flex items-center justify-end gap-3">
                  {asset.status === 'AVAILABLE' ? (
                    <a
                      href="mailto:press@enark.io?subject=Asset Request"
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white border border-white/10 hover:border-white/40 px-3 py-1.5 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail size={10} />
                      REQUEST
                    </a>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-enark-red/60 border border-enark-red/20 px-3 py-1.5">
                      ON REQUEST
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-10 text-xs text-white/30 uppercase tracking-widest leading-relaxed">
            All assets are for editorial and press use only. Unauthorized commercial use is prohibited.<br />
            Assets will be delivered within 48 hours of approval.
          </p>

        </div>
      </div>

      <Footer />
    </main>
  );
}
