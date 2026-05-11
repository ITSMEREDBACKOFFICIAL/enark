'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useGLTF, 
  Float, 
  Environment, 
  ContactShadows, 
  PerspectiveCamera,
  Text,
  useScroll,
  Points,
  PointMaterial,
  SpotLight
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll as useNativeScroll, useTransform } from 'framer-motion';

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

function HoodieModel() {
  // Using a high-quality hoodie model from a public CDN
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/hoodie/model.gltf');
  const meshRef = useRef<THREE.Group>(null);
  
  // Handle Inertial Dragging & Mouse Interaction
  const [rotation, setRotation] = useState([0, 0, 0]);
  const [isDragging, setIsDragging] = useState(false);

  useFrame((state) => {
    if (!isDragging && meshRef.current) {
      // "Breathing" and drifting effect
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y += Math.sin(t * 0.5) * 0.001;
      meshRef.current.position.y = Math.sin(t * 1.2) * 0.1;
    }
  });

  return (
    <Float
      speed={1.5} 
      rotationIntensity={0.5} 
      floatIntensity={0.5}
    >
      <primitive 
        ref={meshRef}
        object={scene} 
        scale={2.5} 
        position={[0, -1, 0]} 
        rotation={[0, Math.PI / 8, 0]}
        castShadow
      />
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
          <HoodieModel />
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
