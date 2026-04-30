'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Plus, Trash2, ExternalLink, Grid, List, Copy, CheckCircle2, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MediaVault() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    // Extract all unique images from products metadata
    const { data: products } = await supabase.from('products').select('id, name, metadata');
    
    if (products) {
      const images = products
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

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Vault HUD */}
      <div className="p-8 border border-white/10 bg-black flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-enark-red/10 border border-enark-red/20 text-enark-red">
              <ImageIcon size={24} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase tracking-tighter-x">ASSET_MEDIA_VAULT</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Centralized repository for high-fidelity visual assets</p>
           </div>
        </div>
        <div className="flex gap-4">
           <div className="flex border border-white/10 p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/20'}`}
              >
                <List size={16} />
              </button>
           </div>
           <button className="bg-enark-red text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3">
              <Plus size={14} /> UPLOAD_NODE
           </button>
        </div>
      </div>

      {/* Media Content */}
      {loading ? (
        <div className="h-96 border border-dashed border-white/10 flex items-center justify-center text-white/20 uppercase tracking-[0.5em] animate-pulse">
           Accessing_Vault_Nodes...
        </div>
      ) : assets.length === 0 ? (
        <div className="h-96 border border-dashed border-white/10 flex items-center justify-center text-white/20 uppercase tracking-[0.5em]">
           Vault_Empty_Awaiting_Asset_Uplink
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6' : 'space-y-4'}>
           {assets.map((asset) => (
              <div key={asset.id} className={`group bg-black border border-white/10 relative overflow-hidden transition-all hover:border-enark-red ${viewMode === 'list' ? 'flex items-center p-4 gap-8' : ''}`}>
                 {/* Preview */}
                 <div className={`${viewMode === 'grid' ? 'aspect-square' : 'w-20 h-20'} overflow-hidden bg-white/5`}>
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                    />
                 </div>

                 {/* Info */}
                 <div className={`flex-1 ${viewMode === 'grid' ? 'p-4' : ''}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-enark-red transition-colors truncate">
                       {asset.name}
                    </p>
                    <p className="text-[9px] text-white/20 uppercase font-mono mt-1">{asset.type}</p>
                 </div>

                 {/* Actions */}
                 <div className={viewMode === 'grid' ? 'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4' : 'flex gap-2'}>
                    <button 
                      onClick={() => copyToClipboard(asset.url, asset.id)}
                      className={`p-3 border border-white/10 transition-all ${copiedId === asset.id ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-white/5 hover:border-white'}`}
                    >
                       {copiedId === asset.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <button className="p-3 bg-white/5 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all">
                       <Trash2 size={16} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* Storage Protocol */}
      <div className="p-8 border border-dashed border-white/10 bg-black/50 space-y-4">
         <div className="flex items-center gap-4 text-white/40">
            <Activity size={16} />
            <h4 className="text-[10px] font-black uppercase tracking-widest">STORAGE_PROTOCOL_V2</h4>
         </div>
         <p className="text-[9px] text-white/20 uppercase leading-relaxed max-w-2xl font-mono">
            Assets are mirrored across multiple global edge nodes for maximum delivery speed. Deleting an asset from the vault will not remove it from the primary database manifest unless the reference is manually severed.
         </p>
      </div>
    </div>
  );
}
