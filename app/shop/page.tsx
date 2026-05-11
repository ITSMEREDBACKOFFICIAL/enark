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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { playClick, playHum, playWarp } = useAudio();
  const addItem = useCart((state) => state.addItem);
  const addRecentlyViewed = useRecentlyViewed((state) => state.addItem);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeProduct = filteredProducts[currentIndex];

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
    filtered = filtered.filter(p => p.base_price >= priceRange[0] && p.base_price <= priceRange[1]);
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    setCurrentIndex(0); // Reset to first product on filter change
  }, [categoryFilter, priceRange, searchQuery, products]);

  const handleAddToCart = () => {
    if (!activeProduct) return;
    
    // Find the variant for the selected size or use the first variant
    const variant = activeProduct.variants?.find((v: any) => v.size === selectedSize) || activeProduct.variants?.[0];
    
    if (!variant) return;

    addItem({
      id: activeProduct.id,
      variantId: variant.id,
      name: activeProduct.name,
      price: activeProduct.base_price,
      image: activeProduct.metadata?.image,
      quantity: 1,
      sku: variant.sku,
      size: variant.size
    });
    playWarp();
  };

  const nextProduct = () => {
    if (currentIndex < filteredProducts.length - 1) {
      playClick();
      setCurrentIndex(currentIndex + 1);
      setSelectedSize(null);
    }
  };

  const prevProduct = () => {
    if (currentIndex > 0) {
      playClick();
      setCurrentIndex(currentIndex - 1);
      setSelectedSize(null);
    }
  };

  if (filteredProducts.length === 0 && products.length > 0) {
     return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-8">
           <Search size={48} className="opacity-20" />
           <p className="mono text-[10px] uppercase tracking-[0.5em] opacity-40">NO_MATCHING_ASSETS_FOUND</p>
           <button onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); }} className="text-enark-red mono text-[10px] underline uppercase tracking-widest">Reset_Diagnostics</button>
        </main>
     );
  }

  return (
    <main className="h-screen w-full bg-black text-white selection:bg-enark-red selection:text-white mono overflow-hidden flex flex-col md:flex-row">
      <Header />
      
      {/* --- LEFT PANEL: PRODUCT INFORMATION --- */}
      <div className="w-full md:w-[45%] h-[50%] md:h-full border-r border-white/5 p-6 md:p-12 flex flex-col justify-end md:justify-center space-y-6 md:space-y-12 relative z-10 bg-black">
        
        {/* Navigation Breadcrumbs */}
        <div className="absolute top-24 md:top-32 left-6 md:left-12 flex items-center gap-4">
           <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.5em]">SHOP_ALL // ASSET_{String(currentIndex + 1).padStart(3, '0')}</span>
           <div className="h-[1px] w-12 bg-white/10" />
        </div>

        <AnimatePresence mode="wait">
          {activeProduct && (
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="space-y-8 md:space-y-12"
            >
              <div className="space-y-2">
                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter-x italic leading-tight">
                  {activeProduct.name}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-2xl md:text-4xl font-bold text-white mono italic opacity-40">₹{activeProduct.base_price.toLocaleString()}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10">{activeProduct.category || 'ASSET'}</span>
                </div>
              </div>

              <div className="max-w-md space-y-6">
                <p className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.2em] leading-relaxed">
                  {activeProduct.description || "High-performance technical garment engineered for the Obsidian Node mesh. Features reinforced seams and industrial-grade textile construction."}
                </p>
                
                {/* Size Matrix */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-enark-red">SIZE_CALIBRATION</span>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.variants?.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => { playClick(); setSelectedSize(v.size); }}
                        className={`px-6 py-3 border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSize === v.size ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <button 
                   onClick={handleAddToCart}
                   className="flex-1 px-12 py-5 bg-enark-red text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-[0_20px_60px_rgba(220,38,38,0.3)]"
                 >
                   ADD_TO_CART_0.1
                 </button>
                 <button 
                   onClick={() => router.push(`/product/${activeProduct.slug}`)}
                   className="px-12 py-5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white hover:border-white transition-all"
                 >
                   FULL_DATA_LINK
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Progress Bar */}
        <div className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12 h-[2px] bg-white/5 overflow-hidden">
           <motion.div 
             className="h-full bg-enark-red"
             initial={{ width: 0 }}
             animate={{ width: `${((currentIndex + 1) / filteredProducts.length) * 100}%` }}
           />
        </div>
      </div>

      {/* --- RIGHT PANEL: IMMERSIVE IMAGE SLIDESHOW --- */}
      <div className="flex-1 h-[50%] md:h-full relative overflow-hidden group">
        <AnimatePresence mode="wait">
          {activeProduct && (
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, scale: 1.1, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={activeProduct.metadata?.image || '/placeholder.jpg'} 
                alt={activeProduct.name}
                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Catalog Watermark */}
        <div className="absolute bottom-12 right-12 text-[10vw] font-black text-white/[0.03] uppercase italic pointer-events-none select-none">
          CATALOG_2026
        </div>

        {/* Navigation Arrows */}
        <div className="absolute bottom-12 left-12 flex gap-4 z-20">
           <button 
             onClick={prevProduct}
             disabled={currentIndex === 0}
             className="w-16 h-16 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-10"
           >
             <ListIcon size={18} className="rotate-180" />
           </button>
           <button 
             onClick={nextProduct}
             disabled={currentIndex === filteredProducts.length - 1}
             className="w-16 h-16 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all disabled:opacity-10"
           >
             <ListIcon size={18} />
           </button>
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-24 md:top-32 right-6 md:right-12 flex gap-4 z-20">
           <button 
             onClick={() => setIsFilterOpen(!isFilterOpen)}
             className={`px-8 py-3 border font-black text-[9px] uppercase tracking-widest transition-all ${
               isFilterOpen ? 'bg-enark-red border-enark-red' : 'border-white/10 bg-black/50 backdrop-blur-md hover:border-white'
             }`}
           >
             {isFilterOpen ? 'CLOSE_DIAGNOSTICS' : 'OPEN_DIAGNOSTICS'}
           </button>
        </div>

        {/* Filter Drawer Overlay */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-full md:w-80 h-full bg-black/90 backdrop-blur-2xl border-l border-white/5 z-50 p-12 space-y-12"
            >
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">CATEGORY_MAP</p>
                <div className="flex flex-col gap-2">
                   {['ALL', 'FORMAL', 'TRADITIONAL', 'STREETWEAR'].map(cat => (
                     <button 
                        key={cat} 
                        onClick={() => setCategoryFilter(cat)}
                        className={`text-left px-4 py-3 border text-[10px] font-black uppercase tracking-widest transition-all ${
                          categoryFilter === cat ? 'border-enark-red text-enark-red' : 'border-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-enark-red">SEARCH_UPLINK</p>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="INPUT_ID..."
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 text-[10px] font-black uppercase tracking-widest focus:border-enark-red outline-none"
                />
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-4 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all"
              >
                CLOSE_MANIFEST [X]
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
