'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Globe, 
  Users, 
  Clock, 
  MapPin, 
  X,
  Mail,
  UserCheck,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logSystemAction } from '@/lib/audit';

export default function CareerManager() {
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'applicants'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [showButton, setShowButton] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'DESIGN',
    location: 'REMOTE',
    type: 'FULL_TIME',
    description: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
    fetchConfig();

    const channel = supabase
      .channel('careers_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_postings' }, () => {
        fetchJobs();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_config' }, (payload) => {
        if (payload.new && payload.new.id === 'main') {
          setShowButton(payload.new.show_careers_button);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchJobs() {
    setLoading(true);
    const { data } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  async function fetchApplicants() {
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setApplicants(data);
    } catch (e) {
      console.error('APPLICANT_FETCH_FAILED:', e);
    }
  }

  async function fetchConfig() {
    const { data } = await supabase.from('app_config').select('show_careers_button').eq('id', 'main').single();
    if (data) setShowButton(data.show_careers_button);
  }

  async function toggleGlobalVisibility() {
    const nextState = !showButton;
    const { error } = await supabase.from('app_config').update({ show_careers_button: nextState }).eq('id', 'main');
    if (!error) {
      setShowButton(nextState);
      logSystemAction('CAREERS_VISIBILITY_TOGGLED', 'SYSTEM', { visible: nextState });
    }
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('job_postings').insert([newJob]).select();
    if (!error) {
      logSystemAction('JOB_POSTING_CREATED', newJob.title);
      alert('JOB_POSTING_SUCCESS: Position uplinked to careers node.');
      setIsAddModalOpen(false);
      setNewJob({ title: '', department: 'DESIGN', location: 'REMOTE', type: 'FULL_TIME', description: '' });
      fetchJobs();
    } else {
      alert('UPLINK_FAILURE: ' + error.message);
    }
  }

  async function deleteJob(id: string, title: string) {
    if (confirm(`PURGE_POSITION: Are you sure you want to remove the [${title}] posting?`)) {
      const { error } = await supabase.from('job_postings').delete().eq('id', id);
      if (!error) {
        logSystemAction('JOB_POSTING_REMOVED', title);
        fetchJobs();
      }
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Visibility Control */}
      <div className="p-6 md:p-8 border border-white/10 bg-black flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="flex items-center gap-4 md:gap-6">
           <div className="p-3 md:p-4 bg-enark-red/10 border border-enark-red/20 text-enark-red flex-shrink-0">
              <Briefcase className="w-5 h-5 md:w-6 md:h-6" />
           </div>
           <div>
              <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter-x">CAREER_&_CASTING_UPLINK</h3>
              <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-[0.3em] leading-relaxed">Global recruitment visibility and talent roster management</p>
           </div>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto gap-6 pt-4 md:pt-0 border-t border-white/5 md:border-none">
           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">STOREFRONT_VISIBILITY:</span>
           <button 
             onClick={toggleGlobalVisibility}
             className="text-3xl md:text-4xl text-white transition-all hover:scale-105"
           >
             {showButton ? <ToggleRight className="text-green-500 w-10 h-10 md:w-12 md:h-12" /> : <ToggleLeft className="text-white/20 w-10 h-10 md:w-12 md:h-12" />}
           </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button 
          onClick={() => setActiveSubTab('jobs')}
          className={`flex-shrink-0 px-8 md:px-12 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'jobs' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
          Active_Postings
        </button>
        <button 
          onClick={() => setActiveSubTab('applicants')}
          className={`flex-shrink-0 px-8 md:px-12 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'applicants' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
        >
          Applicant_Roster ({applicants.length})
        </button>
      </div>

      {activeSubTab === 'jobs' ? (
        <div className="border border-white/10 bg-black overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex items-center gap-4">
                <Globe size={18} className="text-enark-red flex-shrink-0" />
                <h3 className="text-xs font-black tracking-[0.3em] uppercase">OPEN_POSITIONS_MANIFEST</h3>
             </div>
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="w-full sm:w-auto bg-white text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-enark-red hover:text-white transition-all flex items-center justify-center gap-2"
             >
                <Plus size={14} /> NEW_POSTING
             </button>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-12 md:p-20 text-center text-white/20 uppercase tracking-[0.5em] animate-pulse text-[10px]">Syncing_Nodes...</div>
            ) : jobs.length === 0 ? (
              <div className="p-12 md:p-20 text-center text-white/20 uppercase tracking-[0.5em] text-[10px]">No_Active_Postings_In_Buffer</div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-0 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4 md:gap-6 overflow-hidden w-full">
                    <div className="w-1 h-10 md:h-12 bg-enark-red flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter-x group-hover:text-enark-red transition-colors truncate">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                         <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase flex items-center gap-1"><Users size={10} /> {job.department}</span>
                         <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                         <span className="text-[9px] md:text-[10px] font-black text-white/40 uppercase flex items-center gap-1"><Clock size={10} /> {job.type}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteJob(job.id, job.title)} className="p-3 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all flex-shrink-0 self-end sm:self-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="border border-white/10 bg-black overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs mono min-w-[800px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white/60 uppercase">
                  <th className="p-6 text-[10px] tracking-widest">APPLICANT</th>
                  <th className="p-6 text-[10px] tracking-widest">VITAL_SPECS</th>
                  <th className="p-6 text-[10px] tracking-widest">PORTFOLIO</th>
                  <th className="p-6 text-[10px] tracking-widest">SUBMITTED</th>
                  <th className="p-6 text-right text-[10px] tracking-widest">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applicants.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-white/40 uppercase text-[10px] tracking-widest">No_Applications_Received</td></tr>
                ) : applicants.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-xs uppercase">{sub.name}</p>
                      <p className="text-[10px] text-white/40 mt-1">{sub.email}</p>
                    </td>
                    <td className="p-6">
                      <div className="text-[10px] text-white/60 uppercase">
                        H:{sub.height}CM | W:{sub.waist}" | C:{sub.chest}"
                      </div>
                    </td>
                    <td className="p-6">
                      <a href={sub.portfolio} target="_blank" className="text-enark-red hover:underline uppercase text-[10px] font-black">View_Link</a>
                    </td>
                    <td className="p-6 text-white/40 text-[10px] uppercase">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 border border-white/10 hover:border-enark-red hover:text-enark-red transition-all">
                        <Mail size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl border border-white/20 bg-black flex flex-col max-h-[90vh] mono"
            >
              <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter-x uppercase">Create_New_Posting</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/40 hover:text-white transition-colors p-2"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddJob} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">POSITION_TITLE</label>
                  <input required type="text" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="E.G. LEAD_VISUAL_OPERATIVE" className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DEPARTMENT</label>
                    <select value={newJob.department} onChange={(e) => setNewJob({...newJob, department: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all cursor-pointer">
                      <option value="DESIGN">DESIGN</option>
                      <option value="CASTING">CASTING</option>
                      <option value="ENGINEERING">ENGINEERING</option>
                      <option value="MARKETING">MARKETING</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">JOB_TYPE</label>
                    <select value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all cursor-pointer">
                      <option value="FULL_TIME">FULL_TIME</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="INTERN">INTERN</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">LOCATION</label>
                  <input type="text" value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="E.G. REMOTE / NEW_DELHI" className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">DESCRIPTION</label>
                  <textarea value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="POSITION_REQUIREMENTS_AND_OBJECTIVES..." className="w-full bg-white/5 border border-white/10 p-4 text-[13px] md:text-xs outline-none focus:border-enark-red transition-all h-32 md:h-40 resize-none custom-scrollbar" />
                </div>
              </form>
              <div className="p-6 md:p-8 border-t border-white/10 bg-white/5">
                <button type="submit" className="w-full bg-enark-red text-white py-4 md:py-6 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                  <Plus size={16} /> UPLINK_POSTING
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
