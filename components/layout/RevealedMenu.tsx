'use client';

import { useMenuStore } from '@/store/useMenuStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RevealedMenu() {
  const { isOpen, closeMenu } = useMenuStore();
  const [user, setUser] = useState<any>(null);
  const [hoveredPrimary, setHoveredPrimary] = useState<string | null>(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const primaryItems = [
    { label: 'SHOP ALL', href: '/shop', desc: 'COLLECTION_01 // ACCESS_GRANTED' },
    { label: 'FIT', href: '/labs', desc: 'SYNTHESIS_MODE // ACTIVE' },
    { label: 'TRACK ORDER', href: '/track', desc: 'LOGISTICS_UPLINK // SECURE' },
    { label: 'REGISTRY', href: '/registry', desc: 'ARCHIVE_SEARCH // ONLINE' },
  ];

  const authItems = user 
    ? [{ label: 'ACCOUNT', href: user.email === 'boddurunagabushan@gmail.com' ? '/command' : '/account' }]
    : [
        { label: 'LOGIN', href: '/login' },
        { label: 'SIGNUP', href: '/login?tab=signup' }
      ];

  const exploreItems = [
    { label: 'BLOG', href: '/blog' },
    { label: 'CAREERS', href: '/careers' },
  ];

  const legalItems = [
    { label: 'PRIVACY', href: '/privacy' },
    { label: 'TERMS', href: '/terms' },
  ];

  const containerVariants = {
    open: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    },
    closed: {
      transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-background z-10 flex items-center justify-start p-6 md:p-24 overflow-y-auto transition-colors duration-500 ${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="w-full max-w-[65vw] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        
        {/* Left Column: Primary Links */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
              className="flex flex-col space-y-4 md:space-y-6"
            >
              <div className="text-enark-red text-xs font-black tracking-[0.5em] mb-4 mono">
                ENARK_CORE_INTERFACE
              </div>

              {primaryItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                >
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredPrimary(item.desc)}
                    onMouseLeave={() => setHoveredPrimary(null)}
                    onClick={() => closeMenu()}
                    className="group flex items-baseline gap-4 text-2xl md:text-5xl font-black uppercase tracking-tighter-x text-foreground/80 hover:text-foreground transition-colors duration-300"
                  >
                    <span className="text-sm font-black text-enark-red/60 group-hover:text-enark-red mono transition-colors">
                      [{index + 1}]
                    </span>
                    <span className="relative overflow-hidden inline-block">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-enark-red transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Right Column: Secondary Links & Preview */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
              className="flex flex-col space-y-12 border-t md:border-t-0 md:border-l border-theme pt-12 md:pt-0 md:pl-12"
            >
              {/* Dynamic Preview Section */}
              <div className="h-16 hidden md:flex items-center">
                <AnimatePresence mode="wait">
                  {hoveredPrimary ? (
                    <motion.div
                      key={hoveredPrimary}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-enark-red font-black tracking-[0.3em] text-xs mono bg-enark-red/10 px-4 py-2 border border-enark-red/20"
                    >
                      {hoveredPrimary}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      className="text-foreground font-black tracking-[0.3em] text-xs mono"
                    >
                      INITIALIZE_UPLINK...
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secondary Links Grid */}
              <div className="grid grid-cols-2 gap-8 md:gap-12">
                {/* Access */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="text-[10px] font-black tracking-[0.4em] text-foreground/70 mono">
                    [ NODE_ACCESS ]
                  </div>
                  <div className="flex flex-col space-y-2">
                    {authItems.map((item) => (
                      <Link 
                        key={item.label} 
                        href={item.href}
                        onClick={() => closeMenu()}
                        className="text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Explore */}
                <motion.div variants={itemVariants} className="space-y-4">
                  <div className="text-[10px] font-black tracking-[0.4em] text-foreground/70 mono">
                    [ ARCHIVE_EXPLORE ]
                  </div>
                  <div className="flex flex-col space-y-2">
                    {exploreItems.map((item) => (
                      <Link 
                        key={item.label} 
                        href={item.href}
                        onClick={() => closeMenu()}
                        className="text-sm font-black uppercase tracking-widest text-foreground hover:text-enark-red transition-all"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Legal */}
                <motion.div variants={itemVariants} className="space-y-4 col-span-2">
                  <div className="text-[10px] font-black tracking-[0.4em] text-foreground/70 mono">
                    [ PROTOCOL_COMPLIANCE ]
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {legalItems.map((item) => (
                      <Link 
                        key={item.label} 
                        href={item.href}
                        onClick={() => closeMenu()}
                        className="text-sm font-black uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div 
                variants={itemVariants}
                className="pt-8 border-t border-theme flex flex-wrap gap-6 text-[10px] font-black tracking-[0.3em] text-foreground/50 mono"
              >
                <span>© 2026 ENARK_OS_v2</span>
                <span>STATUS: STABLE_CONNECTION</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
