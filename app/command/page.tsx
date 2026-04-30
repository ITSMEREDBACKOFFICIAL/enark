'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Package, 
  Ruler, 
  Zap, 
  BarChart3, 
  Terminal,
  Users,
  Percent,
  Truck,
  Globe,
  LogOut,
  ExternalLink,
  Cpu,
  RefreshCw,
  Activity,
  Box,
  Shield,
  Gift
} from 'lucide-react';
import FinancialIntelligence from '@/components/admin/FinancialIntelligence';
import ProductManager from '@/components/admin/ProductManager';
import SystemSettings from '@/components/admin/SystemSettings';
import LogisticsManager from '@/components/admin/LogisticsManager';
import OfferManager from '@/components/admin/OfferManager';
import NeuralCore from '@/components/admin/NeuralCore';
import DropManager from '@/components/admin/DropManager';
import AuditLog from '@/components/admin/AuditLog';
import OperativeManager from '@/components/admin/OperativeManager';
import ModelSubmissions from '@/components/admin/ModelSubmissions';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'intelligence' | 'drop' | 'logistics' | 'settings' | 'neural' | 'offers' | 'audit' | 'operatives' | 'media' | 'models'>('intelligence');
  const [isMobile, setIsMobile] = useState(false);
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkLockdown() {
      const { data } = await supabase.from('app_config').select('is_maintenance_mode').eq('id', 'main').single();
      if (data) setIsLockdownActive(data.is_maintenance_mode);
    }
    checkLockdown();
    
    // Refresh status every 30s
    const interval = setInterval(checkLockdown, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
    { id: 'intelligence', label: 'INTELLIGENCE', icon: BarChart3 },
    { id: 'inventory', label: 'INVENTORY', icon: Box },
    { id: 'logistics', label: 'LOGISTICS', icon: Truck },
    { id: 'offers', label: 'OFFERS', icon: Gift },
    { id: 'models', label: 'MODEL APPLICATIONS', icon: Users },
    { id: 'neural', label: 'NEURAL_CORE [AI]', icon: Cpu },
    { id: 'drop', label: 'LAUNCH', icon: Zap },
    { id: 'operatives', label: 'OPERATIVES', icon: Users },
    { id: 'media', label: 'MEDIA_VAULT', icon: Box },
    { id: 'audit', label: 'AUDIT', icon: Shield },
    { id: 'settings', label: 'SYSTEM', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    // Broadcast a system-wide update event via Supabase Realtime
    const channel = supabase.channel('system_sync');
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'system_update',
      payload: { timestamp: new Date().toISOString(), trigger: 'manual_admin_sync' },
    });

    // Simulate system delay for aesthetic
    setTimeout(() => {
      setIsUpdating(false);
      supabase.removeChannel(channel);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row mono selection:bg-enark-red selection:text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 border-r-1 border-white/10 p-8 flex-col gap-12 bg-black">
        <div>
          <h1 className="text-3xl font-black tracking-tighter-x mb-2">COMMAND</h1>
          <div className="flex items-center gap-2 text-enark-red">
            <Terminal size={14} />
            <p className="text-xs font-bold uppercase tracking-widest">ENARK_OS v2.1</p>
          </div>
        </div>

        {/* Lockdown Status HUD */}
        <div className={`p-4 border-1 flex items-center justify-between transition-all duration-700 ${isLockdownActive ? 'border-enark-red bg-enark-red/5 text-enark-red' : 'border-green-500/20 bg-green-500/5 text-green-500'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLockdownActive ? 'bg-enark-red' : 'bg-green-500'}`} />
            <p className="text-[11px] font-black uppercase tracking-widest">
              {isLockdownActive ? 'LOCKDOWN_ACTIVE' : 'SYSTEM_ONLINE'}
            </p>
          </div>
          <Shield size={12} />
        </div>

        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-between p-4 text-xs font-black tracking-[0.3em] transition-all border-1 ${
                activeTab === tab.id ? 'bg-enark-red border-enark-red text-white' : 'border-transparent text-white/60 hover:border-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <tab.icon size={16} />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-6 bg-white/5 border-1 border-white/10">
            <p className="text-[11px] text-white/60 mb-2 uppercase">Core_Health</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={`h-4 w-full ${i <= 5 ? 'bg-green-500' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/account'}
            className="w-full flex items-center justify-center gap-2 p-4 border-1 border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
             VIEW_AS_CUSTOMER
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 border-1 border-white/10 text-xs text-white/60 hover:text-enark-red hover:border-enark-red transition-all"
          >
            <LogOut size={14} /> TERMINATE_SESSION
          </button>
        </div>

        {/* System Health Widget */}
        <div className="mt-auto pt-8 border-t border-white/10 space-y-6">
          <div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">
               <span>CORE_TEMPERATURE</span>
               <span>38°C</span>
            </div>
            <div className="w-full h-1 bg-white/5">
               <motion.div 
                 animate={{ width: ["20%", "45%", "30%"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="h-full bg-enark-red" 
               />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">DB_UPLINK: OK</span>
             </div>
             <Activity size={12} className="text-white/20" />
          </div>
        </div>
        {/* Quick Access Legend */}
        <div className="mt-8 pt-8 border-t border-white/10 opacity-20 group-hover:opacity-40 transition-opacity">
           <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-4">Quick_Access_Protocol</p>
           <div className="space-y-2 mono text-[8px] uppercase">
              <div className="flex justify-between"><span>[G] GLOBAL_STATS</span> <span>⌘1</span></div>
              <div className="flex justify-between"><span>[I] INVENTORY</span> <span>⌘2</span></div>
              <div className="flex justify-between"><span>[L] LOGISTICS</span> <span>⌘3</span></div>
              <div className="flex justify-between"><span>[S] SETTINGS</span> <span>⌘4</span></div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto pb-32 md:pb-12 bg-[#050505]">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b-1 border-white/10 pb-12">
          <div>
            <p className="text-enark-red text-xs font-black mb-2 uppercase">Sector_Access // {activeTab}</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter-x uppercase">{activeTab}</h2>
          </div>
          <div className="flex gap-4">
            <a 
              href="/"
              target="_blank"
              className="bg-white/5 border-1 border-white/10 px-6 py-3 text-xs font-black uppercase tracking-widest hover:border-white transition-all flex items-center gap-3"
            >
              <ExternalLink size={14} /> PREVIEW_STORE
            </a>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className={`px-8 py-3 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${isUpdating ? 'bg-white/10 text-white/40 cursor-not-allowed shadow-none' : 'bg-enark-red text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}
            >
              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {isUpdating ? 'SYNCING_PROTOCOL...' : 'EXECUTE_UPDATE'}
            </button>
          </div>
        </header>

        {/* Global Activity Feed Ribbon */}
        <div className="mb-12 flex bg-white/5 border border-white/10 overflow-hidden">
           <div className="bg-enark-red text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={10} /> LIVE_FEED
           </div>
           <div className="flex-1 py-2 px-6 flex items-center gap-8 overflow-hidden whitespace-nowrap">
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-12 text-[9px] font-black uppercase tracking-[0.2em] text-white/40"
              >
                 <span>[SESSION_INITIATED] :: ROOT_ADMIN_UPLINK_SUCCESSFUL</span>
                 <span>[SYSTEM_REPORT] :: ALL_NODES_OPERATIONAL</span>
                 <span>[INTELLIGENCE] :: SALES_TRAJECTORY_STABLE</span>
                 <span>[SECURITY] :: ENCRYPTION_LEVEL_MAXIMUM</span>
                 <span>[LOGISTICS] :: 0_PENDING_EXCEPTIONS_DETECTED</span>
              </motion.div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'intelligence' && <FinancialIntelligence />}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'inventory' && <ProductManager />}
          {activeTab === 'logistics' && <LogisticsManager />}
          {activeTab === 'offers' && <OfferManager />}
          {activeTab === 'neural' && <NeuralCore />}
          {activeTab === 'drop' && <DropManager />}
          {activeTab === 'audit' && <AuditLog />}
          {activeTab === 'operatives' && <OperativeManager />}
          {activeTab === 'media' && <MediaVault />}
          {activeTab === 'models' && <ModelSubmissions />}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t-1 border-white/20 grid grid-cols-5 p-2 z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 p-3 transition-all ${
              activeTab === tab.id ? 'text-enark-red' : 'text-white/60'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-xs font-black">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
