'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FoilBag() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = 450;
    const height = 450;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Create custom procedural ENARK texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background base (Chrome Silver foil)
      ctx.fillStyle = '#dfdfdf';
      ctx.fillRect(0, 0, 1024, 1024);

      // Noise crinkles mapping
      for (let i = 0; i < 600; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
        ctx.lineWidth = Math.random() * 6;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
        ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
        ctx.stroke();
      }

      // Metallic creasing
      for (let i = 0; i < 400; i++) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.08})`;
        ctx.lineWidth = Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
        ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
        ctx.stroke();
      }
    }

    // ENARK BRANDING ONLY
    if (ctx) {
      // base background
      ctx.fillStyle = '#161821';
      ctx.fillRect(0, 0, 1024, 1024);

      // Noise
      for (let i = 0; i < 200; i++) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
        ctx.lineWidth = Math.random() * 3;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 1024, Math.random() * 1024);
        ctx.lineTo(Math.random() * 1024, Math.random() * 1024);
        ctx.stroke();
      }

      // Background faint text behind card
      ctx.save();
      ctx.fillStyle = '#555555';
      ctx.globalAlpha = 0.2;
      ctx.font = 'black 300px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ENARK', 512, 600);
      ctx.restore();

      // Main ENARK text – larger and white
      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 360px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '14px';
      ctx.fillText('ENARK', 512, 512);

      // Reflected text below the card
      ctx.save();
      ctx.translate(512, 800);
      ctx.scale(1, -1);
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 360px sans-serif';
      ctx.fillText('ENARK', 0, 0);
      ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);

    // Standard Flat Card Geometry (Thin rectangular box with proper corners)
    const cardGeo = new THREE.BoxGeometry(2.2, 3.4, 0.05);

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.1,
      metalness: 0.8,
      bumpMap: texture,
      bumpScale: 0.05,
      side: THREE.DoubleSide
    });

    const cardMesh = new THREE.Mesh(cardGeo, material);
    
    // Group wrapper
    const bagGroup = new THREE.Group();
    bagGroup.add(cardMesh);
    scene.add(bagGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 3.0);
    pointLight.position.set(-5, 5, 2);
    scene.add(pointLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Performance Intersection Observer
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(mountRef.current);

    // Scroll depth interaction
    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll);

    // Animation Loop
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      if (isVisible) {
        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse target follow
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        // Auto float + mouse tracking + scroll tilt
        bagGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        bagGroup.rotation.y = elapsedTime * 0.4 + targetX * 0.6 + (scrollY * 0.002);
        bagGroup.rotation.x = targetY * 0.4;
        bagGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.05;

        renderer.render(scene, camera);
      }
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      cancelAnimationFrame(frameId);
      
      try {
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        cardGeo.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div ref={mountRef} className="pointer-events-auto" />
    </div>
  );
}
