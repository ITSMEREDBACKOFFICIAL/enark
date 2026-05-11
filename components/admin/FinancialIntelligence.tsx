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

    // Sync financial data on order changes
    const channel = supabase
      .channel('financial_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchIntelligence();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleExportCSV = () => {
    if (recentOrders.length === 0) return;
    const headers = ['Order_ID', 'Email', 'Amount', 'Status', 'Date'];
    const rows = recentOrders.map(o => [
      o.id,
      o.email,
      o.total_amount,
      o.status,
      new Date(o.created_at).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ENARK_FINANCE_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logSystemAction('FINANCE_EXPORT_GENERATED', 'SYSTEM_CORE');
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Financial HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'GROSS_SALES', val: formatCurrency(stats.grossSales), change: '+12%', pos: true },
          { label: 'NET_REVENUE', val: formatCurrency(stats.netRevenue), change: '+8%', pos: true },
          { label: 'TAX_LIABILITY', val: formatCurrency(stats.taxLiability), change: '+4%', pos: false },
          { label: 'AVG_PROFIT_MARGIN', val: `${stats.avgMargin}%`, change: '-2%', pos: false },
        ].map((s) => (
          <div key={s.label} className="p-6 md:p-8 border-1 border-white/10 bg-black relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-1 w-full ${s.pos ? 'bg-green-500' : 'bg-enark-red'}`} />
            <p className="mono text-[10px] md:text-[11px] text-white/60 mb-4 tracking-[0.3em] uppercase">{s.label}</p>
            <h4 className="text-2xl md:text-3xl font-black mb-2">{s.val}</h4>
            <div className={`flex items-center gap-2 text-[10px] md:text-xs font-bold ${s.pos ? 'text-green-500' : 'text-enark-red'}`}>
              {s.pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.change} vs PREV_{timeRange}
            </div>
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 md:p-8 border-1 border-white/10 bg-black flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <h3 className="text-xs font-black tracking-widest uppercase">REVENUE_FLOW // RECENT_ORDERS</h3>
            <button 
              onClick={handleExportCSV}
              className="mono text-[10px] md:text-xs text-white/60 flex items-center gap-2 hover:text-white transition-colors"
            >
              <Download size={14} /> EXPORT_CSV
            </button>
          </div>
          
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex items-end justify-between h-64 gap-2 min-w-[500px]">
              {chartData.map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    style={{ height: `${h}%` }}
                    className={`w-full transition-all duration-500 ${i === chartData.length - 1 ? 'bg-enark-red' : 'bg-white/10 group-hover:bg-white/30'}`}
                  />
                  {recentOrders[i] && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity mono text-[10px] whitespace-nowrap">
                      {formatCurrency(recentOrders[i].total_amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8 mono text-[9px] md:text-[11px] text-white/60 uppercase tracking-widest">
            <span>START_SESSION</span>
            <span className="hidden sm:inline">DATA_SYNC_ACTIVE</span>
            <span>CURRENT_BATCH</span>
          </div>
        </div>

        <div className="lg:col-span-4 p-6 md:p-8 border-1 border-white/10 bg-black flex flex-col">
          <div className="flex items-center gap-4 mb-8 text-enark-red">
            <AlertCircle size={16} />
            <h3 className="text-xs font-black tracking-widest uppercase">RECENT_ORDERS</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] lg:max-h-96 pr-2 custom-scrollbar">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-white/60 uppercase tracking-widest text-center py-12">NO_ORDERS_DETECTED</p>
            ) : recentOrders.map((order, i) => (
              <div key={i} className="p-4 border-1 border-white/5 bg-white/5 hover:border-enark-red transition-all group">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <p className="mono text-[11px] font-bold text-white/80 truncate">{order.email}</p>
                  <span className="mono text-[10px] text-white/40 flex-shrink-0">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-base md:text-lg font-black">{formatCurrency(order.total_amount)}</p>
                  <div className={`text-[10px] font-black px-2 py-0.5 ${order.status === 'paid' || order.status === 'delivered' ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white/60'}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-1 border-white/10 overflow-hidden bg-black">
        <div className="bg-white/5 p-4 md:p-6 border-b-1 border-white/10 flex justify-between items-center">
          <h3 className="text-xs font-black tracking-[0.4em] uppercase flex items-center gap-4">
            <Activity size={16} /> CUSTOMER_INTELLIGENCE
          </h3>
        </div>
        <div className="p-8 md:p-12 text-center">
           <p className="text-[10px] md:text-xs text-white/60 uppercase tracking-[0.5em] leading-relaxed">SYSTEM_WAITING_FOR_DATA_UPLINK // TELEMETRY_ACTIVE</p>
        </div>
      </div>
    </div>
  );
}
