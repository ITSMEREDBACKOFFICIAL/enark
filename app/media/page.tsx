'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WarpGallery from '@/components/ui/WarpGallery';

export default function MediaPage() {
  return (
    <main className="min-h-screen bg-[#000000] text-white mono selection:bg-enark-red overflow-x-hidden">
      <Header />

      <div className="pt-[120px] md:pt-[140px] pb-32 min-h-screen flex flex-col">
        {/* Title Section - Contained */}
        <div className="max-w-screen-xl mx-auto w-full px-5 md:px-12 mb-12">
          <div className="flex flex-col">
            <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">ARCHIVE // VISUAL_DATA</span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter-x uppercase mt-3 leading-none">MEDIA_EXPLORER</h1>
          </div>
        </div>
        
        {/* Infinite Warp Gallery - Full Width Immersive */}
        <div className="w-full border-y border-white/5 bg-neutral-950/50 mb-12">
          <WarpGallery />
        </div>

        {/* Footer Text - Contained */}
        <div className="max-w-screen-xl mx-auto w-full px-5 md:px-12">
          <p className="text-xs text-white/30 uppercase tracking-widest leading-relaxed max-w-2xl">
            All assets are for editorial and press use only. Unauthorized commercial use is prohibited. 
            For high-resolution requests, please contact the Enark Neural Hub.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
