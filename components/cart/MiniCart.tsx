'use client';

import { useCart } from '@/store/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MiniCart() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal, clearExpiredItems } = useCart();
  const total = getTotal();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const router = useRouter();

  // Expiry Logic (15 minutes)
  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      clearExpiredItems(15);
      
      const oldestItem = items.reduce((oldest, current) => 
        (current.addedAt < oldest.addedAt) ? current : oldest
      , items[0]);

      if (oldestItem) {
        const expiryTime = oldestItem.addedAt + (15 * 60 * 1000);
        const remaining = expiryTime - Date.now();
        
        if (remaining <= 0) {
          setTimeLeft('00:00');
        } else {
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, items, clearExpiredItems]);

  const handleCheckoutInitiation = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'circOut', duration: 0.5 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-black border-l border-white/20 z-[120] flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-black">
              <h2 className="text-2xl font-black tracking-tighter-x uppercase">
                Your Bag
                <span className="text-enark-red ml-2">[{items.length}]</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:text-enark-red transition-colors text-white/60">
                <X size={24} />
              </button>
            </div>

            {/* Expiry Warning Banner */}
            {items.length > 0 && timeLeft && (
              <div className="bg-enark-red/10 border-b border-enark-red/20 px-8 py-3 flex items-center gap-3">
                <Clock size={14} className="text-enark-red" />
                <p className="text-xs font-black text-enark-red uppercase tracking-widest">
                  Reserved for {timeLeft}
                </p>
              </div>
            )}

            {/* Dynamic Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              <AnimatePresence mode="wait">
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    {items.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white/60 uppercase mono">
                        Your bag is empty
                      </div>
                    ) : (
                      <div className="divide-y divide-white/10">
                        {items.map((item) => (
                          <div key={item.variantId} className="flex p-8 gap-8 group">
                            <div className="w-24 h-32 bg-white/5 border border-white/10 overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-sm font-black uppercase leading-none max-w-[80%]">{item.name}</h3>
                                  <p className="mono text-xs text-enark-red font-bold">₹{item.price.toLocaleString()}</p>
                                </div>
                                <p className="mono text-[11px] text-white/60 uppercase tracking-widest">SKU: {item.sku}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex border border-white/10">
                                  <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2 hover:bg-white/5 text-white/60"><Minus size={12} /></button>
                                  <span className="w-8 flex items-center justify-center mono text-xs">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-2 hover:bg-white/5 text-white/60"><Plus size={12} /></button>
                                </div>
                                <button onClick={() => removeItem(item.variantId)} className="text-white/60 hover:text-enark-red transition-colors"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-black z-10">
                <div className="flex justify-between mb-8">
                  <span className="mono text-xs font-bold text-white/60 tracking-widest">Total</span>
                  <span className="text-2xl font-black">₹{total.toLocaleString()}</span>
                </div>
                
                <button 
                  onClick={handleCheckoutInitiation}
                  className="w-full bg-enark-red text-white py-6 flex items-center justify-between px-8 group hover:bg-white hover:text-black transition-all"
                >
                  <span className="font-black tracking-[0.2em] text-sm uppercase">Checkout</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
