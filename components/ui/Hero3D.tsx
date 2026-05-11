'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Float, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  Points,
  PointMaterial,
  SpotLight,
  MeshDistortMaterial,
  Sphere
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function Particles({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  const ref = useRef<any>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = time * 0.05;
      ref.current.rotation.x = time * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

function AntigravityMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scrollYProgress } = useNativeScroll();
  
  // Map scroll progress to 3D transforms
  const rotateY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 2, 8]);
  const positionZ = useTransform(scrollYProgress, [0, 1], [0, 5]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      // Combine "breathing" with scroll-linked rotation
      meshRef.current.rotation.y = rotateY.get() + t * 0.2;
      meshRef.current.rotation.z = t * 0.1;
      meshRef.current.scale.setScalar(scale.get());
      meshRef.current.position.z = positionZ.get();
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1.2, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color="#111111"
          roughness={0.1}
          metalness={1}
          distort={0.4}
          speed={2}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </Float>
  );
}

function CursorLight() {
  const lightRef = useRef<any>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    const x = (state.mouse.x * viewport.width) / 2;
    const y = (state.mouse.y * viewport.height) / 2;
    if (lightRef.current) {
      lightRef.current.position.set(x, y, 5);
      lightRef.current.target.position.set(x, y, 0);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <SpotLight
      ref={lightRef}
      distance={15}
      angle={0.4}
      attenuation={5}
      anglePower={5}
      intensity={2}
      color="#ffffff"
    />
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-screen relative bg-black overflow-hidden">
      {/* Matte Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] opacity-80" />
      
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        
        <ambientLight intensity={0.2} />
        <CursorLight />
        
        <Suspense fallback={null}>
          <AntigravityMesh />
          <Particles />
          <Environment preset="city" />
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
        </Suspense>
      </Canvas>

      {/* Backdrop Typography (Parallax) */}
      <div className="absolute inset-0 flex items-center justify-center z-[-1] pointer-events-none overflow-hidden">
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 0.1 }}
           className="text-[30vw] font-black uppercase italic tracking-tighter text-white whitespace-nowrap"
           style={{ 
             WebkitTextStroke: '1px rgba(255,255,255,0.2)',
             color: 'transparent'
           }}
         >
           ENARK_SYSTEMS
         </motion.div>
      </div>
    </div>
  );
}
