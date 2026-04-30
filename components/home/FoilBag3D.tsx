'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function BagMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Antigravity Float effect
    meshRef.current.position.y = Math.sin(time * 1.5) * 0.2;
    meshRef.current.position.x = Math.cos(time * 0.8) * 0.1;

    // Scroll-based rotation + continuous float rotation
    meshRef.current.rotation.y = time * 0.1 + scrollProgress * Math.PI * 2;
    meshRef.current.rotation.z = Math.sin(time * 0.5) * 0.15 + scrollProgress * Math.PI;
  });

  return (
    <mesh ref={meshRef}>
      {/* Box mimicking flat metallic product pouch */}
      <boxGeometry args={[1.6, 2.4, 0.2, 10, 10, 2]} />
      <meshPhysicalMaterial
        color="#f0f0f0"
        metalness={1.0}
        roughness={0.12}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        reflectivity={1.0}
        flatShading={true} // Hard facets to simulate crumpled foil
      />
    </mesh>
  );
}

export default function FoilBag3D() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, -5, 2]} intensity={0.8} />
        <BagMesh />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
