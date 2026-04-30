'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductDetails from '@/components/product/ProductDetails';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentlyViewed } from '@/store/useRecentlyViewed';
import { useAudio } from '@/hooks/useAudio';
import { Filter, Grid, List as ListIcon, Search } from 'lucide-react';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { useSearchParams } from 'next/navigation';

export default function ShopAllPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { playClick, playHum } = useAudio();
  const addRecentlyViewed = useRecentlyViewed((state) => state.addItem);
  const searchParams = useSearchParams();

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
            setSelectedProduct(product);
            setIsDetailsOpen(true);
          }
        }
      }
    }
    fetchProducts();
  }, [searchParams]);

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
  }, [categoryFilter, searchQuery, products]);

  const categories = ['ALL', 'FORMAL', 'TRADITIONAL', 'STREETWEAR'];

  return (
    <main className="min-h-screen bg-[#050505] text-white mono selection:bg-enark-red">
      <Header />
      
      {/* Stark Aesthetic Header */}
      <div className="pt-[140px] px-6 md:px-12 border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-1">
            <span className="text-enark-red text-[10px] font-black uppercase tracking-[0.4em]">CATALOG_NODE // READY</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter-x uppercase">SHOP ALL</h1>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { playClick(); setCategoryFilter(cat); }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border transition-all ${
                  categoryFilter === cat ? 'bg-white text-black border-white' : 'border-white/10 text-white/40 hover:text-white hover:border-white/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stark Grid */}
      <section className="px-6 md:px-12 py-12 min-h-[60vh]">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="bg-black border border-white/10 p-6 flex flex-col space-y-6 relative transition-all duration-300 hover:border-white/40 cursor-pointer group shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                  onClick={() => {
                    playHum();
                    setSelectedProduct(product);
                    setIsDetailsOpen(true);
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
                  {/* Image wrapper with fixed padding layout */}
                  <div className="aspect-[4/5] bg-neutral-950 overflow-hidden relative border border-white/5">
                    {product.metadata?.image && (
                      <img 
                        src={product.metadata.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale-0 md:grayscale group-hover:grayscale-0"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] font-black bg-white/10 backdrop-blur-sm text-white/80 px-2 py-1 tracking-widest uppercase">
                        {product.category || 'ASSET'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing/Meta split */}
                  <div className="flex justify-between items-center pt-2">
                    <h3 className="text-xs font-black uppercase tracking-widest leading-none truncate flex-1 group-hover:text-enark-red transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-xs font-bold text-enark-red mono whitespace-nowrap pl-4">
                      ₹{product.base_price.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 opacity-20 mono">
              <Search size={48} />
              <p className="text-xs font-black uppercase tracking-[0.5em]">No products found</p>
            </div>
          )}
        </div>
      </section>

      <ProductDetails 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        product={selectedProduct} 
        onProductChange={(p) => {
          setSelectedProduct(p);
          addRecentlyViewed({
            id: p.id,
            name: p.name,
            price: p.base_price,
            image: p.metadata?.image,
            category: p.category,
            slug: p.slug
          });
        }}
      />

      <RecentlyViewed />
      <Footer />
    </main>
  );
}
