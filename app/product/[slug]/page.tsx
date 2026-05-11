'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/useCart';
import { useAudio } from '@/hooks/useAudio';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { ShoppingBag, Plus, Minus, Lock, Zap, Ruler, Activity } from 'lucide-react';
import SizeGuide from '@/components/ui/SizeGuide';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const { playClick, playSuccess, playError, playHum, playGlitch } = useAudio();
  const addRecentlyViewed = useRecentlyViewed((state) => state.addItem);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Vault
  const [vaultCode, setVaultCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [showVaultError, setShowVaultError] = useState(false);
  const [isDiagnostic, setIsDiagnostic] = useState(false);

  // Ticker Logic
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerLabels, setTickerLabels] = useState<string[]>([
    'ENCRYPTED_PAYMENT_SECURE',
    'NODE_DISPATCH_FREE',
    'EXPRESS_ARRIVAL_READY',
    'SECURE_UPLINK_ESTABLISHED'
  ]);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('app_config').select('ticker_labels').eq('id', 'main').single();
      if (data?.ticker_labels && data.ticker_labels.length > 0) {
        setTickerLabels(data.ticker_labels);
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerLabels.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [tickerLabels.length]);

  // Scroll tracking
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start start", "end end"]
  });

  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('slug', params.slug)
        .single();
      
      if (data) {
        setProduct(data);
        setIsUnlocked(!data.metadata?.is_vault);
        const savedSize = localStorage.getItem('enark-last-size');
        const remembered = savedSize ? data.variants?.find((v: any) => v.size === savedSize && v.stock_quantity > 0) : null;
        setSelectedVariant(remembered || data.variants?.[0]);

        addRecentlyViewed({
          id: data.id,
          name: data.name,
          price: data.base_price,
          image: data.metadata?.image,
          category: data.category,
          slug: data.slug
        });

        const { data: related } = await supabase
          .from('products')
          .select('*, variants(*)')
          .eq('category', data.category)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(4);
        
        if (related) setRelatedProducts(related);
      }
      setLoading(false);
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">Loading Asset</p>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const handleUnlock = () => {
    if (vaultCode.toUpperCase() === 'ENARK') {
      setIsUnlocked(true);
      playSuccess();
    } else {
      playError();
      setShowVaultError(true);
      setTimeout(() => setShowVaultError(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock_quantity === 0) return;
    addItem({
      id: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: product.base_price,
      image: product.metadata?.image,
      quantity: quantity,
      sku: selectedVariant?.sku
    });
    if (selectedVariant?.size) localStorage.setItem('enark-last-size', selectedVariant.size);
    playSuccess();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // Build a rich 4-image gallery. Use metadata.images array if it exists, fallback to tiling.
  const rawImages: string[] = (product.metadata?.images?.filter(Boolean) as string[]) 
    || [product.metadata?.image, product.metadata?.image_alt, product.metadata?.image, product.metadata?.image_alt].filter(Boolean) as string[];
  const images = rawImages.slice(0, 4);

  const scrollToImage = (index: number) => {
    playClick();
    const el = document.getElementById(`img-frame-${index}`);
    el?.scrollIntoView({ behavior: 'smooth' });
    setActiveImageIndex(index);
  };

  const labelForIndex = (i: number) => {
    const labels = ['FRONT', 'DETAIL', 'BACK', 'LIFESTYLE'];
    return labels[i] ?? `VIEW ${i + 1}`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans relative">
      
      {/* === TELEMETRY SCROLL BAR (Restored) === */}
      <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-48 w-[1px] bg-foreground/5 relative overflow-hidden">
            <motion.div 
              style={{ height: progressHeight }}
              className="absolute top-0 inset-x-0 bg-enark-red"
            />
          </div>
        </div>
      </div>

      {/* === TOP NAVIGATION (Fitted) === */}
      <div className="flex justify-between items-center px-6 md:px-12 py-8 border-b border-theme">
        <button
          onClick={() => { playClick(); router.back(); }}
          className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-foreground transition-all duration-300 group"
        >
          <div className="w-6 h-px bg-foreground/10 group-hover:w-10 group-hover:bg-foreground transition-all" />
          Return
        </button>

        <button
          onClick={() => { playClick(); router.push('/labs'); }}
          className="flex items-center gap-3 px-6 py-2 rounded-full border border-theme text-[9px] font-black uppercase tracking-[0.4em] text-foreground/40 hover:text-white hover:bg-enark-red hover:border-enark-red transition-all duration-300"
        >
          Analyze_Fit
        </button>
      </div>




      {/* === MAIN LAYOUT === */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen max-w-[1800px] mx-auto border-x border-theme/5">

        {/* ── LEFT: Scrollable Image Gallery ── */}
        <div ref={galleryRef} className="w-full lg:w-[60%] flex flex-col relative border-r border-theme">
          
          {images.map((img, i) => (
            <motion.div
              key={i}
              id={`img-frame-${i}`}
              className={`relative w-full overflow-hidden ${i === 0 ? 'h-[90vh] lg:h-[100vh]' : 'h-[90vh] lg:h-[100vh]'}`}
              onViewportEnter={() => {
                if (activeImageIndex !== i) playHum();
                setActiveImageIndex(i);
              }}
              viewport={{ amount: 0.55 }}
            >
              {/* Subtle Grid Overlay when Diagnostic is ON */}
              <AnimatePresence>
                {isDiagnostic && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                  />
                )}
              </AnimatePresence>

              <img
                src={img}
                alt={`${product.name} — ${labelForIndex(i)}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out hover:scale-110 grayscale hover:grayscale-0"
              />

              {/* Scantron Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

              <div className="absolute bottom-10 left-10 flex flex-col gap-2 z-30">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/40">{labelForIndex(i)}</span>
                  <div className="h-px w-6 bg-enark-red/30" />
                  <span className="text-[9px] font-bold text-foreground/20">0{i + 1}_VIEW</span>
                </div>
                {isDiagnostic && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[7px] font-mono text-foreground/10 uppercase tracking-widest"
                  >
                    REF_ID: ENRK_{product.id?.slice(0, 8)}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── RIGHT: Sticky Product Info ── */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center px-6 md:px-14 lg:px-20 pt-10 pb-24 lg:py-0 self-start">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto lg:mx-0 space-y-12"
          >

            {/* — Name & Price — */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-enark-red">ASSET_CLASSIFICATION // {product.id?.slice(0, 8)}</span>
                <div className="h-px flex-1 bg-theme" />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85]">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                 <p className="text-4xl font-light tabular-nums">₹{product.base_price.toLocaleString()}</p>
                 <span className="text-[10px] font-mono text-foreground/20">INCL_ALL_TAXES</span>
              </div>
            </motion.div>

            {/* — Size Selector (Soft Brutalist) — */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">Dimension_Registry</p>
                </div>
                <button
                  onClick={() => { playClick(); setIsSizeGuideOpen(true); }}
                  className="text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors"
                >
                  Size_Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-4">
                {product.variants?.map((variant: any) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isOos = variant.stock_quantity === 0;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => { playClick(); setSelectedVariant(variant); }}
                      disabled={isOos}
                      className={`relative group h-12 px-6 rounded-full border transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? 'bg-foreground text-background border-foreground shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                          : isOos
                          ? 'border-theme opacity-5 cursor-not-allowed'
                          : 'border-theme text-foreground/40 hover:border-foreground/40 hover:text-foreground hover:translate-y-[-2px]'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {variant.size}
                      </span>
                      {isSelected && (
                        <motion.div 
                          layoutId="size-active-glow"
                          className="absolute -inset-0.5 rounded-full border border-enark-red/30 animate-pulse"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* — Buy Action — */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 pt-4"
            >
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant?.stock_quantity === 0}
                className="w-full relative group h-16 rounded-full overflow-hidden bg-foreground text-background font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-500 hover:bg-enark-red hover:text-white disabled:opacity-20 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
              >
                <span className="relative z-10">
                  {selectedVariant?.stock_quantity === 0 ? 'STATUS // SOLD_OUT' : 'INITIATE_TRANSFER // ADD_TO_BAG'}
                </span>
                
                {/* Decorative Pill Detail */}
                <div className="absolute top-1/2 -translate-y-1/2 left-6 w-1.5 h-1.5 rounded-full bg-enark-red animate-pulse group-hover:bg-white" />
                <div className="absolute top-1/2 -translate-y-1/2 right-6 w-8 h-[1px] bg-white/20 group-hover:bg-white/40" />
                
                {/* Glitch Overlay on Hover */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none"
                  animate={{ x: [-200, 200] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </button>

              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center h-8 overflow-hidden relative w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tickerIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                      className="flex items-center gap-3 h-8"
                    >
                      <Activity size={10} className="text-enark-red animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.4em] text-foreground/30">
                        {tickerLabels[tickerIndex]}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                <div className="flex items-center justify-between w-full px-4 pt-2 border-t border-theme">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Stock_Stable // In_Node_01</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-foreground/20 italic">Authenticity_Verified</span>
                </div>
              </div>
            </motion.div>

            {/* — Fabric Matrix — */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 border-t border-theme pt-8"
            >
              {[
                ['Fabric', product.metadata?.material || '100% Cotton'],
                ['Weight', `${product.metadata?.gsm || '450'} GSM`],
                ['Fit', product.metadata?.fit || 'Oversized'],
                ['Origin', 'Enark Node 01'],
              ].map(([l, v]) => (
                <div key={l} className="space-y-2 group">
                  <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30 group-hover:text-enark-red transition-colors">{l}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider">{v}</p>
                </div>
              ))}
            </motion.div>

            {/* — IN THE BOX / Compatible — */}
            {relatedProducts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6 pt-4 border-t border-theme"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">Compatible // Add-Ons</p>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
                  {relatedProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { playClick(); router.push(`/product/${p.slug}`); }}
                      className="flex flex-col gap-3 min-w-[100px] group"
                    >
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-theme group-hover:border-foreground/30 transition-all duration-500 shadow-sm">
                        <img
                          src={p.metadata?.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={p.name}
                        />
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground transition-colors leading-tight truncate">{p.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </div>

      <SizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </main>
  );
}
