import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Rocket,
  Sparkles,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Volume2,
  VolumeX,
  RefreshCw,
  ArrowRight,
  Zap,
  Store,
  Truck,
  Smartphone,
  MapPin,
  Check,
  Award,
  Clock,
  Compass,
} from 'lucide-react';

interface GoLiveLaunchpadProps {
  onEnterDashboard?: () => void;
  isInitialLoad?: boolean;
}

type LaunchStage = 'standby' | 'syncing' | 'live';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
  wobble: number;
  wobbleSpeed: number;
}

export const GoLiveLaunchpad: React.FC<GoLiveLaunchpadProps> = ({
  onEnterDashboard,
  isInitialLoad = true,
}) => {
  const [stage, setStage] = useState<LaunchStage>('standby');
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confettiBurstCount, setConfettiBurstCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync Checklist Steps
  const syncSteps = [
    { label: 'Connecting AWS Cloud Dispatch Cluster', desc: 'Hyderabad-South node operational' },
    { label: 'Syncing 32 Partner Laundry Hubs', desc: 'All automatic washer queues synchronized' },
    { label: 'Arming Active Rider Fleets (18 Online)', desc: 'GPS geofencing & dispatch routes armed' },
    { label: 'Opening Customer App Gateway Channels', desc: 'Wash, Fold, Iron & Dry Clean live for booking' },
  ];

  // Sound synthesis via Web Audio API (Zero external assets required)
  const playSound = useCallback((type: 'beep' | 'fanfare' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'fanfare') {
        // Celebratory harmonic chord: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 1.2);
        });
      }
    } catch {
      // Audio autoplay may be prevented before user gesture
    }
  }, [soundEnabled]);

  // Confetti Physics Cannon Engine
  const spawnConfetti = useCallback((count = 150) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const colors = ['#00D2B4', '#2563EB', '#38BDF8', '#10B981', '#F59E0B', '#EC4899', '#FFFFFF'];

    const newParticles: ConfettiParticle[] = [];
    for (let i = 0; i < count; i++) {
      // Launch from multiple positions (left, center, right)
      const originX = Math.random() < 0.3 ? canvas.width * 0.2 : Math.random() < 0.6 ? canvas.width * 0.8 : canvas.width * 0.5;
      const originY = canvas.height * 0.45;

      const angle = (Math.random() * Math.PI) - (Math.PI / 2); // outward spread
      const speed = Math.random() * 18 + 10;

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.sin(angle) * speed + (Math.random() - 0.5) * 8,
        vy: -Math.cos(angle) * speed - Math.random() * 8,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Continuous Confetti Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const remainingParticles: ConfettiParticle[] = [];

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // Gravity
        p.vx *= 0.985; // Drag
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= 0.005; // Gentle fade

        if (p.opacity > 0 && p.y < canvas.height + 50) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            const w = p.size;
            const h = p.size * (0.4 + 0.6 * Math.cos(p.wobble));
            ctx.fillRect(-w / 2, -h / 2, w, h);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          remainingParticles.push(p);
        }
      }

      particlesRef.current = remainingParticles;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Trigger Go Live Sequence
  const handleGoLiveClick = () => {
    playSound('click');
    setStage('syncing');
    setSyncProgress(0);
    setCurrentStepIndex(0);

    // 4-stage synchronization sequence
    let currentPct = 0;
    const interval = setInterval(() => {
      currentPct += 4;
      setSyncProgress(Math.min(100, currentPct));

      if (currentPct === 24) {
        setCurrentStepIndex(1);
        playSound('beep');
      } else if (currentPct === 52) {
        setCurrentStepIndex(2);
        playSound('beep');
      } else if (currentPct === 80) {
        setCurrentStepIndex(3);
        playSound('beep');
      }

      if (currentPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStage('live');
          playSound('fanfare');
          spawnConfetti(220);
          setConfettiBurstCount((c) => c + 1);
          sessionStorage.setItem('yd_has_gone_live', 'true');
        }, 300);
      }
    }, 40);
  };

  const handleReplayCelebration = () => {
    playSound('fanfare');
    spawnConfetti(180);
    setConfettiBurstCount((c) => c + 1);
  };

  const handleEnterDashboard = () => {
    playSound('click');
    sessionStorage.setItem('yd_has_gone_live', 'true');
    if (onEnterDashboard) {
      onEnterDashboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-[#070B19] text-white select-none">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial ambient lighting */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[650px] h-[650px] bg-blue-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />

        {/* Subtle high-tech grid matrix */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Animated concentric radar rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-cyan-500/10 animate-pulse pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1050px] h-[1050px] rounded-full border border-blue-500/5 pointer-events-none" />
      </div>

      {/* Confetti Canvas Layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* ============================================================== */}
      {/* TOP BAR: Logo in TOP-LEFT CORNER (As Explicitly Requested)       */}
      {/* ============================================================== */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-white/10 bg-[#070B19]/70 backdrop-blur-xl">
        {/* Top-Left Corner Brand Container */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-3 px-3.5 sm:px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg shadow-cyan-500/10 border border-white/90 transform transition-transform hover:scale-105">
            {/* Crisp Official Yes Dhobi Wordmark Logo */}
            <img
              src="/yes-dhobi-logo.svg"
              alt="Yes Dhobi Logo"
              className="h-7 sm:h-8 w-auto object-contain select-none"
            />
          </div>

          <div className="hidden xs:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-cyan-300">
                MISSION CONTROL
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Hyderabad Operations Hub • v2.4
            </span>
          </div>
        </div>

        {/* Top-Right Corner Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            title={soundEnabled ? 'Mute Launch Sound' : 'Enable Launch Sound'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline text-[11px]">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline text-[11px]">MUTED</span>
              </>
            )}
          </button>

          {/* Quick Dashboard Shortcut (If already live or in a hurry) */}
          <button
            onClick={handleEnterDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <span>Admin Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* CENTER STAGE: Standby, Syncing, or Grand Live Celebration      */}
      {/* ============================================================== */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 my-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">

          {/* ------------------------------------------------------------ */}
          {/* STATE 1: STANDBY - THE "GO LIVE" LAUNCHPAD                   */}
          {/* ------------------------------------------------------------ */}
          {stage === 'standby' && (
            <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase mb-6 shadow-sm shadow-cyan-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>HYDERABAD'S PREMIER ON-DEMAND LAUNDRY NETWORK</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Ready For Official Launch
              </h1>
              {/* Short, high-impact tagline as requested */}
              <p className="text-base sm:text-xl font-medium text-cyan-300 max-w-xl mx-auto mb-10 tracking-wide">
                Next-Gen Laundry & Fabric Care • Tap Below To Go Live Across Hyderabad
              </p>

              {/* ======================================================== */}
              {/* THE "GO LIVE" BUTTON WITH MULTI-LAYER GLOW AND PULSE     */}
              {/* ======================================================== */}
              <div className="relative group">
                {/* Outer pulsing neon glow halo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-all duration-700 animate-pulse" />
                <div className="absolute -inset-6 bg-cyan-500/20 rounded-full blur-2xl group-hover:opacity-100 transition-opacity pointer-events-none" />

                <button
                  id="btn-admin-go-live"
                  onClick={handleGoLiveClick}
                  className="relative flex items-center justify-center gap-3 px-10 sm:px-14 py-4 sm:py-5 rounded-full bg-gradient-to-r from-[#00D2B4] via-[#0284c7] to-[#2563EB] text-white text-base sm:text-xl font-extrabold tracking-wider uppercase shadow-[0_10px_35px_rgba(0,210,180,0.5)] hover:shadow-[0_15px_45px_rgba(0,210,180,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/30"
                >
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce text-white drop-shadow-md" />
                  <span className="drop-shadow-sm">GO LIVE</span>
                  <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                </button>
              </div>

              <p className="mt-5 text-xs text-slate-400 font-mono tracking-wider">
                CLICK TO ACTIVATE PRODUCTION LAUNDRY GRID & BROADCAST LIVE STATUS
              </p>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STATE 2: SYNCING - HIGH-TECH COUNTDOWN & SYSTEM IGNITION     */}
          {/* ------------------------------------------------------------ */}
          {stage === 'syncing' && (
            <div className="flex flex-col items-center w-full max-w-lg p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin flex items-center justify-center" />
                <Rocket className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Initiating Production Launch...
              </h2>
              <p className="text-xs text-slate-400 mb-6 font-mono">
                HYDERABAD DISPATCH ENGINE • SYNCHRONIZING REAL-TIME NODES
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 border border-white/10 mb-6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-150 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              {/* Dynamic Checklist */}
              <div className="w-full space-y-2.5 text-left text-xs font-mono">
                {syncSteps.map((step, idx) => {
                  const isDone = syncProgress >= (idx + 1) * 25;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.label}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : isCurrent
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 animate-pulse'
                          : 'bg-white/5 border-white/5 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current shrink-0 mt-0.5 flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </div>
                      )}
                      <div>
                        <div className="font-bold">{step.label}</div>
                        <div className="text-[10px] opacity-75">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* STATE 3: LIVE - THE GRAND CELEBRATION REVEAL CARD            */}
          {/* ------------------------------------------------------------ */}
          {stage === 'live' && (
            <div className="flex flex-col items-center w-full max-w-2xl p-6 sm:p-10 rounded-3xl bg-[#0B132B]/90 border border-cyan-400/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,210,180,0.25)] animate-in zoom-in-95 duration-500">
              {/* Glowing Success Badge */}
              <div className="relative mb-5">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full blur-xl opacity-75 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>PLATFORM STATUS: 100% OPERATIONAL</span>
              </div>

              {/* Grand Announcement Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-300 tracking-tight mb-4">
                🎉 Yes Dhobi is Officially Live! 🚀
              </h1>

              {/* Context Summary for the Client */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed mb-6 font-medium text-center">
                <p>
                  The <strong className="text-cyan-300">Yes Dhobi On-Demand Laundry & Fabric Care Ecosystem</strong> is now officially active across Hyderabad! Customers can now place live bookings for Wash & Fold, Wash & Iron, Dry Cleaning, and Express Shoe Care. Verified laundry hubs and delivery riders are synchronized for sub-60-second dispatch.
                </p>
              </div>

              {/* Operational Capabilities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full mb-8 text-left">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Coverage</span>
                  </div>
                  <div className="text-white font-extrabold text-xs sm:text-sm">12 Zones</div>
                  <div className="text-[10px] text-slate-400 truncate">Hyderabad Central</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Avg. Pickup</span>
                  </div>
                  <div className="text-white font-extrabold text-xs sm:text-sm">15 Mins</div>
                  <div className="text-[10px] text-slate-400 truncate">Doorstep Arrival</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </div>
                  <div className="text-white font-extrabold text-xs sm:text-sm">&lt; 45 Secs</div>
                  <div className="text-[10px] text-slate-400 truncate">Smart Routing</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Guarantee</span>
                  </div>
                  <div className="text-white font-extrabold text-xs sm:text-sm">100% Care</div>
                  <div className="text-[10px] text-slate-400 truncate">Quality Verified</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Primary: Enter Admin Dashboard */}
                <button
                  id="btn-enter-dashboard"
                  onClick={handleEnterDashboard}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Enter Live Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary: Replay Celebration (For client demos!) */}
                <button
                  onClick={handleReplayCelebration}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer backdrop-blur-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Replay Ceremony</span>
                </button>

                {/* Trigger Extra Confetti */}
                <button
                  onClick={() => spawnConfetti(120)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 text-cyan-300 font-bold text-xs tracking-wider transition-all cursor-pointer"
                  title="Fire More Confetti"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confetti Blast</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ============================================================== */}
      {/* FOOTER: Live Telemetry & Platform Guarantee                    */}
      {/* ============================================================== */}
      <footer className="relative z-30 w-full px-4 sm:px-8 py-3 sm:py-4 border-t border-white/10 bg-[#070B19]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PRODUCTION PLATFORM • SECURED WITH 256-BIT ENCRYPTION</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>AWS ap-south-1 (Hyderabad)</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">© {new Date().getFullYear()} Yes Dhobi Technologies</span>
        </div>
      </footer>
    </div>
  );
};
