'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function StoryPage() {
  return (
    <main className="min-h-screen bg-[#000000] text-white mono selection:bg-enark-red">
      <Header />

      
      <div className="pt-[140px] px-6 md:px-12 pb-32">
        <div className="max-w-4xl mx-auto space-y-32">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/10 pb-12"
          >
            <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">INIT_SEQUENCE // STORY</span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter-x uppercase mt-4 leading-none">THE ARCHIVE</h1>
          </motion.div>

          <div className="space-y-12">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest">01. THE PROTOCOL</h2>
            <p className="text-sm md:text-base font-medium leading-loose text-white/70 uppercase tracking-widest text-justify">
              ENARK WAS NOT FOUNDED AS A BRAND. IT WAS ENGINEERED AS A SYSTEM. A RESPONSE TO THE OVER-SATURATED, CLUTTERED NATURE OF MODERN CONSUMPTION. WE SOUGHT TO STRIP AWAY THE NOISE, LEAVING ONLY THE RAW, BRUTALIST ESSENCE OF FORM AND FUNCTION. EVERY ASSET WE PRODUCE IS A NODE IN A LARGER NETWORK OF AESTHETIC UTILITY.
            </p>
          </div>

          <div className="space-y-12 border-l-2 border-enark-red pl-8 md:pl-16">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest">02. THE HARDWARE</h2>
            <p className="text-sm md:text-base font-medium leading-loose text-white/70 uppercase tracking-widest text-justify">
              WE DO NOT MAKE CLOTHING; WE DEVELOP HARDWARE FOR THE HUMAN FORM. OUR FABRICS ARE SELECTED FOR TENSILE STRENGTH, TEXTURAL INTEGRITY, AND GEOMETRIC DRAPE. THE SILHOUETTES ARE SHARP, UNFORGIVING, AND PURPOSE-DRIVEN. THIS IS NOT FASHION. THIS IS INDUSTRIAL EQUIPMENT FOR DAILY SURVIVAL IN THE DIGITAL AGE.
            </p>
          </div>

          <div className="space-y-12">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-enark-red">03. THE NETWORK</h2>
            <p className="text-sm md:text-base font-medium leading-loose text-white/70 uppercase tracking-widest text-justify">
              TO WEAR ENARK IS TO CONNECT TO THE GRID. OUR COMMUNITY OPERATES ON SHARED PROTOCOLS OF ANONYMITY, EXCELLENCE, AND SUBVERSION. THE SYSTEM REMAINS CLOSED TO THOSE WHO CANNOT READ THE SOURCE CODE, BUT INFINITELY OPEN TO THOSE WHO SPEAK THE LANGUAGE. YOU HAVE INITIATED THE CONNECTION. DO NOT DISCONNECT.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
