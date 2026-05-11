'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Search as SearchIcon, Menu, X, User, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SearchOverlay from '../ui/SearchOverlay';
import dynamic from 'next/dynamic';
import { useCart } from '@/store/useCart';
import { useAudio } from '@/hooks/useAudio';
import { useMenuStore } from '@/store/useMenuStore';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  const { items, setIsOpen } = useCart();
  const { playClick, playHum } = useAudio();
  const { isOpen, toggleMenu } = useMenuStore();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [marqueeText, setMarqueeText] = useState('ENARK_OS: ONLINE // PROTOCOL_READY // SYSTEM_STABLE');
  const [brandName, setBrandName] = useState('ENARK');
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const headerTheme = isHomePage ? (isScrolled ? 'dark' : 'light') : 'dark';
  const textColor = headerTheme === 'dark' ? 'text-foreground' : 'text-white';
  const hoverColor = headerTheme === 'dark' ? 'hover:text-foreground/80' : 'hover:text-white/70';

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
    setIsMounted(true);
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
        className={`fixed z-[100] transition-all duration-300 rounded-t-[24px] overflow-hidden ${
          headerTheme === 'dark' 
            ? 'bg-[var(--header-bg)] border border-theme' 
            : 'bg-black/10 backdrop-blur-md border border-transparent'
        }`}
        style={{
          top: 'var(--canvas-margin)',
          left: 'var(--canvas-margin)',
          right: 'var(--canvas-margin)',
        }}
      >
        <div className="max-w-full mx-auto grid grid-cols-3 items-center h-20">
          {/* Left: Links */}
          <div className="flex items-center h-full">
            <div className="hidden md:flex items-center gap-6 px-8 h-full">
              <a href="/shop" className={`text-[11px] font-medium tracking-normal transition-colors ${textColor} ${hoverColor}`}>New in</a>
              <a href="/shop" className={`text-[11px] font-medium tracking-normal transition-colors ${textColor} ${hoverColor}`}>Collections</a>
            </div>
          </div>

          {/* Center: Brand */}
          <div className="flex justify-center items-center p-4 md:p-6 h-full">
            <a href="/">
              <h1 className={`text-2xl font-black tracking-tighter transition-colors ${textColor} ${hoverColor}`}>
                {brandName}
              </h1>
            </a>
          </div>

          {/* Right: Interface */}
          <div className="flex items-center justify-end h-full px-4 md:px-8 gap-5 md:gap-6">
            <button 
              onClick={toggleGlobalMute}
              className={`transition-colors group relative ${hoverColor}`}
              title={isGlobalMuted ? "Enable Sound" : "Mute Sound"}
            >
              {isGlobalMuted ? <VolumeX size={16} strokeWidth={1.5} className={textColor} /> : <Volume2 size={16} strokeWidth={1.5} className={textColor} />}
            </button>

            <ThemeToggle />

            <button 
              onClick={() => { playClick(); setIsSearchOpen(true); }}
              className={`transition-colors group ${hoverColor}`}
            >
              <SearchIcon size={16} strokeWidth={1.5} className={textColor} />
            </button>

            <a 
              href={authItem.href}
              className={`transition-colors group flex items-center justify-center ${hoverColor}`}
            >
              <User size={16} strokeWidth={1.5} className={textColor} />
            </a>

            <motion.button 
              id="bag-target" 
              onClick={() => { playHum(); setIsOpen(true); }}
              drag
              dragSnapToOrigin
              whileDrag={{ scale: 1.2, zIndex: 100 }}
              className={`transition-colors group relative cursor-grab active:cursor-grabbing touch-none ${hoverColor}`}
            >
              <ShoppingBag size={16} strokeWidth={1.5} className={`${textColor} pointer-events-none`} />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black bg-black text-white w-3.5 h-3.5 flex items-center justify-center rounded-full z-20 pointer-events-none">
                  {items.length}
                </span>
              )}
            </motion.button>

            <button 
              className={`transition-colors group ${hoverColor}`}
              onClick={() => { playClick(); toggleMenu(); }}
            >
              {isOpen ? <X size={16} strokeWidth={1.5} className={textColor} /> : <Menu size={16} strokeWidth={1.5} className={textColor} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
