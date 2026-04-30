'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCart } from '@/store/useCart';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import ProductDetails from '../product/ProductDetails';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  base_price: number;
  category: string;
  slug: string;
  metadata?: {
    image?: string;
    material?: string;
    gsm?: string;
  };
  variants?: Array<{
    id: string;
    sku: string;
    stock_quantity: number;
  }>;
}

export default function ShiftingHorizon() {
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const addRecentlyViewed = useRecentlyViewed((state) => state.addItem);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAdmin(
          session.user.app_metadata?.role === 'admin' || 
          session.user.user_metadata?.role === 'admin' || 
          session.user.email === 'boddurunagabushan@gmail.com'
        );
      }
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        // Group by category
        const grouped = data.reduce((acc: Record<string, Product[]>, product: Product) => {
          const cat = (product.category || 'COLLECTION').toUpperCase();
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {});
        setProductsByCategory(grouped);
      }
    }
    fetchProducts();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'variants' }, () => fetchProducts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (Object.keys(productsByCategory).length === 0) return null;

  return (
    <div className="bg-black w-full min-h-screen pt-[120px] pb-32 overflow-hidden">
      {Object.entries(productsByCategory).map(([category, products], index) => (
        <CategorySection 
          key={category} 
          category={category} 
          products={products} 
          index={index}
          onViewDetails={(product: Product) => {
            setSelectedProduct(product);
            setIsDetailsOpen(true);
            addRecentlyViewed({
              id: product.id,
              name: product.name,
              price: product.base_price,
              image: product.metadata?.image || '',
              category: product.category,
              slug: product.slug
            });
          }}
          onAcquire={(product: Product) => {
            addItem({
              id: product.id,
              variantId: product.variants?.[0]?.id || '',
              name: product.name,
              price: product.base_price,
              image: product.metadata?.image || '',
              quantity: 1,
              sku: product.variants?.[0]?.sku || ''
            });
          }}
          isAdmin={isAdmin}
        />
      ))}

      <ProductDetails 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        product={selectedProduct} 
      />
    </div>
  );
}

function CategorySection({ category, products, index, onViewDetails, onAcquire, isAdmin }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax effect for the background text
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.3, 0.1]);

  return (
    <section ref={containerRef} className="relative w-full py-24 border-b border-white/5">
      {/* Massive Background Title */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <motion.h2 
          style={{ y, opacity }}
          className="text-[25vw] font-black uppercase tracking-tighter text-white whitespace-nowrap leading-none mix-blend-overlay"
        >
          {category}
        </motion.h2>
      </div>

      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-12 flex justify-between items-end">
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter-x uppercase text-white/90">
            {category}
          </h3>
          <Link 
            href={`/shop?category=${category}`}
            className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-white/60 hover:text-enark-red transition-colors group"
          >
            Access All {category} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Scroll Carousel */}
        <div className="w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory px-6 md:px-12 pb-12">
          <div className="flex gap-8 w-max">
            {products.map((product: any) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={() => onViewDetails(product)}
                onAcquire={() => onAcquire(product)}
                isAdmin={isAdmin}
              />
            ))}
            
            {/* View All Card */}
            <Link 
              href={`/shop?category=${category}`}
              className="w-[300px] md:w-[400px] h-[450px] md:h-[600px] snap-center shrink-0 border border-white/10 bg-white/2 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-6 group"
            >
              <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center text-white/60 group-hover:text-enark-red group-hover:border-enark-red transition-all">
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-colors">SHOP ALL {category}</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onViewDetails, onAcquire, isAdmin }: any) {
  const variant = product.variants?.[0];

  return (
    <div className="w-[300px] md:w-[400px] shrink-0 snap-center group">
      <div 
        className="w-full h-[400px] md:h-[500px] bg-white/5 border border-white/10 relative overflow-hidden cursor-pointer"
        onClick={onViewDetails}
      >
        {/* Image */}
        <img 
          src={product.metadata?.image || 'https://via.placeholder.com/800'} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-4 left-4">
          <span className="text-[11px] font-black bg-black border border-white/20 px-2 py-1 uppercase tracking-widest text-white/80">
            {product.metadata?.material || 'PROTOTYPE'}
          </span>
        </div>

        {isAdmin && (
          <Link
            href={`/command?tab=inventory&id=${product.id}`}
            className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Manage
          </Link>
        )}

        {/* Hover Action Layer */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onAcquire(); }}
            className="w-full bg-enark-red text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Add to Cart
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="w-full border border-white/20 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-6 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter leading-none text-white/90 group-hover:text-white transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-bold text-enark-red mono whitespace-nowrap">
            ₹{product.base_price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
