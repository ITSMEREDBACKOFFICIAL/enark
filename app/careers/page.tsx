'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, ArrowUpRight, Sparkles } from 'lucide-react';

export default function CareersPage() {
  const roles = [
    { title: 'CREATIVE MODEL', team: 'CASTING', type: 'CONTRACT', href: '/model', premium: true },
  ];

  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center px-6 py-20 select-none relative mono overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.1),transparent)]" />

      <div className="z-10 w-full max-w-2xl space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] text-enark-red font-black tracking-[0.4em] uppercase flex items-center justify-center gap-2">
            <Briefcase size={12} /> ENARK_OPEN_SYSTEMS
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter-x uppercase">
            JOIN THE ATELIER
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Help scale high-fidelity streetwear architecture.</p>
        </div>

        {/* Roles Node list */}
        <div className="space-y-4">
          {roles.map((role, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
            >
              <Link href={role.href}>
                <div className={`p-6 border border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white cursor-pointer group ${role.premium ? 'border-enark-red/30 bg-enark-red/5 hover:border-enark-red' : ''}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className={`text-base font-black uppercase tracking-tight group-hover:text-enark-red transition-colors ${role.premium ? 'text-enark-red' : 'text-white'}`}>{role.title}</p>
                      {role.premium && <span className="text-[9px] bg-enark-red text-white px-2 py-0.5 font-bold tracking-widest flex items-center gap-1"><Sparkles size={8} /> HOT</span>}
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{role.team} // {role.type}</p>
                  </div>
                  <ArrowUpRight className={`text-white/40 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all ${role.premium ? 'text-enark-red' : ''}`} size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom utility */}
        <div className="text-center pt-8 border-t border-white/10">
          <Link href="/" className="text-[11px] text-white/40 hover:text-enark-red font-black uppercase tracking-[0.3em] transition-colors">
            ← RETURN_TO_BASE
          </Link>
        </div>

      </div>

    </main>
  );
}
