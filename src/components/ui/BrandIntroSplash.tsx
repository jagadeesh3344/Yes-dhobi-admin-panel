import React, { useState, useEffect } from 'react';
import { Zap, Sparkles } from 'lucide-react';

interface BrandIntroSplashProps {
  onComplete?: () => void;
  forcePlay?: boolean;
}

export const BrandIntroSplash: React.FC<BrandIntroSplashProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Progress interval (runs up to 100% in ~2 seconds)
    const startTime = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
          }, 500);
        }, 250);
      }
    }, 25);

    // Escape key skips intro immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          setVisible(false);
          if (onComplete) onComplete();
        }, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 select-none ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #0f1f4b 0%, #080d24 55%, #030612 100%)',
      }}
    >
      {/* Background Animated Water Ripple Waves */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="absolute w-[340px] h-[340px] rounded-full border border-cyan-400/20 animate-ping opacity-25"
          style={{ animationDuration: '3s' }}
        />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-blue-500/20 animate-pulse" />
        <div className="absolute w-[680px] h-[680px] rounded-full border border-cyan-500/10" />

        {/* Ambient Neon Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-gradient-to-r from-blue-600/25 via-cyan-400/25 to-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />
      </div>

      {/* Top Bar with Brand Badge & Skip button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="font-mono tracking-widest text-slate-300 text-[11px] font-bold">
            YES DHOBI CONSOLE
          </span>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setVisible(false);
              if (onComplete) onComplete();
            }, 300);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white font-mono text-[11px] tracking-wider transition-all cursor-pointer backdrop-blur-md"
        >
          <span>SKIP INTRO</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-slate-400 font-bold">ESC</span>
        </button>
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center max-w-xl px-6 text-center">
        {/* Logo Glass Card with Glow */}
        <div className="relative group mb-8">
          {/* Animated Glow Halo */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse duration-1000" />

          <div className="relative bg-white/95 backdrop-blur-2xl px-10 py-6 rounded-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(6,182,212,0.35)] flex flex-col items-center">
            {/* Shimmer Light Sweep Overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
              style={{
                background:
                  'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.7) 45%, rgba(6,182,212,0.2) 50%, transparent 60%)',
                animation: 'introShimmer 2s infinite ease-in-out',
              }}
            />

            {/* Official Yes Dhobi Wordmark Logo */}
            <img
              src="/yesdhobi-logo.png"
              alt="Yes Dhobi Logo"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-md select-none transform transition-transform duration-700 hover:scale-105"
            />

            {/* Tagline Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[10px] font-extrabold text-blue-700 tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-cyan-600 animate-spin" style={{ animationDuration: '4s' }} />
                NEXT-GEN LAUNDRY & DRY CLEANING
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Display */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 font-bold tracking-wider uppercase text-xs">
              Yes Dhobi Console
            </span>
            <span className="text-white font-bold font-mono text-sm tracking-wider">
              {progress}%
            </span>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="relative w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/10 p-0.5 backdrop-blur-md">
            <div
              className="h-full rounded-full transition-all duration-100 ease-out relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 70%, #10b981 100%)',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.8)',
              }}
            >
              {/* Internal gleam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Single Focused 10-Min Badge */}
        <div className="mt-7 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono font-bold text-amber-300 backdrop-blur-md shadow-lg shadow-black/20">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>10-MIN INSTANT DISPATCH</span>
          </div>
        </div>
      </div>

      {/* Keyframe animation styles */}
      <style>{`
        @keyframes introShimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
};
