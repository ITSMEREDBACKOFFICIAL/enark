'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import Link from 'next/link';

export default function RegistryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArchive() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchArchive();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground mono selection:bg-enark-red">
      <Header />

      
      <div className="pt-48 px-6 md:px-12 border-b border-foreground/10 pb-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-enark-red">
              <Lock size={16} className="animate-pulse" />
              <span className="text-xs font-black tracking-[0.5em] uppercase">Storage_Unit_04 // Registry_Logs</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter-x uppercase">Central_Registry</h1>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 p-4 px-8 space-y-1 text-right">
             <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest">SECURED_ASSETS</p>
             <p className="text-xl font-black text-enark-red leading-none">{products.length.toString().padStart(3, '0')}</p>
          </div>
        </div>
      </div>

      <section className="px-6 md:px-12 py-24 min-h-[60vh]">
        <div className="max-w-screen-2xl mx-auto">
          {loading ? (
             <div className="h-96 flex items-center justify-center text-enark-red animate-pulse">
               FETCHING_REGISTRY_DATA...
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
              {products.map((product, i) => (
                <Link key={product.id} href={`/shop?product_id=${product.id}`}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: (i % 6) * 0.1 }}
                    className="bg-background p-8 group relative overflow-hidden flex flex-col justify-between aspect-square cursor-pointer"
                  >
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black text-enark-red uppercase tracking-widest">{product.category}</p>
                          <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{product.name}</h3>
                        </div>
                        <span className="text-[11px] font-bold text-foreground/60">EN-{product.id.slice(0, 8)}</span>
                      </div>
                      <div className="w-12 h-1 bg-foreground/10" />
                    </div>

                    <div className="absolute inset-0 opacity-40 md:opacity-20 group-hover:opacity-60 transition-opacity duration-1000 grayscale-0 md:grayscale">
                      <img src={product.metadata?.image} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-foreground/60 uppercase tracking-widest">
                        <div>
                          <p>Status: {product.is_active ? 'STABLE' : 'DECOMMISSIONED'}</p>
                          <p>Hash: {product.id.slice(-12)}</p>
                        </div>
                        <div className="text-right">
                          <p>Entry_Date: {new Date(product.created_at).toLocaleDateString()}</p>
                          <p>Class: REGISTRY_S1</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-2xl font-black text-foreground group-hover:text-enark-red transition-colors mono">₹{product.base_price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-[11px] font-black text-foreground/60 group-hover:text-foreground transition-colors">
                            <Lock size={10} />
                            <span>VIEW_DATA</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] opacity-[0.03]" />
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <RecentlyViewed />
      <Footer />
    </main>
  );
}
