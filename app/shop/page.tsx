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
import { useCart } from '@/store/useCart';

function ShopAllContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  
  const { playClick, playHum, playWarp } = useAudio();
  const addItem = useCart((state) => state.addItem);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeProduct = filteredProducts[currentIndex];
  console.log('SHOP_DIAGNOSTICS:', { productsCount: products.length, filteredCount: filteredProducts.length, currentIndex, hasActive: !!activeProduct });

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
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(p => p.category?.toUpperCase() === categoryFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    setCurrentIndex(0);
  }, [categoryFilter, searchQuery, products]);

  const paginate = (newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < filteredProducts.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
      setSelectedSize(null);
      playClick();
    }
  };

  // Robust Path Normalizer for assets
  const getProductImage = (product: any) => {
    const img = product?.metadata?.image;
    if (!img || typeof img !== 'string') return 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop';
    
    // Catch-all for legacy local paths
    if (img.includes('exo_front') || img.includes('exo_jacket')) return '/images/exo-jacket/front.png';
    if (img.includes('exo_back')) return '/images/exo-jacket/back.png';
    if (img.includes('exo_detail')) return '/images/exo-jacket/detail.png';
    if (img.includes('/Users/chinnu/') || img.includes('/brain/')) {
       // Check if we can map other common ones or fallback
       if (img.includes('blazer')) return '/images/velvet_blazer_luxury_1776743227817.png';
       if (img.includes('parka')) return '/images/utility_parka_luxury_1776743275844.png';
       return 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1000&auto=format&fit=crop';
    }
    return img;
  };

  return (
    <main className="min-h-screen w-full bg-[#0A0A0A] text-white selection:bg-enark-red selection:text-white mono flex flex-col relative">
      <Header />
      
      {/* --- CINEMATIC PRODUCT SLIDESHOW --- */}
      <div className="relative flex-1 flex flex-col md:flex-row pt-24 md:pt-0 overflow-hidden min-h-[85vh]">
        
        {/* Backdrop Large Text */}
        <AnimatePresence mode="wait">
          {activeProduct && (
            <motion.h1
              key={activeProduct.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 0.03, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute inset-0 flex items-center justify-center text-[22vw] font-black italic uppercase tracking-tighter select-none pointer-events-none z-0"
            >
              {activeProduct.name.split(' ')[0]}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* LEFT INFORMATION PANEL (Split Screen) */}
        <div className="w-full md:w-[45%] h-full p-8 md:p-16 lg:p-24 flex flex-col justify-center space-y-8 md:space-y-12 z-20 relative bg-gradient-to-r from-black via-black/40 to-transparent">
           
           <AnimatePresence mode="wait">
             {activeProduct ? (
               <motion.div
                 key={activeProduct.id}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 30 }}
                 transition={{ duration: 0.4 }}
                 className="space-y-8"
               >
                 <div className="space-y-2">
                    <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.5em]">ASSET_ID // 0{currentIndex + 1}</span>
                    <h2 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter-x italic leading-[0.85]">{activeProduct.name}</h2>
                    <div className="flex items-center gap-6 pt-2">
                       <span className="text-2xl md:text-4xl font-bold italic text-white/40">₹{activeProduct.base_price.toLocaleString()}</span>
                       <span className="px-4 py-1 border border-white/10 text-[9px] font-black uppercase tracking-widest">{activeProduct.category}</span>
                    </div>
                 </div>

                 <div className="max-w-md space-y-8">
                    <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                      {activeProduct.description || "High-performance technical garment engineered for the Obsidian Node mesh. Features reinforced seams and industrial-grade textile construction."}
                    </p>

                    <div className="space-y-4">
                       <p className="text-[9px] font-black uppercase tracking-[0.4em] text-enark-red">SIZE_CALIBRATION</p>
                       <div className="flex flex-wrap gap-2">
                          {activeProduct.variants?.map((v: any) => (
                            <button
                              key={v.id}
                              onClick={() => { playClick(); setSelectedSize(v.size); }}
                              className={`w-12 h-12 md:w-14 md:h-14 border flex items-center justify-center text-[10px] font-black transition-all ${
                                selectedSize === v.size ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                              }`}
                            >
                              {v.size}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 pt-6">
                    <button 
                      onClick={handleAddToCart}
                      className="px-12 py-5 bg-enark-red text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-[0_30px_60px_rgba(220,38,38,0.2)]"
                    >
                      ADD_TO_CART_0.1
                    </button>
                    <button 
                      onClick={() => router.push(`/product/${activeProduct.slug}`)}
                      className="group flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                    >
                      <span>VIEW_DATA_LINK</span>
                      <div className="w-6 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-enark-red transition-all" />
                    </button>
                 </div>
               </motion.div>
             ) : (
               <div className="h-64 flex items-center justify-center">
                 <p className="mono text-[10px] uppercase tracking-[0.5em] animate-pulse">SYNCHRONIZING_NODE...</p>
               </div>
             )}
           </AnimatePresence>

           {/* Progress Indicator */}
           <div className="absolute bottom-12 left-16 right-16 flex items-center gap-4">
              <span className="text-[10px] font-black opacity-20 mono">0{currentIndex + 1}</span>
              <div className="flex-1 h-[1px] bg-white/5 overflow-hidden">
                 <motion.div 
                   className="h-full bg-enark-red" 
                   initial={{ width: 0 }}
                   animate={{ width: `${((currentIndex + 1) / (filteredProducts.length || 1)) * 100}%` }}
                 />
              </div>
              <span className="text-[10px] font-black opacity-20 mono">0{filteredProducts.length}</span>
           </div>
        </div>

        {/* RIGHT CAROUSEL (Immersive Images) */}
        <div className="flex-1 relative flex items-center justify-center z-10 p-8 md:p-20">
           
           {/* Center Image Container */}
           <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center"
                >
                   <img 
                     src={getProductImage(activeProduct)} 
                     alt="" 
                     className="max-w-full max-h-full object-contain drop-shadow-[0_40px_100px_rgba(0,0,0,1)]"
                   />
                </motion.div>
              </AnimatePresence>
           </div>

           {/* Side Peeks (Decorative Overlays for Depth) */}
           <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none hidden md:block z-30" />
           <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none hidden md:block z-30" />

           {/* Navigation Controls */}
           <div className="absolute bottom-12 right-12 md:right-20 flex gap-4 z-[100]">
              <button 
                onClick={() => paginate(-1)}
                disabled={currentIndex === 0}
                className="w-16 h-16 md:w-20 md:h-20 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-5 bg-black/40 backdrop-blur-md"
              >
                <ListIcon size={18} className="rotate-180" />
              </button>
              <button 
                onClick={() => paginate(1)}
                disabled={currentIndex === filteredProducts.length - 1}
                className="w-16 h-16 md:w-20 md:h-20 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-5 bg-black/40 backdrop-blur-md"
              >
                <ListIcon size={18} />
              </button>
           </div>

           {/* Search & Diagnostic Toggle */}
           <div className="absolute top-32 right-12 md:right-20 flex items-center gap-6 z-[100]">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="group flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-6 py-3 border border-white/5"
              >
                <span>{isFilterOpen ? 'CLOSE_MANIFEST' : 'OPEN_DIAGNOSTICS'}</span>
                <Filter size={14} className={isFilterOpen ? 'text-enark-red' : 'text-white/20'} />
              </button>
           </div>
        </div>

        {/* Diagnostic Drawer Overlay */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-full md:w-[400px] h-full bg-black/90 backdrop-blur-3xl border-l border-white/5 z-[100] p-20 space-y-16"
            >
              <div className="space-y-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">CATEGORY_MAP</p>
                <div className="flex flex-col gap-2">
                   {['ALL', 'FORMAL', 'TRADITIONAL', 'STREETWEAR'].map(cat => (
                     <button 
                        key={cat} 
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-left px-6 py-4 border text-[10px] font-black uppercase tracking-widest transition-all ${
                          categoryFilter === cat ? 'border-enark-red text-enark-red bg-enark-red/5' : 'border-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">SEARCH_UPLINK</p>
                <div className="relative group">
                  <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-enark-red transition-colors" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="INPUT_ID..."
                    className="w-full bg-white/5 border border-white/10 px-16 py-6 text-[10px] font-black uppercase tracking-widest focus:border-enark-red outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-6 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-4"
              >
                <span>CLOSE_MANIFEST [X]</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
