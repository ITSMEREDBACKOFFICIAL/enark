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
  Archive,
  Upload,
  Camera,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSystemAction } from '@/lib/audit';

export default function ProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('inventory_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'variants' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      // NOTE: Ensure 'product-images' bucket exists in Supabase Storage with public access
      const { error: uploadError } = await supabase.storage
        .from('PRODUCT-IMAGES')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('PRODUCT-IMAGES')
        .getPublicUrl(filePath);

      if (type === 'new') {
        setNewProduct({ ...newProduct, image: publicUrl });
      } else {
        setEditForm({ ...editForm, image: publicUrl });
      }
      alert('FILE_UPLOAD_SUCCESS: Asset node mirrored to global edge network.');
    } catch (error: any) {
      alert('FILE_UPLOAD_FAILURE: Ensure "product-images" bucket exists in Supabase Storage. Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'Streetwear',
    base_price: 0,
    stock: 0,
    image: '',
    gsm: '',
    material: '',
    size_chart: ''
  });

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ 
    base_price: 0, 
    stock: 0,
    description: '',
    image: '',
    gsm: '',
    material: '',
    size_chart: ''
  });

  async function handleCreateProduct(e: React.FormEvent) {
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
        description: newProduct.description,
        is_active: true,
        metadata: {
          stock: newProduct.stock,
          gsm: newProduct.gsm,
          material: newProduct.material,
          image: newProduct.image,
          size_chart: newProduct.size_chart
        }
      })
      .select()
      .single();

    if (!error && data) {
      // Create initial variant for stock tracking
      await supabase.from('variants').insert({
        product_id: data.id,
        sku: `AK-${slug.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        size: 'OS',
        color: 'RAW_WHITE',
        stock_quantity: newProduct.stock
      });

      logSystemAction('PRODUCT_CREATED', `NODE_${data.id}`);
      alert('PROVISIONING_SUCCESS: New asset node deployed to production manifest.');
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', category: 'Streetwear', base_price: 0, stock: 0, image: '', gsm: '', material: '', size_chart: '' });
      fetchProducts();
    } else {
      alert('PROVISIONING_FAILURE: ' + error?.message);
    }
    setLoading(false);
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from('products')
      .update({
        base_price: editForm.base_price,
        description: editForm.description,
        metadata: {
          ...editingProduct.metadata,
          stock: editForm.stock,
          gsm: editForm.gsm,
          material: editForm.material,
          image: editForm.image,
          size_chart: editForm.size_chart
        }
      })
      .eq('id', editingProduct.id);

    if (!error) {
      // Update first variant stock
      const { data: variants } = await supabase.from('variants').select('id').eq('product_id', editingProduct.id);
      if (variants && variants.length > 0) {
        await supabase.from('variants').update({ stock_quantity: editForm.stock }).eq('id', variants[0].id);
      }

      logSystemAction('PRODUCT_MODIFIED', `NODE_${editingProduct.id}`);
      alert('INTEGRITY_VERIFIED: Asset properties updated in global manifest.');
      setEditingProduct(null);
      fetchProducts();
    } else {
      alert('MODIFICATION_FAILURE: ' + error.message);
    }
    setLoading(false);
  }

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
        await logSystemAction('PRODUCT_DELETED', `PRODUCT_${id.slice(0, 8)}`);
        fetchProducts();
      } else {
        alert('PURGE_FAILED: ' + error.message);
      }
    }
  }

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Create Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full h-full md:h-auto md:max-w-2xl border-x md:border border-white/20 bg-black flex flex-col max-h-screen md:max-h-[95vh] relative"
            >
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-20">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter-x uppercase">Deploy_New_Asset</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors p-2"><X className="w-6 h-6 md:w-5 md:h-5" /></button>
              </div>

              <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">PRODUCT_NAME</label>
                    <input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="E.G. TECHNICAL PARKA V1" className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DESCRIPTION</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="PRODUCT_SPECIFICATIONS_AND_DETAILS..." className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all h-32 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">CATEGORY</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all cursor-pointer h-[52px]">
                      <option value="Traditional">TRADITIONAL</option>
                      <option value="Formal">FORMAL</option>
                      <option value="Streetwear">STREETWEAR</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">PRICE (INR)</label>
                    <input required type="number" value={newProduct.base_price} onChange={(e) => setNewProduct({...newProduct, base_price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">INITIAL_STOCK</label>
                    <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">GSM</label>
                    <input type="text" value={newProduct.gsm} onChange={(e) => setNewProduct({...newProduct, gsm: e.target.value})} placeholder="E.G. 450" className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">MATERIAL</label>
                    <input type="text" value={newProduct.material} onChange={(e) => setNewProduct({...newProduct, material: e.target.value})} placeholder="E.G. 100% RAW SILK" className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  
                  <div className="space-y-4 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">ASSET_MEDIA_UPLINK</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input type="text" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} placeholder="EXTERNAL_URL_OR_UPLOAD..." className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                      </div>
                      <label className="flex items-center justify-center p-4 bg-white/10 border border-white/10 hover:border-enark-red cursor-pointer transition-all group min-h-[52px]">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'new')} className="hidden" />
                        {uploading ? <Loader2 size={20} className="animate-spin text-enark-red" /> : <Camera size={20} className="group-hover:text-enark-red" />}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">SIZE_CHART (MD/TEXT)</label>
                    <textarea value={newProduct.size_chart} onChange={(e) => setNewProduct({...newProduct, size_chart: e.target.value})} placeholder="S: 38, M: 40, L: 42..." className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all h-32 resize-none" />
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 sticky bottom-0 z-20">
                <button 
                  type="submit" 
                  onClick={handleCreateProduct}
                  disabled={loading || uploading} 
                  className="w-full bg-enark-red text-white py-5 md:py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  {loading ? 'INITIALIZING_PROVISIONING...' : 'INITIALIZE_DEPLOYMENT'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }} 
              className="w-full h-full md:h-auto md:max-w-2xl border-x md:border border-white/20 bg-black flex flex-col max-h-screen md:max-h-[95vh]"
            >
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-20">
                <div>
                   <h2 className="text-xl md:text-2xl font-black tracking-tighter-x uppercase">Edit_Asset</h2>
                   <p className="text-enark-red text-[9px] font-black uppercase tracking-widest mt-1">NODE_{editingProduct.id.slice(0, 12)}</p>
                </div>
                <button onClick={() => setEditingProduct(null)} className="text-white/40 hover:text-white transition-colors p-2"><X className="w-6 h-6 md:w-5 md:h-5" /></button>
              </div>

              <form onSubmit={handleEditProduct} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DESCRIPTION</label>
                    <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all h-32 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">PRICE (INR)</label>
                    <input required type="number" value={editForm.base_price} onChange={(e) => setEditForm({...editForm, base_price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">TOTAL_STOCK</label>
                    <input required type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">GSM</label>
                    <input type="text" value={editForm.gsm} onChange={(e) => setEditForm({...editForm, gsm: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">MATERIAL</label>
                    <input type="text" value={editForm.material} onChange={(e) => setEditForm({...editForm, material: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                  </div>
                  
                  <div className="space-y-4 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">ASSET_MEDIA_UPDATE</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input type="text" value={editForm.image} onChange={(e) => setEditForm({...editForm, image: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                      </div>
                      <label className="flex items-center justify-center p-4 bg-white/10 border border-white/10 hover:border-enark-red cursor-pointer transition-all group min-h-[52px]">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'edit')} className="hidden" />
                        {uploading ? <Loader2 size={20} className="animate-spin text-enark-red" /> : <Camera size={20} className="group-hover:text-enark-red" />}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">SIZE_CHART</label>
                    <textarea value={editForm.size_chart} onChange={(e) => setEditForm({...editForm, size_chart: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all h-32 resize-none" />
                  </div>
                </div>
              </form>

              <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 sticky bottom-0 z-20">
                <button 
                  type="submit" 
                  onClick={handleEditProduct}
                  disabled={loading || uploading} 
                  className="w-full bg-white text-black py-5 md:py-6 font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-4"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {loading ? 'SYNCHRONIZING...' : 'FINALIZE_MANIFEST_UPDATE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="p-6 md:p-8 border border-white/10 bg-black">
          <p className="mono text-[10px] text-white/40 mb-4 tracking-[0.3em] uppercase">TOTAL PRODUCTS</p>
          <h4 className="text-3xl md:text-4xl font-black">{products.length}</h4>
        </div>
        <div className="p-6 md:p-8 border border-white/10 bg-black">
          <p className="mono text-[10px] text-white/40 mb-4 tracking-[0.3em] uppercase">ACTIVE</p>
          <h4 className="text-3xl md:text-4xl font-black text-green-500">{products.filter(p => p.is_active).length}</h4>
        </div>
        <div className="p-6 md:p-8 border border-white/10 bg-black sm:col-span-2 lg:col-span-1">
          <p className="mono text-[10px] text-white/40 mb-4 tracking-[0.3em] uppercase">OUT_OF_STOCK</p>
          <h4 className="text-3xl md:text-4xl font-black text-enark-red">{products.filter(p => p.variants?.some((v: any) => v.stock_quantity === 0)).length}</h4>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 w-full items-center gap-4 bg-white/5 px-4 md:px-6 py-1 border border-white/10">
          <Search size={16} className="text-white/60 flex-shrink-0" />
          <input type="text" placeholder="SEARCH PRODUCTS..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none py-4 text-[10px] md:text-xs font-black uppercase tracking-widest w-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-black border border-white/10 px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest outline-none focus:border-enark-red cursor-pointer w-full sm:w-auto h-[52px]">
            <option value="all">ALL CATEGORIES</option>
            <option value="Traditional">TRADITIONAL</option>
            <option value="Formal">FORMAL</option>
            <option value="Streetwear">STREETWEAR</option>
          </select>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-enark-red text-white px-8 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all w-full sm:w-auto h-[52px] shadow-[0_4px_20px_rgba(220,38,38,0.2)]">
            <Plus size={16} /> ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="border border-white/10 bg-black overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs mono min-w-[900px]">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-white/40 uppercase tracking-widest text-[10px]">
              <th className="p-6 font-black">PRODUCT</th>
              <th className="p-6 font-black">CATEGORY</th>
              <th className="p-6 font-black">PRICE</th>
              <th className="p-6 font-black">STOCK</th>
              <th className="p-6 font-black">STATUS</th>
              <th className="p-6 font-black text-right">OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && products.length === 0 ? (
              [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="p-6 bg-white/5 h-20" /></tr>)
            ) : filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-white/5 group transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                      {p.metadata?.image && <img src={p.metadata.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-black text-sm group-hover:text-enark-red transition-colors truncate">{p.name.toUpperCase()}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest truncate">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6"><span className="px-3 py-1 bg-white/5 border border-white/10 text-white/60 text-[10px]">{p.category.toUpperCase()}</span></td>
                <td className="p-6 font-black text-enark-red text-[11px] md:text-xs">₹{p.base_price.toLocaleString()}</td>
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-[10px] md:text-xs">{p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0)} UNITS</span>
                    <div className="w-20 md:w-24 h-1 bg-white/10">
                      <div className="h-full bg-green-500" style={{ width: `${Math.min(100, (p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0) / 100) * 100)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <button onClick={() => toggleStatus(p.id, p.is_active)} className={`flex items-center gap-2 font-black tracking-widest text-[9px] md:text-[10px] ${p.is_active ? 'text-green-500' : 'text-white/40'}`}>
                    {p.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {p.is_active ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { 
                      setEditingProduct(p); 
                      setEditForm({ 
                        base_price: p.base_price, 
                        stock: p.variants?.reduce((acc: number, v: any) => acc + v.stock_quantity, 0) || 0,
                        description: p.description || '',
                        image: p.metadata?.image || '',
                        gsm: p.metadata?.gsm || '',
                        material: p.metadata?.material || '',
                        size_chart: p.metadata?.size_chart || ''
                      }); 
                    }} className="p-3 border border-white/10 text-white/40 hover:border-enark-red hover:text-enark-red transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => archiveProduct(p.id)} className="p-3 border border-white/10 text-white/40 hover:border-enark-red hover:text-enark-red transition-all">
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
