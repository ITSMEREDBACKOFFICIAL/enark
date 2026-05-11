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
      } else if (command.includes('sales') || command.includes('revenue') || command.includes('profit')) {
        const { data: orders } = await supabase.from('orders').select('total_amount, status');
        const total = orders?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
        const paid = orders?.filter(o => o.status === 'paid').length || 0;
        response = `FINANCIAL_SNAPSHOT: Total processed value: ₹${total.toLocaleString()}. Paid orders: ${paid}/${orders?.length || 0}. Trajectory: STABLE.`;
      } else if (command.includes('abandoned') || command.includes('carts')) {
        const { count } = await supabase.from('abandoned_carts').select('*', { count: 'exact', head: true });
        response = `CART_LEAKAGE_REPORT: ${count || 0} abandoned sessions detected in the neural buffer. Suggesting targeted discount dispatch to recover potential revenue.`;
      } else if (command.includes('audit') || command.includes('logs') || command.includes('security')) {
        const { data } = await supabase.from('system_logs').select('action, created_at').order('created_at', { ascending: false }).limit(5);
        response = data && data.length > 0 
          ? `SECURITY_MANIFEST_REPORT: Recent activity detected: ${data.map(l => l.action).join(' >> ')}. System integrity: VERIFIED.`
          : "SECURITY_BUFFER_EMPTY: No recent system events recorded.";
      } else if (command.includes('maintenance')) {
        const { data } = await supabase.from('app_config').select('is_maintenance_mode').eq('id', 'main').single();
        const nextState = !data?.is_maintenance_mode;
        await supabase.from('app_config').update({ is_maintenance_mode: nextState }).eq('id', 'main');
        response = `SYSTEM_OVERRIDE: Maintenance mode has been set to [${nextState ? 'ACTIVE' : 'INACTIVE'}]. All public nodes updated.`;
      } else if (command.includes('marquee') || command.includes('banner')) {
        const type = command.includes('marquee') ? 'marquee_text' : 'announcement_banner';
        const text = userMsg.split(' ').slice(1).join(' ');
        if (text) {
          await supabase.from('app_config').update({ [type]: text }).eq('id', 'main');
          response = `UPLINK_SUCCESS: Storefront ${type.replace('_', ' ').toUpperCase()} updated to: "${text}". Sync complete.`;
        } else {
          response = `INPUT_REQUIRED: Please specify the new text for the ${type.replace('_', ' ')}. E.G. "marquee New Drop Live Now"`;
        }
      } else if (command.includes('customers') || command.includes('operatives')) {
        const { count } = await supabase.from('orders').select('email', { count: 'exact', head: true });
        response = `OPERATIVE_REGISTRY: ${count || 0} unique operative nodes verified in the system database. Activity level: OPTIMAL.`;
      } else if (command.includes('help') || command.includes('what can you') || command.includes('capabilities')) {
        response = "NEURAL_CORE_CAPABILITIES: I can monitor [INVENTORY], analyze [SALES], audit [SECURITY_LOGS], track [ABANDONED_CARTS], manage [MAINTENANCE_MODE], and update storefront [MARQUEE/BANNER]. How shall we proceed?";
      } else if (command.includes('hello') || command.includes('hi')) {
        response = "GREETINGS_OPERATIVE. I am the ENARK Neural Core. All systems reporting optimal functionality. Standing by for command uplink.";
      } else if (command.includes('drop') || command.includes('campaign')) {
        response = "CAMPAIGN_GEN: Suggesting 'NEURAL_OVERRIDE' drop. Recommended Discount: 20%. Global Code: NEURAL20. Ready for deployment?";
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
          response = !error 
            ? `EXECUTION_SUCCESS: Global offer code [${pendingAction.code}] has been deployed. System sync complete.`
            : `EXECUTION_FAILURE: Could not authorize deployment. Error: ${error.message}`;
        }
        setPendingAction(null);
      } else {
        response = "UNKNOWN_COMMAND_SEQUENCE. I can monitor INVENTORY, analyze SALES, manage SYSTEM_CONFIG, or generate CAMPAIGN strategies. Use 'HELP' for a full capability manifest.";
        setPendingAction(null);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="h-[60vh] md:h-[70vh] flex flex-col border border-white/10 bg-black relative overflow-hidden mono">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
             <div className="w-8 h-8 md:w-10 md:h-10 border border-enark-red flex items-center justify-center">
                <Brain className="w-4 h-4 md:w-5 md:h-5 text-enark-red animate-pulse" />
             </div>
             <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-[10px] md:text-xs font-black tracking-widest uppercase truncate">Neural_Core_v4.2</h3>
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-white/40 uppercase truncate">
               <Activity size={10} className="text-green-500 flex-shrink-0" />
               <span className="truncate">Latency: 24ms // Uplink: Secure</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-1 h-4 bg-white/10" />
           ))}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 md:space-y-6 scrollbar-hide z-10 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[80%] p-3 md:p-4 border shadow-2xl ${
                msg.role === 'user' 
                  ? 'border-white/20 bg-white/5 text-right' 
                  : msg.type === 'status'
                    ? 'border-enark-red/50 bg-enark-red/10 text-enark-red'
                    : 'border-white/10 bg-black/50'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-40 text-[8px] md:text-[9px] uppercase tracking-widest">
                  {msg.role === 'assistant' ? <Cpu size={10} /> : <Terminal size={10} />}
                  {msg.role}
                </div>
                <p className={`text-[11px] md:text-xs leading-relaxed ${msg.role === 'assistant' ? 'font-mono' : 'font-black'}`}>
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
              <div className="p-3 md:p-4 border border-white/10 bg-black/50 flex gap-2">
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
        className="p-4 md:p-6 border-t border-white/10 bg-black z-10"
      >
        <div className="flex items-center gap-3 md:gap-4 bg-white/5 border border-white/10 p-1 md:p-2">
          <div className="p-2 md:p-3 bg-white/10 hidden sm:block">
            <Terminal size={16} className="text-white/60" />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="EXECUTE_COMMAND..."
            className="flex-1 bg-transparent border-none outline-none text-[10px] md:text-xs uppercase tracking-widest p-2"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 md:p-3 bg-enark-red text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-3 md:mt-4 flex flex-col sm:flex-row justify-between items-center px-1 gap-2">
           <div className="flex gap-4">
              <span className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={10} className="flex-shrink-0" /> <span className="hidden xs:inline">Neural_Sync:</span> Active
              </span>
              <span className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={10} className="flex-shrink-0" /> <span className="hidden xs:inline">Power:</span> 100%
              </span>
           </div>
           <p className="text-[8px] md:text-[9px] text-white/20 uppercase tracking-widest">ENARK_NEURAL_INTERFACE_BETA</p>
        </div>
      </form>
    </div>
  );
}
