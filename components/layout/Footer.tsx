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

  // Lazy-init physics only when footer enters viewport
  useEffect(() => {
    if (typeof window === 'undefined' || !sceneRef.current) return;

    const initPhysics = () => {
      if (!sceneRef.current) return () => {};
      const Matter = require('matter-js');
      const { Engine, Bodies, Composite, Events, Body } = Matter;

      const engine = Engine.create();
      engine.gravity.y = 0.02;
      engine.gravity.x = 0;

      const width = sceneRef.current.clientWidth;
      const height = sceneRef.current.clientHeight;

      const wallOptions = { isStatic: true, restitution: 0.9, friction: 0.1 };
      const inset = 80;
      const walls = [
        Bodies.rectangle(width / 2, -(200 - inset), width * 2, 400, wallOptions),
        Bodies.rectangle(width / 2, height + (200 - inset), width * 2, 400, wallOptions),
        Bodies.rectangle(-(200 - inset), height / 2, 400, height * 2, wallOptions),
        Bodies.rectangle(width + (200 - inset), height / 2, 400, height * 2, wallOptions),
      ];

      const letters = ['E', 'N', 'A', 'R', 'K'];
      const letterWidth = Math.min(width * 0.10, 140);
      const bodies = letters.map((char, index) => {
        const x = (width / 6) * (index + 1);
        const y = height / 2;
        return Bodies.rectangle(x, y, letterWidth, letterWidth, {
          frictionAir: 0.08, restitution: 0.8, density: 0.002, label: char
        });
      });

      Composite.add(engine.world, [...walls, ...bodies]);

      let mouseX = 0, mouseY = 0, isMouseOver = false;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = sceneRef.current?.getBoundingClientRect();
        if (rect) { mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top; }
      };
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const rect = sceneRef.current?.getBoundingClientRect();
          if (rect) { mouseX = e.touches[0].clientX - rect.left; mouseY = e.touches[0].clientY - rect.top; }
        }
      };
      const handleMouseEnter = () => { isMouseOver = true; };
      const handleMouseLeave = () => { isMouseOver = false; };
      const handleTouchStart = (e: TouchEvent) => { isMouseOver = true; handleTouchMove(e); };
      const handleTouchEnd = () => { isMouseOver = false; };

      const container = sceneRef.current;
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd);

      const handleResize = () => {
        if (!sceneRef.current) return;
        const nw = sceneRef.current.clientWidth, nh = sceneRef.current.clientHeight, wi = 80;
        Matter.Body.setPosition(walls[0], { x: nw / 2, y: -(200 - wi) });
        Matter.Body.setPosition(walls[1], { x: nw / 2, y: nh + (200 - wi) });
        Matter.Body.setPosition(walls[2], { x: -(200 - wi), y: nh / 2 });
        Matter.Body.setPosition(walls[3], { x: nw + (200 - wi), y: nh / 2 });
      };
      window.addEventListener('resize', handleResize);

      Events.on(engine, 'beforeUpdate', () => {
        bodies.forEach((body) => {
          const time = Date.now() * 0.002;
          const waveY = Math.sin(time + body.position.x * 0.01) * 0.0001;
          Body.applyForce(body, body.position, { x: 0, y: -0.0008 + waveY });
          if (isMouseOver) {
            const dx = body.position.x - mouseX, dy = body.position.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 250) {
              const fm = (1 - distance / 250) * 0.08;
              Body.applyForce(body, body.position, { x: (dx / distance) * fm, y: (dy / distance) * fm });
            }
          }
        });
      });

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      const updateDOM = () => {
        bodies.forEach((body: any, index: number) => {
          const el = letterRefs.current[index];
          if (el) el.style.transform = `translate(${body.position.x - letterWidth / 2}px, ${body.position.y - letterWidth / 2}px) rotate(${body.angle}rad)`;
        });
        animId = requestAnimationFrame(updateDOM);
      };
      let animId = requestAnimationFrame(updateDOM);

      return () => {
        window.removeEventListener('resize', handleResize);
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
    };

    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !cleanup) {
          cleanup = initPhysics();
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(sceneRef.current);

    return () => {
      observer.disconnect();
      cleanup?.();
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
        { label: 'Exchange', href: '/exchange' },
        { label: 'FAQ', href: '/faq' },
        { label: 'FIT', href: '/labs' },
      ]
    },
    {
      title: 'BRAND',
      links: [
        { label: 'Story', href: '/story' },
        { label: 'Media', href: '/media' },
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
      className="bg-background border-t border-theme pt-20 pb-0 px-6 md:px-12 relative mono overflow-hidden"
    >
      <div className="max-w-screen-2xl mx-auto">
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-8 border-b border-theme pb-8">
          {/* Brand & Mobile Grid */}
          <div className="space-y-12 w-full lg:w-auto">
            <h2 className="text-3xl font-black tracking-tighter-x uppercase leading-none text-center lg:text-left text-foreground">
              {brandName}<span className="text-enark-red">.</span>
            </h2>

            {/* Mobile Link View */}
            <div className="lg:hidden grid grid-cols-2 gap-x-12 gap-y-8 w-full text-center">
              {footerLinks.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/30">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all">{link.label}</a>
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
                <div className="w-px h-3 bg-foreground/5 shrink-0" />
                <div className="flex gap-3 xl:gap-5">
                  {section.links.map((link) => (
                    <a 
                      key={link.label}
                      href={link.href}
                      className="text-xs font-black uppercase tracking-widest text-foreground/50 hover:text-foreground transition-all whitespace-nowrap"
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
        <motion.div variants={itemVariants} className="pt-8 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-[11px] md:text-[9px] font-black text-foreground/60 md:text-foreground/40 uppercase tracking-widest md:tracking-[0.4em] text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 shrink-0" />
              <span className="hidden md:inline">ENARK_SYSTEMS_REGISTERED_ENTITY_042</span>
              <span className="md:hidden">ENARK SYSTEMS</span>
            </div>
            <span className="hidden md:inline">GSTIN: 29ABCDE1234F1Z5</span>
            <div className="hidden md:flex items-center gap-4 border-l border-foreground/10 pl-8">
               <span className="text-foreground/20">PAYMENTS_BY_CASHFREE</span>
               <span className="text-foreground/20">GLOBAL_Fulfillment</span>
            </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-foreground/60 hover:text-foreground transition-all"
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
        className="mt-20 border border-theme h-[50vh] md:h-[60vh] flex justify-center items-center overflow-hidden cursor-pointer select-none bg-background relative mx-6 md:mx-12 mb-12 rounded-[48px] shadow-[inset_0_0_50px_rgba(0,0,0,0.05)]"
      >
        {['E', 'N', 'A', 'R', 'K'].map((char, index) => (
          <div
            key={index}
            ref={(el) => { letterRefs.current[index] = el; }}
        className="absolute left-0 top-0 font-sans font-black text-[15vw] md:text-[10vw] tracking-tighter leading-none text-foreground select-none pointer-events-none"
            style={{
              width: '10vw',
              height: '10vw',
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
