'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Plus, Trash2, ExternalLink, Grid, List, Copy, CheckCircle2, Activity, Loader2, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MediaVault() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('id, name');
    if (data) setProducts(data);
  }

  async function fetchAssets() {
    setLoading(true);
    const { data: productsData } = await supabase.from('products').select('id, name, metadata');
    
    if (productsData) {
      const images = productsData
        .filter(p => p.metadata?.image)
        .map(p => ({
          id: p.id,
          name: p.name,
          url: p.metadata.image,
          type: 'PRODUCT_ASSET',
          timestamp: 'LINKED'
        }));
      setAssets(images);
    }
    setLoading(false);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('PRODUCT-IMAGES')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('PRODUCT-IMAGES')
        .getPublicUrl(filePath);

      setNewAssetUrl(publicUrl);
    } catch (error) {
      alert('UPLOAD_FAILED');
    } finally {
      setUploading(false);
    }
  };

  const handleLinkAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl || !targetProductId) return;
    
    setIsSubmitting(true);
    // Fetch current metadata first
    const { data: product } = await supabase.from('products').select('metadata').eq('id', targetProductId).single();
    
    const { error } = await supabase
      .from('products')
      .update({ 
        metadata: { 
          ...(product?.metadata || {}), 
          image: newAssetUrl 
        } 
      })
      .eq('id', targetProductId);

    if (!error) {
      setIsUploadModalOpen(false);
      setNewAssetUrl('');
      setTargetProductId('');
      fetchAssets();
    } else {
      alert('LINK_FAILED: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg border border-white/20 bg-black p-8 md:p-12 relative mono overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button onClick={() => setIsUploadModalOpen(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-white/40 hover:text-white uppercase text-[9px] md:text-[10px] font-black tracking-widest p-2">CLOSE [X]</button>
              
              <div className="flex items-center gap-4 mb-8">
                 <ImageIcon size={24} className="text-enark-red flex-shrink-0" />
                 <h3 className="text-lg md:text-xl font-black uppercase tracking-widest">LINK_ASSET_NODE</h3>
              </div>

              <form onSubmit={handleLinkAsset} className="space-y-6 md:space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">TARGET_PRODUCT</label>
                    <select 
                      required
                      value={targetProductId}
                      onChange={(e) => setTargetProductId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all cursor-pointer uppercase"
                    >
                      <option value="">SELECT_ASSET...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">ASSET_UPLINK</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="url" 
                        required
                        value={newAssetUrl}
                        onChange={(e) => setNewAssetUrl(e.target.value)}
                        placeholder="HTTPS://..."
                        className="flex-1 bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all"
                      />
                      <label className="flex items-center justify-center p-4 bg-white/10 border border-white/10 hover:border-enark-red cursor-pointer transition-all group min-h-[50px] sm:min-h-0 sm:w-14">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        {uploading ? <Loader2 size={20} className="animate-spin text-enark-red" /> : <Camera size={20} className="group-hover:text-enark-red" />}
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-enark-red text-white py-5 md:py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
                >
                  {isSubmitting ? <Activity size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isSubmitting ? 'UPLINKING...' : 'FINALIZE_UPLINK'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vault HUD */}
      <div className="p-6 md:p-8 border border-white/10 bg-black flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="p-3 md:p-4 bg-enark-red/10 border border-enark-red/20 text-enark-red flex-shrink-0">
              <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter-x">ASSET_MEDIA_VAULT</h3>
              <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.3em] leading-relaxed">Centralized repository for high-fidelity visual assets</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
           <div className="flex border border-white/10 p-1 justify-center sm:justify-start">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all flex-1 sm:flex-initial flex justify-center ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all flex-1 sm:flex-initial flex justify-center ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                <List size={16} />
              </button>
           </div>
           <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="bg-enark-red text-white px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(220,38,38,0.2)]"
           >
              <Plus size={14} /> UPLOAD_NODE
           </button>
        </div>
      </div>

      {/* Media Content */}
      {loading ? (
        <div className="h-96 border border-dashed border-white/10 flex items-center justify-center text-white/20 uppercase tracking-[0.5em] animate-pulse text-[10px]">
           Accessing_Vault_Nodes...
        </div>
      ) : assets.length === 0 ? (
        <div className="h-96 border border-dashed border-white/10 flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-[10px] text-center px-6">
           Vault_Empty_Awaiting_Asset_Uplink
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6' : 'space-y-3 md:space-y-4'}>
           {assets.map((asset) => (
              <div key={asset.id} className={`group bg-black border border-white/10 relative overflow-hidden transition-all hover:border-enark-red ${viewMode === 'list' ? 'flex items-center p-3 md:p-4 gap-4 md:gap-8' : ''}`}>
                 {/* Preview */}
                 <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-12 h-12 md:w-20 md:h-20'} overflow-hidden bg-white/5 flex-shrink-0`}>
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      loading="lazy"
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                    />
                 </div>

                 {/* Info */}
                 <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'p-3 md:p-4' : ''}`}>
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-enark-red transition-colors truncate">
                       {asset.name}
                    </p>
                    <p className="text-[8px] md:text-[9px] text-white/20 uppercase font-mono mt-1">{asset.type}</p>
                 </div>

                 {/* Actions */}
                 <div className={viewMode === 'grid' ? 'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4' : 'flex gap-2'}>
                    <button 
                      onClick={() => copyToClipboard(asset.url, asset.id)}
                      className={`p-2 md:p-3 border border-white/10 transition-all flex-shrink-0 ${copiedId === asset.id ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-white/5 hover:border-white'}`}
                    >
                       {copiedId === asset.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <button className="p-2 md:p-3 bg-white/5 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all flex-shrink-0">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Storage Protocol */}
      <div className="p-6 md:p-8 border border-dashed border-white/10 bg-black/50 space-y-4">
         <div className="flex items-center gap-4 text-white/40">
            <Activity size={16} className="flex-shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">STORAGE_PROTOCOL_V2</h4>
         </div>
         <p className="text-[9px] text-white/20 uppercase leading-relaxed max-w-2xl font-mono">
            Assets are mirrored across multiple global edge nodes for maximum delivery speed. Deleting an asset from the vault will not remove it from the primary database manifest unless the reference is manually severed.
         </p>
      </div>
    </div>
  );
}
