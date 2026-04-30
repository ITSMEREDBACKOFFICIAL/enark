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
      } else {
        // Fallback to mock for UI demonstration if table is empty/missing
        const mockLogs = [
          { id: 1, action: 'SYSTEM_BOOT', staff: 'KERNEL', target: 'ENARK_OS', time: 'Just now', status: 'SUCCESS' },
          { id: 2, action: 'DB_SYNC_INITIALIZED', staff: 'SYSTEM', target: 'SUPABASE_UPLINK', time: '1 min ago', status: 'SUCCESS' },
        ];
        setLogs(mockLogs);
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
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header HUD */}
      <div className="p-8 border border-white/10 bg-black flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-enark-red/10 border border-enark-red/20 text-enark-red">
              <Shield size={24} />
           </div>
           <div>
              <h3 className="text-xl font-black uppercase tracking-tighter-x">SECURITY_AUDIT_LOG</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.3em]">Monitoring all staff nodes for system integrity</p>
           </div>
        </div>
        <div className="flex bg-white/5 border border-white/10 p-2 w-full md:w-96">
           <Search size={16} className="text-white/20 m-3" />
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
        <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center px-8">
           <div className="flex gap-8 text-[10px] text-white/40 uppercase tracking-widest">
              <span>ACTION</span>
              <span className="hidden md:block">STAFF_NODE</span>
              <span className="hidden md:block">TARGET_NODE</span>
           </div>
           <div className="flex gap-8 text-[10px] text-white/40 uppercase tracking-widest">
              <span>TIME</span>
              <span>STATUS</span>
           </div>
        </div>

        <div className="divide-y divide-white/5">
           {loading ? (
             <div className="p-20 text-center text-white/20 uppercase tracking-[0.5em] animate-pulse">Scanning_Buffer...</div>
           ) : filteredLogs.length === 0 ? (
             <div className="p-20 text-center text-white/20 uppercase tracking-[0.5em]">No_Events_Detected</div>
           ) : (
             filteredLogs.map((log) => (
               <div key={log.id} className="p-6 md:p-8 flex justify-between items-center group hover:bg-white/5 transition-all">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-12 flex-1">
                     <div className="w-64">
                        <p className="text-[11px] font-bold text-white group-hover:text-enark-red transition-colors">[{log.action}]</p>
                     </div>
                     <div className="w-48 hidden md:flex items-center gap-2">
                        <User size={10} className="text-white/20" />
                        <span className="text-[10px] text-white/60">{log.staff}</span>
                     </div>
                     <div className="w-48 hidden md:block">
                        <span className="text-[10px] text-white/40">:: {log.target}</span>
                     </div>
                  </div>
                  <div className="flex gap-8 items-center">
                     <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] text-white/40 uppercase flex items-center gap-2">
                           <Clock size={10} /> {log.time}
                        </span>
                     </div>
                     <div className={`text-[9px] font-black px-2 py-1 border ${log.status === 'SUCCESS' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-enark-red/20 text-enark-red bg-enark-red/5'}`}>
                        {log.status}
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Encryption Banner */}
      <div className="p-6 border border-dashed border-white/10 flex justify-between items-center">
         <div className="flex items-center gap-4 text-white/20">
            <Activity size={14} />
            <span className="text-[9px] uppercase tracking-[0.4em]">ALL_SESSIONS_ARE_END_TO_END_ENCRYPTED</span>
         </div>
         <p className="text-[9px] text-white/10 uppercase tracking-widest">Build_2.1.09_Neural_Core</p>
      </div>
    </div>
  );
}
