'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Clock, Search, Activity, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();

    // Enable Real-time for Audit Logs
    const channel = supabase
      .channel('audit_log_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        const newLog = payload.new;
        setLogs(prev => [{
          id: newLog.id,
          action: newLog.action,
          staff: newLog.staff_email || 'SYSTEM',
          target: newLog.target || 'N/A',
          time: new Date(newLog.created_at).toLocaleString(),
          status: newLog.status
        }, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setLogs(data.map(log => ({
          id: log.id,
          action: log.action,
          staff: log.staff_email || 'SYSTEM',
          target: log.target || 'N/A',
          time: new Date(log.created_at).toLocaleString(),
          status: log.status
        })));
      }
    } catch (e) {
      console.error('Audit Log Sync Error:', e);
    }
    setLoading(false);
  }

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.staff.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-12">
      {/* Header HUD */}
      <div className="p-6 md:p-8 border border-white/10 bg-black flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="p-3 md:p-4 bg-enark-red/10 border border-enark-red/20 text-enark-red flex-shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter-x">SECURITY_AUDIT_LOG</h3>
              <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.3em] leading-relaxed">Monitoring all staff nodes for system integrity</p>
           </div>
        </div>
        <div className="flex bg-white/5 border border-white/10 p-1 w-full xl:w-96">
           <Search size={14} className="text-white/20 m-3 flex-shrink-0" />
           <input 
             type="text" 
             placeholder="SEARCH_MANIFEST..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="flex-1 bg-transparent border-none outline-none text-[10px] uppercase tracking-widest p-2"
           />
        </div>
      </div>

      {/* Log Terminal */}
      <div className="border border-white/10 bg-black overflow-hidden font-mono">
        <div className="bg-white/5 p-4 border-b border-white/10 overflow-x-auto hide-scrollbar px-6 md:px-8">
           <div className="flex justify-between items-center min-w-[500px]">
             <div className="flex gap-8 text-[10px] text-white/40 uppercase tracking-widest">
                <span className="w-64">ACTION</span>
                <span className="hidden md:block w-48">STAFF_NODE</span>
                <span className="hidden md:block w-48">TARGET_NODE</span>
             </div>
             <div className="flex gap-8 text-[10px] text-white/40 uppercase tracking-widest">
                <span>TIME</span>
                <span>STATUS</span>
             </div>
           </div>
        </div>

        <div className="divide-y divide-white/5">
           {loading ? (
             <div className="p-20 text-center text-white/20 uppercase tracking-[0.5em] animate-pulse text-[10px]">Scanning_Buffer...</div>
           ) : filteredLogs.length === 0 ? (
             <div className="p-20 text-center text-white/20 uppercase tracking-[0.5em] text-[10px]">No_Events_Detected</div>
           ) : (
             filteredLogs.map((log) => (
               <div key={log.id} className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 group hover:bg-white/5 transition-all">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-12 flex-1 w-full md:w-auto">
                     <div className="md:w-64">
                        <p className="text-[11px] font-bold text-white group-hover:text-enark-red transition-colors">[{log.action}]</p>
                     </div>
                     <div className="flex md:w-48 items-center gap-2">
                        <User size={10} className="text-white/20 flex-shrink-0" />
                        <span className="text-[10px] text-white/60 truncate max-w-[200px] md:max-w-none">{log.staff}</span>
                     </div>
                     <div className="md:w-48">
                        <span className="text-[10px] text-white/40 truncate block md:inline">:: {log.target}</span>
                     </div>
                  </div>
                  <div className="flex justify-between md:justify-end gap-4 md:gap-8 items-center w-full md:w-auto pt-2 md:pt-0 border-t border-white/5 md:border-none">
                     <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase flex items-center gap-2">
                           <Clock size={10} /> {log.time}
                        </span>
                     </div>
                     <div className={`text-[9px] font-black px-2 py-1 border flex-shrink-0 ${log.status === 'SUCCESS' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-enark-red/20 text-enark-red bg-enark-red/5'}`}>
                        {log.status}
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Encryption Banner */}
      <div className="p-6 border border-dashed border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-4 text-white/20">
            <Activity size={14} />
            <span className="text-[9px] uppercase tracking-[0.4em] text-center sm:text-left">ALL_SESSIONS_ARE_END_TO_END_ENCRYPTED</span>
         </div>
         <p className="text-[9px] text-white/10 uppercase tracking-widest">Build_2.1.09_Neural_Core</p>
      </div>
    </div>
  );
}
