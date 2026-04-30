'use client';

import { motion } from 'framer-motion';
import { Instagram, ArrowUpRight, Globe, Lock, Twitter, Youtube, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [brandName, setBrandName] = useState('ENARK');
  const [footerText, setFooterText] = useState('ENARK // RETAIL_OS');
  const [showModelButton, setShowModelButton] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function fetchConfig() {
      const { data } = await supabase.from('app_config').select('brand_name, footer_text').eq('id', 'main').single();
      if (data) {
        setBrandName(data.brand_name || 'ENARK');
        setFooterText('ENARK // RETAIL_OS');
      }
      
      try {
        const res = await fetch('/api/models/config');
        const configData = await res.json();
        setShowModelButton(configData.showButton);
      } catch (e) {
        console.error(e);
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    // Only run Matter.js on client
    if (typeof window === 'undefined' || !sceneRef.current) return;

    // Dynamically import or use global if available? We installed it.
    const Matter = require('matter-js');
    const { Engine, World, Bodies, Composite, Events, Body } = Matter;

    const engine = Engine.create();
    engine.gravity.y = 0.02; // Very slight gravity for natural settling
    engine.gravity.x = 0;

    const width = sceneRef.current.clientWidth || 1200;
    const height = sceneRef.current.clientHeight || 400;

    // Walls
    const wallOptions = { isStatic: true, restitution: 0.9, friction: 0.1 };
    const walls = [
      Bodies.rectangle(width / 2, -25, width * 2, 50, wallOptions), // Top
      Bodies.rectangle(width / 2, height + 25, width * 2, 50, wallOptions), // Bottom
      Bodies.rectangle(-25, height / 2, 50, height * 2, wallOptions), // Left
      Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOptions), // Right
    ];

    // Letters
    const letters = ['E', 'N', 'X', 'R', 'K'];
    const letterWidth = Math.min(width * 0.15, 180);

    const bodies = letters.map((char, index) => {
      const x = (width / 6) * (index + 1);
      const y = height / 2;
      return Bodies.rectangle(x, y, letterWidth, letterWidth, {
        frictionAir: 0.08, // Viscous fluid feel
        restitution: 0.8, // Bouncy
        density: 0.002,
        label: char
      });
    });

    Composite.add(engine.world, [...walls, ...bodies]);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOver = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = sceneRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = sceneRef.current?.getBoundingClientRect();
        if (rect) {
          mouseX = e.touches[0].clientX - rect.left;
          mouseY = e.touches[0].clientY - rect.top;
        }
      }
    };

    const handleMouseEnter = () => { isMouseOver = true; };
    const handleMouseLeave = () => { isMouseOver = false; };
    const handleTouchStart = (e: TouchEvent) => {
      isMouseOver = true;
      handleTouchMove(e);
    };
    const handleTouchEnd = () => { isMouseOver = false; };

    const container = sceneRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // Apply water-like physics & mouse repulsion
    Events.on(engine, 'beforeUpdate', () => {
      // Gentle buoyancy / upward drift to counter slight gravity
      bodies.forEach((body) => {
        // Soft wave motion
        const time = Date.now() * 0.002;
        const waveY = Math.sin(time + body.position.x * 0.01) * 0.0001;
        Body.applyForce(body, body.position, { x: 0, y: -0.0008 + waveY });

        if (isMouseOver) {
          const dx = body.position.x - mouseX;
          const dy = body.position.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 250) {
            // Stronger repulsion when close
            const forceMagnitude = (1 - distance / 250) * 0.08;
            const forceX = (dx / distance) * forceMagnitude;
            const forceY = (dy / distance) * forceMagnitude;
            Body.applyForce(body, body.position, { x: forceX, y: forceY });
          }
        }
      });
    });

    // Run Engine
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Sync DOM Positions
    const updateDOM = () => {
      bodies.forEach((body: any, index: number) => {
        const el = letterRefs.current[index];
        if (el) {
          // Centering the translate
          el.style.transform = `translate(${body.position.x - letterWidth / 2}px, ${body.position.y - letterWidth / 2}px) rotate(${body.angle}rad)`;
        }
      });
      animId = requestAnimationFrame(updateDOM);
    };
    let animId = requestAnimationFrame(updateDOM);

    return () => {
      Matter.Runner.stop(runner);
      Engine.clear(engine);
      cancelAnimationFrame(animId);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    {
      title: 'CONNECT',
      links: [
        { label: 'Instagram', href: 'https://instagram.com/enark' },
        { label: 'WhatsApp', href: 'https://wa.me/910000000000' },
        { label: 'LinkedIn', href: 'https://linkedin.com/company/enark' },
      ]
    },
    {
      title: 'SUPPORT',
      links: [
        { label: 'Track Order', href: '/track' },
        { label: 'Exchange', href: '/faq' },
        { label: 'FAQ', href: '/faq' },
        { label: 'FIT', href: '/labs' },
      ]
    },
    {
      title: 'BRAND',
      links: [
        { label: 'Story', href: '#' },
        { label: 'Media', href: '#' },
        ...(showModelButton ? [{ label: 'Model for Us', href: '/model' }] : []),
      ]
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Grievance: Hardik Verma', href: 'mailto:legal@enark.io' },
        { label: 'Privacy Policy', href: '/privacy' },
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="bg-[#000000] border-t border-white/10 pt-20 pb-0 px-6 md:px-12 relative mono overflow-hidden"
    >
      <div className="max-w-screen-2xl mx-auto">
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-8 border-b border-white/10 pb-8">
          {/* Brand & Mobile Grid */}
          <div className="space-y-12 w-full lg:w-auto">
            <h2 className="text-3xl font-black tracking-tighter-x uppercase leading-none text-center lg:text-left">
              {brandName}<span className="text-enark-red">.</span>
            </h2>

            {/* Mobile Link View */}
            <div className="lg:hidden grid grid-cols-2 gap-x-12 gap-y-8 w-full text-center">
              {footerLinks.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/60">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-xs font-bold uppercase tracking-widest text-white/50">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Links - Hidden on Mobile, Flex on Desktop */}
          <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 px-4">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex items-center gap-3 xl:gap-6">
                <div className="w-px h-3 bg-white/10 shrink-0" />
                <div className="flex gap-3 xl:gap-5">
                  {section.links.map((link) => (
                    <a 
                      key={link.label}
                      href={link.href}
                      className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-white transition-all whitespace-nowrap"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </motion.div>

        {/* Minimal Bottom Bar */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-xs font-black text-white/50 uppercase tracking-[0.4em]">
            <span>{footerText}</span>
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-white/60 hover:text-white transition-all"
          >
            <span>BACK TO TOP</span>
            <ArrowUpRight size={10} className="-rotate-45 group-hover:text-enark-red transition-colors" />
          </button>
        </motion.div>
      </div>

      {/* Massive Physics Logo Section (Floating in Water) */}
      <motion.div 
        variants={itemVariants}
        ref={sceneRef}
        className="mt-20 border-t border-white/5 pt-10 pb-10 h-[50vh] md:h-[60vh] flex justify-center items-center overflow-hidden cursor-pointer select-none bg-[#000000] relative"
      >
        {['E', 'N', 'X', 'R', 'K'].map((char, index) => (
          <div
            key={index}
            ref={(el) => { letterRefs.current[index] = el; }}
            className="absolute left-0 top-0 font-sans font-black text-[15vw] tracking-tighter leading-none text-white select-none pointer-events-none"
            style={{
              width: '15vw',
              height: '15vw',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {char}
          </div>
        ))}
      </motion.div>
    </motion.footer>
  );
}
