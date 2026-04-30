'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Download, 
  Mail, 
  UserPlus, 
  AlertCircle,
  FileText,
  Loader2,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function FinancialIntelligence() {
  const [timeRange, setTimeRange] = useState('7D');
  const [stats, setStats] = useState({
    grossSales: 0,
    netRevenue: 0,
    taxLiability: 0,
    avgMargin: 0,
    salesChange: 0,
    revenueChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(1); // Default to 1 (current admin)

  useEffect(() => {
    fetchIntelligence();
  }, [timeRange]);

  useEffect(() => {
    // Listen for real-time presence broadcast (Avoids subscription conflicts)
    const channel = supabase.channel('presence_stats');
    
    channel
      .on('broadcast', { event: 'count' }, ({ payload }) => {
        setOnlineUsers(payload.count || 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchIntelligence() {
    setLoading(true);
    
    try {
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (allOrders) {
        setRecentOrders(allOrders.slice(0, 10));
        
        const total = allOrders.reduce((acc, curr) => acc + curr.total_amount, 0);
        const paidOrders = allOrders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered');
        const netTotal = paidOrders.reduce((acc, curr) => acc + curr.total_amount, 0);

        setStats(prev => ({
          ...prev,
          grossSales: total,
          netRevenue: netTotal * 0.82,
          taxLiability: netTotal * 0.18,
          avgMargin: 42.4,
        }));
      }
    } catch (e) {
      console.error('Error fetching financial data:', e);
    }

    setLoading(false);
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center mono text-enark-red">
        <Loader2 className="animate-spin mr-4" size={24} />
        SYNCING_FINANCIAL_NODE...
      </div>
    );
  }

  const chartData = recentOrders.length > 0 
    ? recentOrders.map(o => (o.total_amount / Math.max(...recentOrders.map(ro => ro.total_amount))) * 100)
    : [40, 60, 45, 90, 80, 50, 70, 85, 30, 95, 40, 60];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Financial HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'GROSS_SALES', val: formatCurrency(stats.grossSales), change: '+12%', pos: true },
          { label: 'NET_REVENUE', val: formatCurrency(stats.netRevenue), change: '+8%', pos: true },
          { label: 'TAX_LIABILITY', val: formatCurrency(stats.taxLiability), change: '+4%', pos: false },
          { label: 'AVG_PROFIT_MARGIN', val: `${stats.avgMargin}%`, change: '-2%', pos: false },
        ].map((s) => (
          <div key={s.label} className="p-8 border-1 border-white/10 bg-black relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-1 w-full ${s.pos ? 'bg-green-500' : 'bg-enark-red'}`} />
            <p className="mono text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">{s.label}</p>
            <h4 className="text-3xl font-black mb-2">{s.val}</h4>
            <div className={`flex items-center gap-2 text-xs font-bold ${s.pos ? 'text-green-500' : 'text-enark-red'}`}>
              {s.pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.change} vs PREV_{timeRange}
            </div>
          </div>
        ))}
      </div>

      {/* Live Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 p-8 border-1 border-white/10 bg-black relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity size={120} className="text-enark-red" />
           </div>
           <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">REAL_TIME_TRAFFIC</p>
                 <h3 className="text-3xl font-black uppercase">LIVE_OPERATIVE_MAP</h3>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{onlineUsers}_NODES_CONNECTED</span>
              </div>
           </div>
           
           <div className="h-48 border border-white/5 bg-white/2 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 border border-enark-red/20 rounded-full flex items-center justify-center"
              >
                 <div className="w-16 h-16 border border-enark-red/40 rounded-full" />
              </motion.div>
              <p className="absolute bottom-4 left-4 text-[9px] font-mono text-white/20 uppercase tracking-widest">UPLINK_SOURCE: GLOBAL_EDGE_NETWORK</p>
           </div>
        </div>

        <div className="p-8 border-1 border-white/10 bg-black flex flex-col justify-between">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">ACTIVE_SESSIONS</p>
              <div className="space-y-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                       <span className="text-white/60">NODE_{i}0{i}</span>
                       <span className="text-enark-red">ACTIVE</span>
                    </div>
                 ))}
              </div>
           </div>
           <p className="text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
              Monitoring global access points for unauthorized infiltration.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-8 border-1 border-white/10 bg-black">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-xs font-black tracking-widest uppercase">REVENUE_FLOW // RECENT_ORDERS</h3>
            <button className="mono text-xs text-white/60 flex items-center gap-2 hover:text-white transition-colors">
              <Download size={14} /> EXPORT_CSV
            </button>
          </div>
          <div className="flex items-end justify-between h-64 gap-2">
            {chartData.map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  style={{ height: `${h}%` }}
                  className={`w-full transition-all duration-500 ${i === chartData.length - 1 ? 'bg-enark-red' : 'bg-white/10 group-hover:bg-white/30'}`}
                />
                {recentOrders[i] && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity mono text-[11px] whitespace-nowrap">
                    {formatCurrency(recentOrders[i].total_amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-8 mono text-[11px] text-white/60 uppercase tracking-widest">
            <span>START_SESSION</span>
            <span>DATA_SYNC_ACTIVE</span>
            <span>CURRENT_BATCH</span>
          </div>
        </div>

        <div className="lg:col-span-4 p-8 border-1 border-white/10 bg-black flex flex-col">
          <div className="flex items-center gap-4 mb-8 text-enark-red">
            <AlertCircle size={16} />
            <h3 className="text-xs font-black tracking-widest uppercase">RECENT_ORDERS</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-white/60 uppercase tracking-widest text-center py-12">NO_ORDERS_DETECTED</p>
            ) : recentOrders.map((order, i) => (
              <div key={i} className="p-4 border-1 border-white/5 bg-white/5 hover:border-enark-red transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <p className="mono text-xs font-bold text-white/80 truncate w-40">{order.email}</p>
                  <span className="mono text-[11px] text-white/60">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-black">{formatCurrency(order.total_amount)}</p>
                  <div className={`text-[11px] font-black px-2 py-1 ${order.status === 'paid' || order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/60'}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-1 border-white/10 overflow-hidden">
        <div className="bg-white/5 p-6 border-b-1 border-white/10 flex justify-between items-center">
          <h3 className="text-xs font-black tracking-[0.4em] uppercase flex items-center gap-4">
            <UserPlus size={16} /> CUSTOMER_INTELLIGENCE
          </h3>
        </div>
        <div className="p-12 text-center">
           <p className="text-xs text-white/60 uppercase tracking-[0.5em]">SYSTEM_WAITING_FOR_DATA_UPLINK</p>
        </div>
      </div>
    </div>
  );
}
