'use client';

import ShiftingHorizon from '@/components/home/ShiftingHorizon';
import Header from '@/components/layout/Header';
import CommandK from '@/components/ui/CommandK';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import Footer from '@/components/layout/Footer';
import DeepvoidIntro from '@/components/home/DeepvoidIntro';

export default function OriginHome() {
  return (
    <main className="relative min-h-screen bg-black">
      <Header />
      <DeepvoidIntro />
      <ShiftingHorizon />
      <RecentlyViewed />
      <CommandK />
      <Footer />
    </main>
  );
}
