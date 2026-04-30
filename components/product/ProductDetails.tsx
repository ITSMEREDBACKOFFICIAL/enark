'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, ShoppingBag, Ruler, Info, ArrowRight, Lock, Zap, Scan, Activity, Bell, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useAudio } from '@/hooks/useAudio';
import { supabase } from '@/lib/supabase';
import SizeGuide from '../ui/SizeGuide';

interface ProductDetailsProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onProductChange?: (product: any) => void;
}

export default function ProductDetails({ product, isOpen, onClose, onProductChange }: ProductDetailsProps) {
  const addItem = useCart((state) => state.addItem);
  const { playClick, playSuccess, playError, playHum } = useAudio();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]);
  const [activeImage, setActiveImage] = useState(product?.metadata?.image);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  // Vault Logic
  const [vaultCode, setVaultCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showVaultError, setShowVaultError] = useState(false);
  const isVaultItem = product?.metadata?.is_vault === true;

  // Restock Alert
  const [restockEmail, setRestockEmail] = useState('');
  const [restockStatus, setRestockStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [activeViewers, setActiveViewers] = useState(18);

  // Related Products
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Stress Test Logic
  const stressX = useMotionValue(0.5);
  const stressY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(stressY, [0, 1], [10, -10]));
  const rotateY = useSpring(useTransform(stressX, [0, 1], [-10, 10]));
  const meshOpacity = useSpring(useTransform(stressY, [0, 1], [0.2, 0.8]));

  useEffect(() => {
    const el = zoomRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const { left, top, width, height } = el.getBoundingClientRect();
      const touch = e.touches[0];
      const x = ((touch.clientX - left) / width) * 100;
      const y = ((touch.clientY - top) / height) * 100;
      const zoomImg = el.querySelector('.zoom-image') as HTMLImageElement;
      if (zoomImg) {
        zoomImg.style.transformOrigin = `${x}% ${y}%`;
      }
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [activeImage]);

  useEffect(() => {
    if (product) {
      // Size memory: auto-select last chosen size
      const savedSize = localStorage.getItem('enark-last-size');
      const remembered = savedSize ? product.variants?.find((v: any) => v.size === savedSize && v.stock_quantity > 0) : null;
      setSelectedVariant(remembered || product.variants?.[0]);
      setActiveImage(product.metadata?.image);
      setIsUnlocked(!isVaultItem);
      setVaultCode('');
      setShowVaultError(false);
      setRestockStatus('idle');
      setRestockEmail('');

      // Fetch related products
      const fetchRelated = async () => {
        const { data } = await supabase
          .from('products')
          .select('*, variants(*)')
          .eq('category', product.category)
          .eq('is_active', true)
          .neq('id', product.id)
          .limit(3);
        if (data) setRelatedProducts(data);
      };
      fetchRelated();

      if (isOpen) {
        playHum();
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);
      }
    }
  }, [product, isOpen, isVaultItem, playHum]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveViewers(Math.floor(Math.random() * 15) + 18);
    const interval = setInterval(() => {
      setActiveViewers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal < 12 ? 12 : (newVal > 45 ? 45 : newVal);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!product) return null;

  const handleUnlock = () => {
    if (vaultCode.toUpperCase() === 'ENARK') {
      setIsUnlocked(true);
      playSuccess();
      setShowVaultError(false);
    } else {
      playError();
      setShowVaultError(true);
      setTimeout(() => setShowVaultError(false), 2000);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: product.base_price,
      image: activeImage,
      quantity: 1,
      sku: selectedVariant?.sku
    });
    // Save size memory
    if (selectedVariant?.size) localStorage.setItem('enark-last-size', selectedVariant.size);
    playSuccess();
    onClose();
  };

  const handleRestockAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockEmail || !selectedVariant) return;
    setRestockStatus('loading');
    await supabase.from('restock_alerts').insert({
      email: restockEmail.toLowerCase(),
      variant_id: selectedVariant.id,
      product_name: product.name,
      size: selectedVariant.size,
    });
    setRestockStatus('done');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    stressX.set((e.clientX - rect.left) / rect.width);
    stressY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-12 mono overflow-hidden"
        >
          <SizeGuide 
            isOpen={isSizeGuideOpen} 
            onClose={() => setIsSizeGuideOpen(false)} 
            category={product.category}
          />

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="w-full h-full max-w-7xl bg-black border border-white/20 flex flex-col md:flex-row relative overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => { playClick(); onClose(); }}
              className="absolute top-8 right-8 z-50 text-white/60 hover:text-white transition-all bg-black p-4 border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Left: Gallery */}
            <div className="w-full md:w-3/5 h-1/2 md:h-full relative border-r border-white/10 bg-[#050505] overflow-hidden">
              <motion.div 
                ref={zoomRef}
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative group/zoom cursor-zoom-in"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  const zoomImg = e.currentTarget.querySelector('.zoom-image') as HTMLImageElement;
                  if (zoomImg) {
                    zoomImg.style.transformOrigin = `${x}% ${y}%`;
                  }
                }}
                onTouchStart={() => setIsZoomed(true)}
                onTouchEnd={() => setIsZoomed(false)}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              >
                <img 
                  src={activeImage || 'https://via.placeholder.com/800'} 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover/zoom:grayscale-0 group-hover/zoom:brightness-100 transition-all duration-1000"
                />
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isZoomed ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img 
                    src={activeImage || 'https://via.placeholder.com/800'} 
                    className="zoom-image w-full h-full object-cover scale-[2.5] transition-transform duration-100 ease-out"
                  />
                </div>
              </motion.div>


              
              <div className="absolute bottom-12 left-12 flex gap-4 z-30">
                 {[product.metadata?.image, product.metadata?.image_alt].filter(Boolean).map((img, i) => (
                    <button 
                      key={i}
                      onClick={() => { playClick(); setActiveImage(img); }}
                      className={`w-20 h-20 border transition-all overflow-hidden ${activeImage === img ? 'border-enark-red scale-110' : 'border-white/20 opacity-50'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                 ))}
              </div>
            </div>

            {/* Right: Technical Specs & Vault */}
            <div className="w-full md:w-2/5 h-1/2 md:h-full p-8 md:p-16 overflow-y-auto space-y-12 bg-black scroll-smooth custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-enark-red">
                  <span className="text-xs font-black tracking-[0.4em] uppercase">{product.category}</span>
                  <div className="h-[1px] flex-1 bg-enark-red/20" />
                </div>
                <h2 className="text-5xl font-black tracking-tighter-x uppercase leading-none">
                  {product.name}
                </h2>
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-3xl font-black text-white/80 mono">₹{product.base_price.toLocaleString()}</p>
                     {product.metadata?.is_sale && (
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-enark-red">FINAL_SALE // NO_RETURNS</p>
                     )}
                   </div>
                    <div className="flex flex-col items-end gap-1 text-xs font-bold uppercase tracking-widest text-right">
                       {product.metadata?.is_preorder ? (
                         <>
                           <p className="text-yellow-500 flex items-center justify-end gap-2">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> PRE_ORDER_ACTIVE
                           </p>
                           <p className="text-white/60">EST_DISPATCH: 30_DAYS</p>
                         </>
                       ) : (
                         <p className="text-white/60 flex items-center justify-end gap-2">
                           <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                           {activeViewers} VIEWING NOW
                         </p>
                       )}
                    </div>
                </div>
              </div>


              {/* The Vault UI */}
              {isVaultItem && !isUnlocked && (
                <div className="p-8 border border-enark-red/40 bg-enark-red/5 space-y-6 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Lock size={120} className="text-enark-red" />
                  </div>
                  <div className="flex items-center gap-3 text-enark-red">
                    <Lock size={18} />
                    <h4 className="text-sm font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Vault_Encryption_Active</h4>
                  </div>
                  <p className="text-xs font-bold text-white/60 uppercase leading-relaxed tracking-wider">
                    THIS ASSET IS ARCHIVED WITHIN THE VAULT. ENTER THE 6-DIGIT DECRYPTION KEY SENT VIA SMS UPLINK TO PROCEED WITH ACQUISITION.
                  </p>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      maxLength={5}
                      value={vaultCode}
                      onChange={(e) => { setVaultCode(e.target.value); playClick(); }}
                      className={`w-full bg-black border ${showVaultError ? 'border-red-500 animate-shake' : 'border-white/20'} p-4 text-lg font-black outline-none focus:border-enark-red transition-all uppercase text-center tracking-[1em]`}
                      placeholder="_____"
                    />
                  </div>
                  <button 
                    onClick={handleUnlock}
                    className="w-full bg-enark-red text-white py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Decrypt Asset
                  </button>
                </div>
              )}

              {/* Standard Content */}
              <div className={`space-y-12 transition-all duration-700 ${!isUnlocked ? 'opacity-20 pointer-events-none blur-sm select-none' : 'opacity-100'}`}>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60">Select Size</p>
                    <button 
                      onClick={() => { playClick(); setIsSizeGuideOpen(true); }}
                      className="flex items-center gap-2 text-[11px] font-bold text-enark-red hover:text-white transition-colors"
                    >
                      <Ruler size={12} /> SIZE GUIDE
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {product.variants?.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => { playClick(); setSelectedVariant(variant); }}
                        disabled={variant.stock_quantity === 0}
                        className={`py-4 text-xs font-black border transition-all relative ${
                          selectedVariant?.id === variant.id
                          ? 'bg-white text-black border-white'
                          : 'border-white/10 text-white/60 hover:border-white'
                        } ${variant.stock_quantity === 0 ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                      >
                        {variant.size}
                        {variant.stock_quantity === 0 && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-enark-red rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Restock Alert — show if selected variant is OOS */}
                  {selectedVariant?.stock_quantity === 0 && (
                    <div className="border border-white/10 bg-white/2 p-5 space-y-4">
                      {restockStatus === 'done' ? (
                        <div className="flex items-center gap-3 text-green-400">
                          <CheckCircle2 size={14} />
                          <p className="text-xs font-black uppercase tracking-widest">We&apos;ll notify you when {selectedVariant.size} is back.</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Bell size={13} className="text-enark-red" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Notify me when size {selectedVariant.size} is back</p>
                          </div>
                          <form onSubmit={handleRestockAlert} className="flex gap-3">
                            <input
                              required
                              type="email"
                              value={restockEmail}
                              onChange={(e) => setRestockEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="flex-1 bg-black border border-white/10 px-4 py-3 text-xs outline-none focus:border-white/30 transition-all placeholder:text-white/20"
                            />
                            <button
                              type="submit"
                              disabled={restockStatus === 'loading'}
                              className="px-5 py-3 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all"
                            >
                              {restockStatus === 'loading' ? '...' : 'Alert Me'}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Related Assets (Compatible Modules) */}
                {relatedProducts.length > 0 && (
                  <div className="space-y-6">
                    <p className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                      <Zap size={12} className="text-enark-red" /> Compatible Assets
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {relatedProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            playClick();
                            onProductChange?.(p);
                          }}
                          className="flex items-center gap-4 p-3 border border-white/10 bg-white/5 hover:border-white/30 transition-all text-left group"
                        >
                          <div className="w-16 h-16 bg-black overflow-hidden shrink-0">
                            <img src={p.metadata?.image} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-tight truncate">{p.name}</p>
                            <p className="text-[11px] font-black text-enark-red mono mt-1">₹{p.base_price.toLocaleString()}</p>
                          </div>
                          <ArrowRight size={14} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <Info size={12} /> Description
                  </p>
                  <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                    <p className="text-xs leading-relaxed text-white/60 uppercase tracking-widest">
                      {product.description || 'HIGH-PERFORMANCE ARCHITECTURAL GARMENT. ENGINEERED FOR BRUTALIST ENVIRONMENTS.'}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-white/60">
                      <div className="flex flex-col gap-1">
                        <span>GSM: {product.metadata?.gsm || '450'}</span>
                        <span>FABRIC: {product.metadata?.material || '100% COTTON'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>ORIGIN: INDIA_NODE_01</span>
                        <span>STATUS: UPLINK_STABLE</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                  className="w-full bg-enark-red text-white py-8 font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-6 group"
                >
                   <ShoppingBag size={20} />
                   {isUnlocked 
                     ? (isVaultItem 
                        ? 'Claim Vault Asset' 
                        : (product.metadata?.is_preorder ? 'Pre-order' : 'Add to Cart')) 
                     : 'Locked'}
                   <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
