'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Globe, 
  Terminal, 
  Users, 
  ShieldCheck, 
  Save,
  Zap,
  Bell,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { logSystemAction } from '@/lib/audit';

export default function SystemSettings() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [marquee, setMarquee] = useState('ENARK // SYSTEM ONLINE // NEW DROP LIVE');
  const [banner, setBanner] = useState('FREE SHIPPING ON ORDERS OVER ₹5000');
  const [brandName, setBrandName] = useState('ENARK');
  const [primaryColor, setPrimaryColor] = useState('#DC2626');
  const [heroTitle, setHeroTitle] = useState('THE_HORIZON_COLLECTION');
  const [heroSubtitle, setHeroSubtitle] = useState('SYNERGETIC_STREETWEAR_SYSTEMS');
  const [footerText, setFooterText] = useState('ENARK // QUANTUM_RETAIL_OS_V4');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [codEnabled, setCodEnabled] = useState(true);
  const [tickerLabels, setTickerLabels] = useState<string[]>(['ENCRYPTED_PAYMENT_SECURE', 'NODE_DISPATCH_FREE', 'EXPRESS_ARRIVAL_READY', 'SECURE_UPLINK_ESTABLISHED']);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'OPERATIVE' });

  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchConfig();
    fetchStaff();
    fetchLogs();

    // Enable Real-time for System Config
    const channel = supabase
      .channel('system_config_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' }, (payload) => {
        if (payload.new && payload.new.id === 'main') {
          const data = payload.new;
          setMaintenance(data.is_maintenance_mode);
          setMarquee(data.marquee_text || '');
          setBanner(data.announcement_banner || '');
          setBrandName(data.brand_name || 'ENARK');
          setPrimaryColor(data.primary_color || '#DC2626');
          setHeroTitle(data.hero_title || 'THE_HORIZON_COLLECTION');
          setHeroSubtitle(data.hero_subtitle || 'SYNERGETIC_STREETWEAR_SYSTEMS');
          setFooterText(data.footer_text || 'ENARK // QUANTUM_RETAIL_OS_V4');
          setFreeShippingThreshold(data.free_shipping_threshold || 5000);
          setCodEnabled(data.cod_enabled !== undefined ? data.cod_enabled : true);
          if (data.ticker_labels) setTickerLabels(data.ticker_labels);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchConfig() {
    console.log('Fetching System Config...');
    const { data, error } = await supabase.from('app_config').select('*').eq('id', 'main').single();
    if (data && !error) {
      setMaintenance(data.is_maintenance_mode);
      setMarquee(data.marquee_text || '');
      setBanner(data.announcement_banner || '');
      setBrandName(data.brand_name || 'ENARK');
      setPrimaryColor(data.primary_color || '#DC2626');
      setHeroTitle(data.hero_title || 'THE_HORIZON_COLLECTION');
      setHeroSubtitle(data.hero_subtitle || 'SYNERGETIC_STREETWEAR_SYSTEMS');
      setFooterText(data.footer_text || 'ENARK // QUANTUM_RETAIL_OS_V4');
      setFreeShippingThreshold(data.free_shipping_threshold || 5000);
      setCodEnabled(data.cod_enabled !== undefined ? data.cod_enabled : true);
      if (data.ticker_labels) setTickerLabels(data.ticker_labels);
    } else {
      console.error('Fetch Config Error:', error);
    }
  }

  async function fetchStaff() {
    setLoadingStaff(true);
    const { data, error } = await supabase.from('staff_members').select('*');
    if (data) setStaff(data);
    setLoadingStaff(false);
  }

  async function handleSave() {
    setLoading(true);
    console.log('Saving System Config:', { maintenance, marquee, banner });
    
    const { data, error } = await supabase.from('app_config').upsert({
      id: 'main',
      is_maintenance_mode: maintenance,
      marquee_text: marquee,
      announcement_banner: banner,
      brand_name: brandName,
      primary_color: primaryColor,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      footer_text: footerText,
      free_shipping_threshold: freeShippingThreshold,
      cod_enabled: codEnabled,
      ticker_labels: tickerLabels,
      updated_at: new Date().toISOString()
    }).select();

    if (!error) {
      console.log('Save successful:', data);
      await logSystemAction('GLOBAL_CONFIG_UPDATED', 'app_config', { marquee, brandName, freeShippingThreshold, codEnabled });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      console.error('Save failed:', error);
      alert('SAVE_FAILED: ' + error.message);
    }
    setLoading(false);
  }

  async function fetchLogs() {
    const { data } = await supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(3);
    if (data) setRecentLogs(data);
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newStaff.name) return;
    
    const { error } = await supabase.from('staff_members').insert([
      { name: newStaff.name, role: newStaff.role }
    ]);

    if (!error) {
      setNewStaff({ name: '', role: 'OPERATIVE' });
      setIsAddingStaff(false);
      fetchStaff();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="space-y-6 md:space-y-8">
        {/* Logistics Configuration */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <Truck size={16} className="text-enark-red" /> Logistics_Config
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Free_Shipping_Threshold (₹)</p>
              <input 
                type="number" 
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
              />
            </div>
            
            <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 border-1 border-white/10 group hover:border-white/20 transition-all gap-4">
              <div>
                <p className="text-[11px] md:text-xs font-black mb-1">COD_ENABLED</p>
                <p className="text-[9px] md:text-[11px] text-white/60 uppercase leading-relaxed">Allow Cash on Delivery at checkout.</p>
              </div>
              <button 
                onClick={() => setCodEnabled(!codEnabled)}
                className={`w-12 h-6 border-1 p-1 transition-all flex-shrink-0 ${codEnabled ? 'bg-green-600 border-green-600' : 'border-white/20'}`}
              >
                <div className={`h-full w-4 bg-white transition-all ${codEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-xs font-black tracking-widest flex items-center gap-4 uppercase">
              <Globe size={16} className="text-enark-red" /> Global_State
            </h3>
            {saved && <span className="text-[10px] md:text-[11px] font-black text-green-500 animate-pulse">SYSTEM_SYNC_SUCCESS</span>}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 border-1 border-white/10 group hover:border-white/20 transition-all gap-4">
              <div>
                <p className="text-[11px] md:text-xs font-black mb-1">MAINTENANCE_MODE</p>
                <p className="text-[9px] md:text-[11px] text-white/60 uppercase leading-relaxed">Lockout all public access to the storefront.</p>
              </div>
              <button 
                onClick={() => setMaintenance(!maintenance)}
                className={`w-12 h-6 border-1 p-1 transition-all flex-shrink-0 ${maintenance ? 'bg-enark-red border-enark-red' : 'border-white/20'}`}
              >
                <div className={`h-full w-4 bg-white transition-all ${maintenance ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-white text-black py-4 md:py-5 text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
            >
              <Save size={14} /> {loading ? 'SYNCING...' : 'SAVE_GLOBAL_CONFIG'}
            </button>
          </div>
        </div>

        {/* Content Management */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <Terminal size={16} className="text-enark-red" /> Content_Uplink
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Marquee_Sequence</p>
              <input 
                type="text" 
                value={marquee}
                onChange={(e) => setMarquee(e.target.value)}
                placeholder="SYSTEM_STATUS_MESSAGE..." 
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Announcement_Banner</p>
              <input 
                type="text" 
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="PROMO_UPLINK_MESSAGE..." 
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Product_Ticker_Labels (Comma-Separated)</p>
              <textarea 
                value={tickerLabels.join(', ')}
                onChange={(e) => setTickerLabels(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
                placeholder="LABEL_01, LABEL_02, LABEL_03..." 
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all resize-none h-24 custom-scrollbar" 
              />
            </div>
          </div>
        </div>

        {/* Brand Identity */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <ShieldCheck size={16} className="text-enark-red" /> Identity_Control
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Brand_Name</p>
                <input 
                  type="text" 
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] md:text-[11px] text-white/60 uppercase">System_Color</p>
                <div className="flex gap-2">
                   <input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 bg-transparent border-none cursor-pointer p-0 flex-shrink-0" 
                  />
                  <input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all uppercase" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Footer_Signature</p>
              <input 
                type="text" 
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Landing Page Content */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <Zap size={16} className="text-enark-red" /> Front_Uplink_Content
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Hero_Title</p>
              <input 
                type="text" 
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" 
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] md:text-[11px] text-white/60 uppercase">Hero_Subtitle</p>
              <textarea 
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all resize-none custom-scrollbar" 
              />
            </div>
          </div>
        </div>
        {/* Team Access */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <Users size={16} className="text-enark-red" /> Access_Permissions
          </h3>
          <div className="space-y-4">
            {loadingStaff ? (
              <p className="text-[11px] text-white/60 animate-pulse uppercase tracking-widest text-center py-4">FETCHING_STAFF_NODES...</p>
            ) : staff.length === 0 ? (
              <p className="text-[11px] text-white/60 uppercase tracking-widest text-center py-8">NO_STAFF_RECORDED</p>
            ) : staff.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-4 border-1 border-white/5 hover:border-white/20 transition-all bg-white/5 gap-4">
                <div className="flex gap-4 items-center overflow-hidden">
                  <div className="w-8 h-8 bg-enark-red flex items-center justify-center text-[11px] font-black flex-shrink-0">{s.name?.[0] || 'U'}</div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black truncate">{s.name || 'UNKNOWN_NODE'}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-tighter truncate">{s.role}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase text-green-500`}>
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
            {isAddingStaff ? (
              <motion.form 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddStaff}
                className="space-y-4 p-4 border-1 border-enark-red/30 bg-enark-red/5"
              >
                <input 
                  autoFocus
                  type="text"
                  placeholder="STAFF_NAME"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full bg-black border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red"
                />
                <select 
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full bg-black border-1 border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red"
                >
                  <option value="OPERATIVE">OPERATIVE</option>
                  <option value="COMMANDER">COMMANDER</option>
                  <option value="INTEL_OFFICER">INTEL_OFFICER</option>
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-enark-red py-3 text-[10px] font-black uppercase tracking-widest text-white">CONFIRM</button>
                  <button type="button" onClick={() => setIsAddingStaff(false)} className="flex-1 bg-white/10 py-3 text-[10px] font-black uppercase tracking-widest text-white/60">CANCEL</button>
                </div>
              </motion.form>
            ) : (
              <button 
                onClick={() => setIsAddingStaff(true)}
                className="w-full mt-4 border-1 border-dashed border-white/20 py-5 text-[10px] md:text-xs text-white/40 hover:text-white hover:border-white transition-all uppercase tracking-[0.2em] font-black"
              >
                + Add_Staff_Node
              </button>
            )}
          </div>
        </div>


        {/* Security Logs */}
        <div className="p-6 md:p-8 border-1 border-white/10 bg-black">
          <h3 className="text-xs font-black tracking-widest mb-6 md:mb-8 flex items-center gap-4 uppercase">
            <ShieldCheck size={16} className="text-enark-red" /> Security_Uplink
          </h3>
          <div className="space-y-3 mono text-[10px] md:text-[11px] text-white/60">
             {recentLogs.length === 0 ? (
               <div className="text-[10px] text-white/20 uppercase tracking-widest text-center py-4">AWAITING_EVENTS...</div>
             ) : recentLogs.map((log, i) => (
               <div key={log.id} className="flex justify-between border-b-1 border-white/5 pb-2 gap-4">
                  <span className="truncate">[{log.action}]</span>
                  <span className="flex-shrink-0 uppercase opacity-60 text-[9px] md:text-[11px]">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
