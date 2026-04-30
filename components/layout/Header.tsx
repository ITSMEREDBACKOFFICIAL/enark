'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search as SearchIcon, Menu, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import SearchOverlay from '../ui/SearchOverlay';
import SaleTicker from '../ui/SaleTicker';
import { useCart } from '@/store/useCart';
import { useAudio } from '@/hooks/useAudio';
import { useMenuStore } from '@/store/useMenuStore';

export default function Header() {
  const { items, setIsOpen } = useCart();
  const { playClick, playHum } = useAudio();
  const { isOpen, toggleMenu } = useMenuStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [marqueeText, setMarqueeText] = useState('ENARK_OS: ONLINE // PROTOCOL_READY // SYSTEM_STABLE');
  const [brandName, setBrandName] = useState('ENARK');
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsGlobalMuted(localStorage.getItem('sound_disabled') === 'true');
    }
  }, []);

  const toggleGlobalMute = () => {
    const nextState = !isGlobalMuted;
    setIsGlobalMuted(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_disabled', String(nextState));
    }
    setTimeout(() => {
      playClick();
    }, 50);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('app_config').select('marquee_text, brand_name').eq('id', 'main').single();
      if (data?.marquee_text) setMarqueeText(data.marquee_text);
      if (data?.brand_name) setBrandName(data.brand_name);
    }
    fetchConfig();

    // Listen for manual system sync broadcasts
    const channel = supabase.channel('system_sync')
      .on('broadcast', { event: 'system_update' }, () => {
        fetchConfig();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const navItems = [
    { label: 'SHOP ALL', href: '/shop' },
    { label: 'TRACK', href: '/track' },
    { label: 'REGISTRY', href: '/registry' },
    { label: 'FIT', href: '/labs' },
  ];

  const authItem = user 
    ? { label: 'ACCOUNT', href: user.email === 'boddurunagabushan@gmail.com' ? '/command' : '/account' }
    : { label: 'LOGIN', href: '/login' };

  return (
    <>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      <header 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 bg-black border-b ${
          isScrolled ? 'border-white/20' : 'border-transparent'
        }`}
      >
        <SaleTicker text={marqueeText} />

        <div className="max-w-full mx-auto flex items-center justify-between border-b border-white/10">
          {/* Left: Brand */}
          <div className="flex items-center">
            <div className="p-6 border-r border-white/10">
              <a href="/">
                <h1 className="text-2xl font-black tracking-tighter-x hover:text-enark-red transition-colors">
                  {brandName}
                  <span className="text-enark-red">.</span>
                </h1>
              </a>
            </div>

          </div>

          {/* Right: Interface */}
          <div className="flex items-center">
            <button 
              onClick={toggleGlobalMute}
              className="p-8 border-l border-white/10 hover:bg-enark-red transition-colors group"
              title={isGlobalMuted ? "Enable Sound" : "Mute Sound"}
            >
              {isGlobalMuted ? <VolumeX size={18} className="group-hover:text-white text-enark-red" /> : <Volume2 size={18} className="group-hover:text-white" />}
            </button>

            <button 
              onClick={() => { playClick(); setIsSearchOpen(true); }}
              className="p-8 border-l border-white/10 hover:bg-enark-red transition-colors group"
            >
              <SearchIcon size={18} className="group-hover:text-white" />
            </button>

            <motion.button 
              id="bag-target" 
              onClick={() => { playHum(); setIsOpen(true); }}
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.2, zIndex: 100 }}
              className="p-8 border-l border-white/10 hover:bg-enark-red transition-colors group relative cursor-grab active:cursor-grabbing touch-none"
            >
              <ShoppingBag size={18} className="group-hover:text-white pointer-events-none" />
              <span className="absolute top-4 right-4 text-[11px] font-black bg-enark-red text-white w-4 h-4 flex items-center justify-center rounded-none border border-black z-20 pointer-events-none">
                {items.length}
              </span>
            </motion.button>
            <button 
              className="p-8 border-l border-white/10"
              onClick={() => { playClick(); toggleMenu(); }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
