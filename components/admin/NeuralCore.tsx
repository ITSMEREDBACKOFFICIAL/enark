'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, Terminal, Zap, ShieldCheck, Activity, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  type?: 'status' | 'data' | 'text';
}

export default function NeuralCore() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'NEURAL_CORE_INITIALIZED // ENARK_OS_V4 // READY_FOR_UPLINK', type: 'status' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Simulate AI Reasoning Sequence
    setTimeout(async () => {
      let response = '';
      const command = userMsg.toLowerCase();

      if (command.includes('inventory') || command.includes('stock')) {
        const { data } = await supabase.from('products').select('name, variants(stock_quantity)');
        const lowStock = data?.filter(p => p.variants.some((v: any) => v.stock_quantity < 10)) || [];
        
        if (lowStock.length > 0) {
          response = `CRITICAL_INVENTORY_ALERT: ${lowStock.length} items detected with sub-optimal stock levels. Primary concern: ${lowStock[0].name.toUpperCase()}. Suggesting immediate restock protocol.`;
        } else {
          response = "INVENTORY_STABLE: All asset nodes reporting optimal stock levels. No immediate action required.";
        }
      } else if (command.includes('sales') || command.includes('revenue')) {
        const { data } = await supabase.from('orders').select('total_amount');
        const total = data?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
        response = `FINANCIAL_SNAPSHOT: Total processed value across all nodes stands at ₹${total.toLocaleString()}. Trajectory: STABLE. Suggesting "Global Offer" drop to stimulate further uplink activity.`;
      } else if (command.includes('hello') || command.includes('hi')) {
        response = "GREETINGS_OPERATIVE. I am the ENARK Neural Core. I monitor system integrity, inventory flow, and financial trajectories. How can I assist your command today?";
      } else if (command.includes('drop') || command.includes('campaign')) {
        response = "CAMPAIGN_GEN: Suggesting 'NEURAL_OVERRIDE' drop. Theme: Monochrome Industrial. Recommended Discount: 20%. Global Code: NEURAL20. Ready for deployment?";
        setPendingAction({ type: 'GLOBAL_OFFER', code: 'NEURAL20', discount: 20 });
      } else if (pendingAction && (command.includes('yes') || command.includes('deploy') || command.includes('execute') || command.includes('ok'))) {
        if (pendingAction.type === 'GLOBAL_OFFER') {
          const { error } = await supabase.from('operative_offers').insert({
            code: pendingAction.code,
            assigned_email: 'GLOBAL',
            discount_percentage: pendingAction.discount,
            is_active: true,
            is_single_use: false
          });
          
          if (!error) {
            response = `EXECUTION_SUCCESS: Global offer code [${pendingAction.code}] has been deployed across all operative nodes. System sync complete.`;
          } else {
            response = `EXECUTION_FAILURE: Could not authorize deployment. Error: ${error.message}`;
          }
        }
        setPendingAction(null);
      } else {
        response = "UNKNOWN_COMMAND_SEQUENCE. I can monitor INVENTORY, analyze SALES, or generate CAMPAIGN strategies. Please rephrase your uplink request.";
        setPendingAction(null);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[70vh] flex flex-col border border-white/10 bg-black relative overflow-hidden mono">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="w-10 h-10 border border-enark-red flex items-center justify-center">
                <Brain size={20} className="text-enark-red animate-pulse" />
             </div>
             <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest uppercase">Neural_Core_v4.2</h3>
            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase">
               <Activity size={10} className="text-green-500" />
               <span>Latency: 24ms // Uplink: Secure</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-1 h-4 bg-white/10" />
           ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 border ${
                msg.role === 'user' 
                  ? 'border-white/20 bg-white/5 text-right' 
                  : msg.type === 'status'
                    ? 'border-enark-red/50 bg-enark-red/10 text-enark-red'
                    : 'border-white/10 bg-black/50'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-40 text-[9px] uppercase tracking-widest">
                  {msg.role === 'assistant' ? <Cpu size={10} /> : <Terminal size={10} />}
                  {msg.role}
                </div>
                <p className={`text-xs leading-relaxed ${msg.role === 'assistant' ? 'font-mono' : 'font-black'}`}>
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="p-4 border border-white/10 bg-black/50 flex gap-2">
                <div className="w-1 h-1 bg-enark-red animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1 h-1 bg-enark-red animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 h-1 bg-enark-red animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSend}
        className="p-6 border-t border-white/10 bg-black z-10"
      >
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2">
          <div className="p-3 bg-white/10">
            <Terminal size={16} className="text-white/60" />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="EXECUTE_COMMAND_OR_QUERY_SYSTEM..."
            className="flex-1 bg-transparent border-none outline-none text-xs uppercase tracking-widest p-2"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-3 bg-enark-red text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center px-2">
           <div className="flex gap-4">
              <span className="text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={10} /> Neural_Sync: Active
              </span>
              <span className="text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={10} /> Power: 100%
              </span>
           </div>
           <p className="text-[9px] text-white/20 uppercase tracking-widest">ENARK_NEURAL_INTERFACE_BETA</p>
        </div>
      </form>
    </div>
  );
}
