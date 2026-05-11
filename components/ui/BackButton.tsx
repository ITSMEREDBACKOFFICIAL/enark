'use client';

import { useRouter } from 'next/navigation';

export default function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`group flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/50 hover:text-foreground transition-all duration-300 ${className}`}
    >
      <span className="w-5 h-px bg-foreground/30 group-hover:w-8 group-hover:bg-foreground transition-all duration-300" />
      Back
    </button>
  );
}
