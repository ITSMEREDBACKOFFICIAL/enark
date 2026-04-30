'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, ChevronLeft, ChevronRight, Eye, Scan } from 'lucide-react';

const AR_GARMENTS = [
  { id: 'EN-VK01', name: 'VOID_KINETIC_SHELL', category: 'OUTERWEAR', overlay: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80' },
  { id: 'EN-NT02', name: 'NEURAL_TETHER_TOP',  category: 'TOPS',      overlay: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80' },
  { id: 'EN-CF03', name: 'CORE_FLUX_CARGO',    category: 'BOTTOMS',   overlay: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' },
  { id: 'EN-AS04', name: 'AERO_SHIELD_JACKET', category: 'OUTERWEAR', overlay: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
];

export default function ARMirror() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeGarment, setActiveGarment] = useState(0);
  const [opacity, setOpacity] = useState(0.6);

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setIsCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setTimeout(() => {
        setIsScanning(true);
        setTimeout(() => { setIsScanning(false); setScanComplete(true); }, 2000);
      }, 800);
    } catch {
      setCameraError('CAMERA_ACCESS_DENIED — Allow camera access to use AR Mirror.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraOn(false);
    setScanComplete(false);
    setIsScanning(false);
  }, [stream]);

  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  const garment = AR_GARMENTS[activeGarment];

  return (
    <div className="space-y-8">
      <div className="relative w-full aspect-video bg-black border border-white/10 overflow-hidden">
        {isCameraOn && (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
        )}
        {!isCameraOn && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white/20">
            <Camera size={48} strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-[0.4em]">AR_MIRROR_OFFLINE</p>
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <CameraOff size={32} className="text-enark-red" strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-widest text-enark-red">{cameraError}</p>
          </div>
        )}
        {isCameraOn && scanComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity }}>
            <img src={garment.overlay} alt={garment.name} className="h-[90%] w-auto object-contain mix-blend-multiply" />
          </div>
        )}
        <AnimatePresence>
          {isScanning && (
            <motion.div initial={{ top: '0%' }} animate={{ top: '100%' }} exit={{ opacity: 0 }} transition={{ duration: 1.8, ease: 'linear' }}
              className="absolute left-0 w-full h-[2px] bg-enark-red shadow-[0_0_20px_#FF0000] pointer-events-none z-20" />
          )}
        </AnimatePresence>
        {isCameraOn && (
          <>
            <div className="absolute top-4 left-4 border-t border-l border-enark-red w-8 h-8 pointer-events-none" />
            <div className="absolute top-4 right-4 border-t border-r border-enark-red w-8 h-8 pointer-events-none" />
            <div className="absolute bottom-4 left-4 border-b border-l border-enark-red w-8 h-8 pointer-events-none" />
            <div className="absolute bottom-4 right-4 border-b border-r border-enark-red w-8 h-8 pointer-events-none" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 border border-white/10 backdrop-blur-sm px-4 py-2">
              <span className={`w-1.5 h-1.5 rounded-full ${scanComplete ? 'bg-green-400' : 'bg-enark-red animate-pulse'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {isScanning ? 'SCANNING_BODY...' : scanComplete ? `${garment.id} // OVERLAY_ACTIVE` : 'INITIALIZING...'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Camera_Control</p>
          <button onClick={isCameraOn ? stopCamera : startCamera}
            className={`w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isCameraOn ? 'bg-white/5 border border-enark-red text-enark-red hover:bg-enark-red hover:text-white' : 'bg-white text-black hover:bg-enark-red hover:text-white'}`}>
            {isCameraOn ? <CameraOff size={14} /> : <Camera size={14} />}
            {isCameraOn ? 'Shutdown_Mirror' : 'Activate_AR_Mirror'}
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Garment_Select</p>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveGarment((p) => (p - 1 + AR_GARMENTS.length) % AR_GARMENTS.length)} className="p-4 border border-white/10 hover:border-white/40 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div className="flex-1 border border-white/10 px-4 py-4 text-center">
              <p className="text-[9px] text-enark-red uppercase tracking-widest">{garment.category}</p>
              <p className="text-[11px] font-black uppercase">{garment.name}</p>
            </div>
            <button onClick={() => setActiveGarment((p) => (p + 1) % AR_GARMENTS.length)} className="p-4 border border-white/10 hover:border-white/40 transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Overlay_Intensity — <span className="text-white">{Math.round(opacity * 100)}%</span></p>
          <div className="flex items-center gap-4 border border-white/10 px-4 py-4">
            <Eye size={14} className="text-white/40 shrink-0" />
            <input type="range" min={0.2} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-enark-red" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {AR_GARMENTS.map((g, i) => (
          <button key={g.id} onClick={() => setActiveGarment(i)}
            className={`group relative aspect-square overflow-hidden border transition-all ${activeGarment === i ? 'border-enark-red' : 'border-white/10 hover:border-white/30'}`}>
            <img src={g.overlay} alt={g.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[8px] font-black uppercase tracking-widest text-white leading-tight">{g.name}</p>
            </div>
            {activeGarment === i && <div className="absolute top-2 right-2 w-2 h-2 bg-enark-red rounded-full" />}
          </button>
        ))}
      </div>
      <p className="text-[9px] text-white/20 uppercase tracking-widest text-center">
        AR_PREVIEW_IS_ILLUSTRATIVE // CAMERA_DATA_IS_NOT_STORED
      </p>
    </div>
  );
}
