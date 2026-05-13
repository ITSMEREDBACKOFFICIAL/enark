'use client';

import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, MousePointer2, Fingerprint, Info } from 'lucide-react';

const IMAGE_URLS = [
  '/images/silk_saree_luxury_1776743251836.png',
  '/images/studio_editorial_hero.png',
  '/images/utility_parka_luxury_1776743275844.png',
  '/images/velvet_blazer_luxury_1776743227817.png',
];

const vertexShader = `
  varying vec2 vUv;
  uniform float uVelocity;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    float angle = pos.x * 0.12;
    float bend = uVelocity * 0.15;
    pos.z += sin(pos.y * 0.5 + uTime) * 0.2;
    pos.z += cos(angle) * bend * 8.0;
    float edge = 1.0 - smoothstep(0.0, 0.5, abs(uv.x - 0.5));
    pos.z *= edge;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(uTexture, vUv);
    float dist = distance(vUv, vec2(0.5));
    color.rgb *= 1.0 - smoothstep(0.4, 0.7, dist) * 0.3;
    gl_FragColor = vec4(color.rgb, uOpacity);
  }
`;

function GalleryItem({ url, index, internalScroll, velocity, totalItems }: { url: string; index: number; internalScroll: number; velocity: number, totalItems: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useTexture(url);
  
  const columns = 4;
  const colIndex = index % columns;
  const rowIndex = Math.floor(index / columns);
  
  const x = (colIndex - (columns - 1) / 2) * 5.5;
  const initialY = -rowIndex * 7.5 - (Math.sin(colIndex * 1.5) * 3.0);

  const uniforms = useMemo(() => ({
    uVelocity: { value: 0 },
    uTexture: { value: texture },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  }), [texture]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const speed = 0.05;
    const spacing = 7.5 * (totalItems / columns);
    let currentY = initialY - internalScroll * speed;
    
    currentY = ((currentY + spacing/2) % spacing) - spacing/2;
    
    meshRef.current.position.y = currentY;
    meshRef.current.position.x = x;
    meshRef.current.position.z = -Math.abs(currentY) * 0.1;

    materialRef.current.uniforms.uVelocity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uVelocity.value,
      velocity * 0.8,
      0.1
    );
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4.2, 5.8, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export default function WarpGallery() {
  const [mounted, setMounted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [internalScroll, setInternalScroll] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchY = useRef(0);
  const internalScrollRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    internalScrollRef.current = internalScroll;
  }, [internalScroll]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isLocked) {
        e.preventDefault();
        const delta = e.deltaY;
        setInternalScroll(prev => prev + delta);
        setVelocity(delta * 0.1);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isLocked) {
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = lastTouchY.current - touchY;
        setInternalScroll(prev => prev + deltaY * 3);
        setVelocity(deltaY * 0.6);
        lastTouchY.current = touchY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isLocked]);

  const toggleLock = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    
    const lenis = (window as any).lenis;
    if (lenis) {
      if (nextLocked) {
        lenis.stop();
        document.body.style.overflow = 'hidden';
      } else {
        lenis.start();
        document.body.style.overflow = '';
      }
    }
  };

  if (!mounted) return <div className="w-full h-[90vh] bg-black" />;

  return (
    <div 
      ref={containerRef}
      className={`w-full h-[90vh] bg-black relative overflow-hidden border-y transition-all duration-700 ${isLocked ? 'border-enark-red/50 shadow-[0_0_50px_rgba(255,0,0,0.1)]' : 'border-white/5'}`}
    >
      {/* UI Overlay */}
      <div className="absolute inset-x-0 top-0 p-8 z-20 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ scale: isLocked ? [1, 1.2, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-enark-red shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'bg-white/20'}`} 
            />
            <span className="text-[10px] text-white mono uppercase tracking-[0.5em] font-black">
              {isLocked ? 'INTERFACE_LOCKED' : 'SYSTEM_READY'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Info size={10} className="text-white/20" />
            <div className="text-[8px] text-white/30 mono uppercase tracking-widest leading-none">
              {isLocked ? 'Exploration Mode: Active' : 'Scan to Engage Neural Link'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end pointer-events-auto">
          <button 
            onClick={toggleLock}
            className={`group relative flex items-center gap-4 px-6 py-3 border transition-all duration-500 overflow-hidden ${isLocked ? 'border-enark-red bg-enark-red text-white' : 'border-white/10 hover:border-enark-red text-white/40 hover:text-white'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] mono relative z-10">
              {isLocked ? 'RELEASE_SCROLL' : 'ENGAGE_SYSTEM'}
            </span>
            <div className="relative z-10">
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </div>
            {/* Hover Slide Effect */}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          <div className="mt-2 text-[7px] text-white/20 mono uppercase tracking-widest">
            {isLocked ? 'BYPASS_CMD: CLICK_ABOVE' : 'LINK_CMD: SECURE_AUTH'}
          </div>
        </div>
      </div>

      <Canvas 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 18], fov: 40 }}
      >
        <Suspense fallback={null}>
          <group>
            {[...Array(16)].map((_, i) => (
              <GalleryItem 
                key={i} 
                index={i} 
                url={IMAGE_URLS[i % IMAGE_URLS.length]} 
                internalScroll={internalScroll}
                velocity={velocity}
                totalItems={16}
              />
            ))}
          </group>
        </Suspense>
      </Canvas>

      {/* Guidance HUD */}
      <AnimatePresence>
        {isLocked && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-[80%] h-[80%] border border-enark-red/10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-12 text-enark-red/40">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <MousePointer2 size={32} strokeWidth={1} />
                  </motion.div>
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                    <Fingerprint size={32} strokeWidth={1} />
                  </motion.div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-enark-red mono font-black uppercase tracking-[1.2em] mb-2">SCROLL_ACTIVE</span>
                  <div className="w-48 h-[1px] bg-enark-red/20 relative">
                    <motion.div 
                      animate={{ left: ['0%', '100%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                      className="absolute top-0 w-8 h-full bg-enark-red"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black opacity-80" />
    </div>
  );
}
