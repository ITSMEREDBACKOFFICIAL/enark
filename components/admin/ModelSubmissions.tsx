'use client';

import { useState, useEffect } from 'react';
import { Users, ToggleLeft, ToggleRight, Trash, Mail, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModelSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showButton, setShowButton] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    fetchConfig();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await fetch('/api/models');
      const data = await res.json();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    try {
      const res = await fetch('/api/models/config');
      const data = await res.json();
      setShowButton(data.showButton);
    } catch (e) {
      console.error(e);
    }
  }

  async function toggleVisibility() {
    try {
      const newStatus = !showButton;
      await fetch('/api/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showButton: newStatus })
      });
      setShowButton(newStatus);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Toggler HUD */}
      <div className="p-8 border-1 border-white/10 bg-black flex justify-between items-center">
        <div>
          <h3 className="mono text-xs font-black tracking-widest uppercase flex items-center gap-4">
            <Users size={16} className="text-enark-red" /> STOREFRONT_MODEL_UPLINK
          </h3>
          <p className="mono text-[10px] text-white/40 mt-1 uppercase tracking-wider">
            Toggle the visibility of the "Model For Us" button globally.
          </p>
        </div>
        <button 
          onClick={toggleVisibility}
          className="text-4xl text-white transition-all hover:scale-105"
        >
          {showButton ? <ToggleRight className="text-green-500 w-12 h-12" /> : <ToggleLeft className="text-white/20 w-12 h-12" />}
        </button>
      </div>

      {/* Applications Table */}
      <div className="border-1 border-white/10 bg-black overflow-hidden">
        <div className="p-6 border-b-1 border-white/10 bg-white/5 flex justify-between items-center">
          <h3 className="mono text-xs font-black tracking-widest uppercase">MODEL_ROSTER_MANIFEST</h3>
          <span className="mono text-[11px] bg-white/10 px-3 py-1 text-white font-black">
            COUNT: {submissions.length}
          </span>
        </div>

        <table className="w-full text-left text-xs mono border-collapse">
          <thead>
            <tr className="border-b-1 border-white/10 text-white/60 uppercase">
              <th className="p-6 text-[10px] tracking-[0.3em]">REF_ID</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">APPLICANT</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">VITAL_SPECS</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">PORTFOLIO</th>
              <th className="p-6 text-[10px] tracking-[0.3em]">SUBMITTED</th>
            </tr>
          </thead>
          <tbody className="divide-y-1 divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-white/60">DOWNLOADING_ROSTER_NODES...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-white/60 uppercase tracking-[0.5em]">NO_MODEL_APPLICATIONS_RECEIVED_YET</td></tr>
            ) : submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6 font-black group-hover:text-enark-red transition-colors">
                  #{sub.id}
                </td>
                <td className="p-6">
                  <p className="font-bold">{sub.name}</p>
                  <a href={`mailto:${sub.email}`} className="text-[10px] text-white/40 hover:text-white flex items-center gap-1 mt-1 lowercase">
                    <Mail size={10} /> {sub.email}
                  </a>
                </td>
                <td className="p-6">
                  <div className="text-[10px] space-y-1 text-white/70 uppercase">
                    <p><span className="text-white/40">HEIGHT:</span> {sub.height} CM</p>
                    <p><span className="text-white/40">WAIST:</span> {sub.waist} IN</p>
                    <p><span className="text-white/40">CHEST:</span> {sub.chest} IN</p>
                  </div>
                </td>
                <td className="p-6">
                  {sub.portfolio ? (
                    <a 
                      href={sub.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-white/10 border border-white/20 text-[10px] hover:bg-white hover:text-black transition-all inline-block uppercase"
                    >
                      View_Portfolio
                    </a>
                  ) : (
                    <span className="text-white/20">NONE_LINKED</span>
                  )}
                </td>
                <td className="p-6 text-white/40 text-[10px]">
                  {new Date(sub.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
