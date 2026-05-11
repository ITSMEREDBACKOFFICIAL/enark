'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { useAudio } from '@/hooks/useAudio';
import { Filter, Grid, List as ListIcon, Search } from 'lucide-react';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { useSearchParams, useRouter } from 'next/navigation';

function ShopAllContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { playClick, playHum } = useAudio();
  const addRecentlyViewed = useRecentlyViewed((state) => state.addItem);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) {
        setProducts(data);
        setFilteredProducts(data);
        
        const productId = searchParams.get('product_id');
        if (productId) {
          const product = data.find(p => p.id === productId);
          if (product) {
            router.push(`/product/${product.slug}`);
          }
        }
      }
    }
    fetchProducts();
  }, [searchParams, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let filtered = products;
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(p => p.category?.toUpperCase() === categoryFilter);
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => {
        if (statusFilter === 'RARE') return p.base_price > 20000;
        if (statusFilter === 'ACTIVE') return p.is_active;
        return true;
      });
    }
    filtered = filtered.filter(p => p.base_price >= priceRange[0] && p.base_price <= priceRange[1]);
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, statusFilter, priceRange, searchQuery, products]);

  const categories = ['ALL', 'FORMAL', 'TRADITIONAL', 'STREETWEAR'];

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red selection:text-white">
      <Header />

      
      {/* Stark Aesthetic Header */}
      <div className="pt-[120px] md:pt-[140px] px-5 md:px-12 border-b border-theme">
        <div className="max-w-screen-2xl mx-auto py-8 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="space-y-1">
            <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">CATALOG_NODE // READY</span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter-x uppercase">SHOP ALL</h1>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input — Always visible on mobile, integrated on desktop */}
            <div className="relative w-full md:w-64 lg:w-80 group">
              <Search 
                size={14} 
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${searchQuery ? 'text-enark-red' : 'text-foreground/30 group-focus-within:text-foreground'}`} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_CATALOG..."
                className="w-full bg-surface border-2 border-theme px-10 py-3 md:py-4 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-foreground transition-all placeholder:text-foreground/20"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground/40 hover:text-enark-red transition-colors"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="hidden md:flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { playClick(); setCategoryFilter(cat); }}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-all ${
                      categoryFilter === cat ? 'bg-foreground text-background border-foreground' : 'border-theme text-foreground/60 hover:text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => { playClick(); setIsFilterOpen(!isFilterOpen); }}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 border-2 font-black text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all ${
                  isFilterOpen ? 'bg-enark-red border-enark-red text-white' : 'border-foreground text-foreground hover:bg-foreground hover:text-background'
                }`}
              >
                <Filter size={13} className={isFilterOpen ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline">{isFilterOpen ? 'CLOSE_DIAGNOSTIC' : 'OPEN_DIAGNOSTIC'}</span>
                <span className="sm:hidden">{isFilterOpen ? 'CLOSE' : 'FILTER'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile category pills */}
        <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { playClick(); setCategoryFilter(cat); }}
              className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-all ${
                categoryFilter === cat ? 'bg-foreground text-background border-foreground' : 'border-theme text-foreground/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Unique Diagnostic Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-theme bg-surface"
            >
              <div className="max-w-screen-2xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Price Matrix */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">PRICE_SPECTRUM</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '0 — 10K', range: [0, 10000] },
                      { label: '10K — 25K', range: [10000, 25000] },
                      { label: '25K — 50K', range: [25000, 50000] },
                      { label: 'ALL_LEVELS', range: [0, 100000] },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { playClick(); setPriceRange(p.range as [number, number]); }}
                        className={`p-4 border text-[10px] font-bold uppercase tracking-widest text-left transition-all ${
                          priceRange[0] === p.range[0] && priceRange[1] === p.range[1] 
                            ? 'bg-foreground text-background border-foreground' 
                            : 'border-theme text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Nodes */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">ASSET_STATUS</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: 'ACTIVE_DUTY', id: 'ACTIVE' },
                      { label: 'RARE_COLLECTIBLE', id: 'RARE' },
                      { label: 'SHOW_ALL', id: 'ALL' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { playClick(); setStatusFilter(s.id); }}
                        className={`p-4 border text-[10px] font-bold uppercase tracking-widest text-left flex justify-between items-center transition-all ${
                          statusFilter === s.id 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'border-theme text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {s.label}
                        <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === s.id ? 'bg-enark-red animate-ping' : 'bg-foreground/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories (Mobile/Refined) */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">CATEGORY_MAP</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { playClick(); setCategoryFilter(cat); }}
                        className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          categoryFilter === cat 
                            ? 'bg-foreground text-background border-foreground' 
                            : 'border-theme text-foreground/60 hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-foreground/5">
                     <button 
                       onClick={() => { 
                         setCategoryFilter('ALL'); 
                         setStatusFilter('ALL'); 
                         setPriceRange([0, 100000]); 
                         playClick();
                       }}
                       className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-enark-red flex items-center gap-2"
                     >
                       RESET_DIAGNOSTICS_0.1
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Archive Layout */}
      <section className="py-12 min-h-[60vh] relative">
        <div className="max-w-screen-2xl mx-auto flex flex-col border-t border-foreground/5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="group border-b border-theme py-6 md:py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer transition-colors duration-300 hover:bg-surface"
                onMouseEnter={() => setHoveredImage(product.metadata?.image || null)}
                onMouseLeave={() => setHoveredImage(null)}
                onTouchStart={(e) => {
                  setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                  setIsLongPress(false);
                  touchTimerRef.current = setTimeout(() => {
                    setIsLongPress(true);
                    setHoveredImage(product.metadata?.image || null);
                  }, 400); // 400ms to trigger long press
                }}
                onTouchMove={(e) => {
                  if (isLongPress) {
                    // prevent scroll if long pressing and update image pos
                    setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                  } else {
                    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                  }
                }}
                onTouchEnd={() => {
                  if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
                  setTimeout(() => {
                    setHoveredImage(null);
                    setIsLongPress(false);
                  }, 100);
                }}
                onClick={(e) => {
                  if (isLongPress) {
                    e.preventDefault();
                    return; // Prevent opening details if they were just long-pressing to view
                  }
                  playHum();
                  router.push(`/product/${product.slug}`);
                  addRecentlyViewed({
                    id: product.id,
                    name: product.name,
                    price: product.base_price,
                    image: product.metadata?.image,
                    category: product.category,
                    slug: product.slug
                  });
                }}
              >
                <div className="flex items-center gap-3 md:gap-8 overflow-hidden flex-1 min-w-0">
                  <span className="shrink-0 text-foreground/40 font-mono text-xs">[{String(i + 1).padStart(3, '0')}]</span>
                  <h2 className="text-xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter-x group-hover:text-enark-red transition-colors duration-300 truncate leading-tight py-1">
                    {product.name}
                  </h2>
                </div>
                
                <div className="flex flex-row items-center justify-between md:flex-col md:items-end gap-3 mt-3 md:mt-0 w-full md:w-auto shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70 border border-theme px-3 py-1">
                    {product.category || 'ASSET'}
                  </span>
                  <span className="text-base md:text-2xl font-black text-foreground mono">
                    ₹{product.base_price.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 opacity-20 mono border-b border-foreground/5">
              <Search size={48} />
              <p className="text-xs font-black uppercase tracking-[0.5em]">DATABASE_EMPTY</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Hover Image — desktop only */}
      <AnimatePresence>
        {hoveredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-none fixed z-[60] overflow-hidden border border-foreground/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              width: '350px',
              height: '450px',
              x: '-50%',
              y: '-50%'
            }}
          >
            <img 
              src={hoveredImage} 
              alt="Preview" 
              className="w-full h-full object-cover transition-all duration-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RecentlyViewed />
      <Footer />
    </main>
  );
}

export default function ShopAllPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="mono text-[10px] uppercase tracking-[0.5em] animate-pulse">INIT_CATALOG...</p>
      </main>
    }>
      <ShopAllContent />
    </Suspense>
  );
}
