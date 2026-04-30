'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Trash2, 
  Edit3,
  CheckCircle,
  XCircle,
  Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSystemAction } from '@/lib/audit';

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, variants(*)')
      .order('created_at', { ascending: false });
    
    if (data) setProducts(data);
    setLoading(false);
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && 
    (filter === 'all' || p.category.toLowerCase() === filter.toLowerCase())
  );

  async function toggleStatus(id: string, current: boolean) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !current })
      .eq('id', id);
    
    if (!error) {
      await logSystemAction('PRODUCT_STATUS_TOGGLED', `ASSET_${id.slice(0, 8)}`, { newStatus: !current });
      fetchProducts();
    }
  }

  async function archiveProduct(id: string) {
    if (confirm('Are you sure you want to completely PURGE this asset from the database? This cannot be undone.')) {
      await supabase.from('variants').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      
      if (!error) {
        await logSystemAction('PRODUCT_PURGED', `ASSET_${id.slice(0, 8)}`);
        fetchProducts();
      } else {
        alert('PURGE_FAILED: ' + error.message);
      }
    }
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Streetwear',
    base_price: 0,
    stock: 0,
  });
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ base_price: 0, stock: 0 });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const slug = newProduct.name.toLowerCase().replace(/ /g, '-');
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: newProduct.name,
        slug,
        category: newProduct.category,
        base_price: newProduct.base_price,
        is_active: true,
        metadata: { image: 'https://via.placeholder.com/800', gsm: '450', material: '100% RAW SILK' }
      })
      .select()
      .single();

    if (data && !error) {
      await supabase.from('variants').insert({
        product_id: data.id,
        sku: `AK-${slug.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        size: 'OS',
        color: 'RAW_WHITE',
        stock_quantity: newProduct.stock
      });

      await logSystemAction('PRODUCT_CREATED', data.name, { price: newProduct.base_price });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', category: 'Streetwear', base_price: 0, stock: 0 });
      fetchProducts();
    } else {
      alert('Error creating product: ' + error?.message);
    }
    setLoading(false);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('products')
      .update({ base_price: editForm.base_price })
      .eq('id', editingProduct.id);

    if (!error) {
      await supabase
        .from('variants')
        .update({ stock_quantity: editForm.stock })
        .eq('product_id', editingProduct.id);
      
      await logSystemAction('PRODUCT_UPDATED', editingProduct.name, { price: editForm.base_price, stock: editForm.stock });
      setEditingProduct(null);
      fetchProducts();
    } else {
      alert('UPDATE_FAILED: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl border border-white/20 bg-black p-12 relative"
            >
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white">CLOSE [X]</button>
              <h2 className="text-4xl font-black mb-8 tracking-tighter-x uppercase">Initialize_New_Batch</h2>
              <form onSubmit={handleAddProduct} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">ASSET_NAME</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="E.G. TECHNICAL_PARKA_V1"
                    className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/60 uppercase tracking-widest">CATEGORY</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all cursor-pointer">
                      <option value="Traditional">TRADITIONAL</option>
                      <option value="Formal">FORMAL</option>
                      <option value="Streetwear">STREETWEAR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/60 uppercase tracking-widest">UNIT_PRICE (INR)</label>
                    <input required type="number" value={newProduct.base_price} onChange={(e) => setNewProduct({...newProduct, base_price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/60 uppercase tracking-widest">INITIAL_UPLINK_STOCK</label>
                  <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-enark-red text-white py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                  {loading ? 'PROCESSING_UPLINK...' : 'COMMIT_NEW_BATCH'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-xl border border-white/20 bg-black p-12 relative">
              <button onClick={() => setEditingProduct(null)} className="absolute top-8 right-8 text-white/60 hover:text-white">CLOSE [X]</button>
              <h2 className="text-4xl font-black mb-2 tracking-tighter-x uppercase">Edit_Asset</h2>
              <p className="text-enark-red text-xs font-black mb-8 uppercase tracking-widest">{editingProduct.name}</p>
              <form onSubmit={handleEditProduct} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/60 uppercase tracking-widest">UNIT_PRICE (INR)</label>
                    <input required type="number" value={editForm.base_price} onChange={(e) => setEditForm({...editForm, base_price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/60 uppercase tracking-widest">TOTAL_STOCK</label>
                    <input required type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-white text-black py-6 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all">
                  {loading ? 'SYNCING_EDITS...' : 'UPDATE_ASSET_METADATA'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-8 border border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">TOTAL_ASSETS</p>
          <h4 className="text-4xl font-black">{products.length}</h4>
        </div>
        <div className="p-8 border border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">ACTIVE_DROPS</p>
          <h4 className="text-4xl font-black text-green-500">{products.filter(p => p.is_active).length}</h4>
        </div>
        <div className="p-8 border border-white/10 bg-black">
          <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">OUT_OF_STOCK</p>
          <h4 className="text-4xl font-black text-enark-red">{products.filter(p => p.variants?.some((v: any) => v.stock_quantity === 0)).length}</h4>
        </div>
      </div>

      <div className="p-4 border border-white/10 bg-black flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 w-full md:w-auto items-center gap-4 bg-white/5 px-6 py-1 border border-white/10">
          <Search size={16} className="text-white/60" />
          <input type="text" placeholder="FILTER_ASSET_VAULT..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none py-3 text-xs font-black uppercase tracking-widest w-full" />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-black border border-white/10 px-6 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-enark-red cursor-pointer">
            <option value="all">ALL_CATEGORIES</option>
            <option value="Traditional">TRADITIONAL</option>
            <option value="Formal">FORMAL</option>
            <option value="Streetwear">STREETWEAR</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-enark-red text-white px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:text-black transition-all">
            <Plus size={16} /> NEW_BATCH
          </button>
        </div>
      </div>

      <div className="border border-white/10 overflow-hidden bg-black">
        <table className="w-full text-left text-xs mono">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/60 uppercase">
              <th className="p-6">ASSET_IDENTITY</th>
              <th className="p-6">CATEGORY</th>
              <th className="p-6">UNIT_VALUE</th>
              <th className="p-6">TOTAL_STOCK</th>
              <th className="p-6">STATUS</th>
              <th className="p-6 text-right">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="p-6 bg-white/5 h-16" /></tr>)
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 group transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 overflow-hidden">
                      {p.metadata?.image && <img src={p.metadata.image} alt="" className="w-full h-full object-cover grayscale" />}
                    </div>
                    <div>
                      <p className="font-black text-xs group-hover:text-enark-red transition-colors">{p.name.toUpperCase()}</p>
                      <p className="text-[11px] text-white/60 uppercase tracking-widest">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6"><span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60">{p.category.toUpperCase()}</span></td>
                <td className="p-6 font-black text-enark-red text-xs">₹{p.base_price.toLocaleString()}</td>
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-black">{p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0)} UNITS</span>
                    <div className="w-24 h-1 bg-white/10">
                      <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0) / 100) * 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <button onClick={() => toggleStatus(p.id, p.is_active)} className={`flex items-center gap-2 font-black tracking-widest ${p.is_active ? 'text-green-500' : 'text-white/60'}`}>
                    {p.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {p.is_active ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingProduct(p); setEditForm({ base_price: p.base_price, stock: p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0) || 0 }); }} className="p-3 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => archiveProduct(p.id)} className="p-3 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all">
                      <Archive size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
