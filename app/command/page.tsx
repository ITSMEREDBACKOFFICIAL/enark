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
import CareerManager from '@/components/admin/CareerManager';
import MediaVault from '@/components/admin/MediaVault';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'offers' | 'users' | 'settings' | 'neural' | 'media' | 'drop' | 'models' | 'audit' | 'careers'>('overview');
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
    
    // Restore tab from localStorage
    const savedTab = localStorage.getItem('enark_admin_active_tab') as any;
    if (savedTab) {
      setActiveTab(savedTab);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('enark_admin_active_tab', activeTab);
  }, [activeTab]);

  const tabGroups = [
    {
      group: 'COMMERCE',
      tabs: [
        { id: 'overview', label: 'OVERVIEW', icon: BarChart3 },
        { id: 'inventory', label: 'INVENTORY', icon: Box },
        { id: 'orders', label: 'ORDERS', icon: Truck },
        { id: 'offers', label: 'OFFERS', icon: Gift },
        { id: 'users', label: 'CUSTOMERS', icon: Users },
      ]
    },
    {
      group: 'ENARK LABS',
      tabs: [
        { id: 'neural', label: 'NEURAL AI', icon: Cpu },
        { id: 'media', label: 'MEDIA VAULT', icon: Globe },
        { id: 'drop', label: 'DROP MANAGER', icon: Package },
        { id: 'careers', label: 'CAREERS', icon: Activity },
      ]
    },
    {
      group: 'SYSTEM',
      tabs: [
        { id: 'audit', label: 'AUDIT LOG', icon: Terminal },
        { id: 'settings', label: 'SETTINGS', icon: Settings },
      ]
    }
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
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row mono selection:bg-enark-red selection:text-white dark">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col gap-12 bg-black">
        <div>
          <h1 className="text-3xl font-black tracking-tighter-x mb-2 text-white">COMMAND</h1>
          <div className="flex items-center gap-2 text-enark-red">
            <Terminal size={14} />
            <p className="text-xs font-bold uppercase tracking-widest">ENARK_OS v2.1</p>
          </div>
        </div>

        {/* Lockdown Status HUD */}
        <div className={`p-4 border flex items-center justify-between transition-all duration-700 ${isLockdownActive ? 'border-enark-red bg-enark-red/5 text-enark-red' : 'border-green-600/20 bg-green-600/5 text-green-600'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLockdownActive ? 'bg-enark-red' : 'bg-green-600'}`} />
            <p className="text-[11px] font-black uppercase tracking-widest">
              {isLockdownActive ? 'LOCKDOWN_ACTIVE' : 'SYSTEM_ONLINE'}
            </p>
          </div>
          <Shield size={12} />
        </div>

        <nav className="flex flex-col gap-8">
          {tabGroups.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 px-4">{group.group}</p>
              <div className="flex flex-col gap-1">
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between p-4 text-xs font-black tracking-[0.3em] transition-all border ${
                      activeTab === tab.id ? 'bg-white border-white text-black' : 'border-transparent text-white/60 hover:border-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <tab.icon size={16} />
                      {tab.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={() => window.location.href = '/account'}
            className="w-full flex items-center justify-center gap-2 p-4 border border-white/5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
             VIEW_AS_CUSTOMER
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 border border-white/5 text-xs text-white/60 hover:text-enark-red hover:border-enark-red transition-all"
          >
            <LogOut size={14} /> TERMINATE_SESSION
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto pb-32 md:pb-12 bg-black min-w-0">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12 border-b border-white/10 pb-12">
          <div className="w-full xl:w-auto">
            <p className="text-enark-red text-[10px] md:text-xs font-black mb-2 uppercase tracking-[0.2em]">Sector_Access // {activeTab}</p>
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter-x uppercase text-white break-all md:break-normal">{activeTab}</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <a 
              href="/"
              target="_blank"
              className="bg-white/5 border border-white/10 px-6 py-4 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest hover:border-white transition-all flex items-center justify-center gap-3 text-white"
            >
              <ExternalLink size={14} /> PREVIEW_STORE
            </a>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className={`px-8 py-4 md:py-3 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isUpdating ? 'bg-white/10 text-white/40 cursor-not-allowed shadow-none' : 'bg-enark-red text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}
            >
              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              {isUpdating ? 'SYNCING_PROTOCOL...' : 'EXECUTE_UPDATE'}
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <FinancialIntelligence />}
          {activeTab === 'inventory' && <ProductManager />}
          {activeTab === 'orders' && <LogisticsManager />}
          {activeTab === 'offers' && <OfferManager />}
          {activeTab === 'users' && <OperativeManager />}
          {activeTab === 'neural' && <NeuralCore />}
          {activeTab === 'media' && <MediaVault />}
          {activeTab === 'drop' && <DropManager />}
          {activeTab === 'careers' && <CareerManager />}
          {activeTab === 'audit' && <AuditLog />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-white/10 flex overflow-x-auto p-2 z-50 hide-scrollbar">
        {tabGroups.flatMap(g => g.tabs).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 p-3 min-w-[80px] transition-all ${
              activeTab === tab.id ? 'text-enark-red' : 'text-white/40'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
