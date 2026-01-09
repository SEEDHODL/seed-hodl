import React, { useState, useEffect, useRef } from 'react';
import ParticleBackground from './ParticleBackground';

export default function App() {
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showResetButton, setShowResetButton] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isVoid, setIsVoid] = useState(false);
  const [phase, setPhase] = useState('staking'); // staking, void, reset
  const longPressTimer = useRef(null);

  const failureMessages = [
    "Liquidation Successful. Zero assets remaining.",
    "You rugged yourself. Again.",
    "Paper Hands. Back to the wage cage.",
    "Enjoy the 5 seconds of dopamine. Was it worth it?",
    "NGMI. (Not Gonna Make It)",
    "Weak vibes detected. Application to McDonald's sent."
  ];

  const dailyMessages = {
    1: "Market is volatile. Don't panic sell.",
    2: "FUD detected. Ignore the urge.",
    3: "Mid-term resistance. HODL tight.",
    4: "Pre-market pump. Almost there.",
    5: "PROTOCOL v1 COMPLETE. You survived the crash. 🚀"
  };

  useEffect(() => {
    const saved = localStorage.getItem('seedHodlStart');
    if (saved) {
      setStartTime(parseInt(saved));
    } else {
      const now = Date.now();
      setStartTime(now);
      localStorage.setItem('seedHodlStart', now);
    }
  }, []);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days >= 5) {
        setElapsed({ days: 5, hours: 0, minutes: 0, seconds: 0 });
        setPhase('complete');
      } else {
        setElapsed({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setShowResetButton(true);
    }, 3000);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleReset = () => {
    setPhase('void');
    const randomMessage = failureMessages[Math.floor(Math.random() * failureMessages.length)];
    setResetMessage(randomMessage);
    setIsVoid(true);
    
    setTimeout(() => {
      localStorage.removeItem('seedHodlStart');
      setStartTime(null);
      setElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setShowResetButton(false);
      setPhase('staking');
      setIsVoid(false);
      setResetMessage('');
      const now = Date.now();
      setStartTime(now);
      localStorage.setItem('seedHodlStart', now);
    }, 4000);
  };

  const copyProof = () => {
    const text = `Day ${elapsed.days} of 5 on SEED HODL v1. My liquidity is locked. Waiting for the v2 update. 💎🙌`;
    navigator.clipboard.writeText(text);
    alert('Proof copied to clipboard!');
  };

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <ParticleBackground dayCount={elapsed.days} isVoid={isVoid} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="text-sm font-mono text-slate-400">
            [⋮] SEED HODL PROTOCOL
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-mono text-green-400">STAKING LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Counter Card */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        {!isVoid ? (
          <div className="backdrop-blur-md bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 w-80 text-center shadow-2xl">
            <div className="mb-6">
              <div className="text-xs font-mono text-slate-500 mb-2">BLOCK HEIGHT</div>
              <div className="text-5xl font-mono text-cyan-300 font-bold tracking-wider">
                {pad(elapsed.days)}:{pad(elapsed.hours)}:{pad(elapsed.minutes)}:{pad(elapsed.seconds)}
              </div>
            </div>

            <div className="mb-4 text-sm font-mono text-slate-400">
              <div>CURRENT APY: +{20 + (elapsed.days * 5)}% TESTOSTERONE</div>
              <div>NEXT HARVEST: DAY 05 (MAX YIELD)</div>
            </div>

            <div className="my-6 h-1 bg-gradient-to-r from-slate-700 via-cyan-500 to-slate-700 rounded-full"></div>

            <div className="text-sm font-mono text-cyan-400 mb-6">
              YOUR BIOLOGY IS YOUR ASSET.
              <br />
              DON'T DUMP IT.
            </div>

            {phase === 'complete' ? (
              <div className="text-center">
                <div className="text-xl font-bold text-green-400 mb-4">v1.0 COMPLETE 🚀</div>
                <button
                  onClick={copyProof}
                  className="w-full bg-cyan-500/20 border border-cyan-500 text-cyan-400 py-2 rounded-lg text-sm font-mono hover:bg-cyan-500/30 transition"
                >
                  COPY PROOF OF STREAK
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={copyProof}
                  className="w-full bg-slate-700/50 border border-slate-600 text-slate-300 py-2 rounded-lg text-xs font-mono hover:bg-slate-700 transition"
                >
                  COPY PROOF OF STREAK
                </button>
                <button
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full bg-red-500/20 border border-red-500 text-red-400 py-2 rounded-lg text-xs font-mono hover:bg-red-500/30 transition"
                >
                  {showResetButton ? 'CONFIRM LIQUIDATION (3s)' : 'HOLD FOR EMERGENCY LIQUIDATION (3s)'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center z-30">
            <div className="text-6xl font-mono font-bold text-white mb-8 animate-pulse glitch">
              {resetMessage}
            </div>
            <div className="text-sm text-slate-500 font-mono">LIQUIDITY: 0</div>
          </div>
        )}
      </div>

      {/* Roadmap Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent z-10">
        <div className="max-w-2xl mx-auto text-xs font-mono text-slate-400">
          <div className="mb-3 text-slate-500">PROTOCOL ROADMAP</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="border border-green-500/50 bg-green-500/10 p-2 rounded">
              <div className="text-green-400">✅ Phase 1</div>
              <div className="text-slate-500 text-xs">5-Day v1.0 LIVE</div>
            </div>
            <div className="border border-yellow-500/50 bg-yellow-500/10 p-2 rounded">
              <div className="text-yellow-400">🚧 Phase 2</div>
              <div className="text-slate-500 text-xs">7-Day v2.0</div>
            </div>
            <div className="border border-slate-500/50 bg-slate-500/10 p-2 rounded">
              <div className="text-slate-400">📅 Phase 3</div>
              <div className="text-slate-600 text-xs">10-Day v3.0</div>
            </div>
            <div className="border border-slate-600/50 bg-slate-600/10 p-2 rounded">
              <div className="text-slate-500">🔒 Phase 4</div>
              <div className="text-slate-700 text-xs">30-Day God</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes glitch {
          0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
          50% { text-shadow: 0 0 20px rgba(255, 0, 0, 0.8), 0 0 10px rgba(0, 255, 255, 0.5); }
        }
        .glitch {
          animation: glitch 0.5s infinite;
        }
      `}</style>
    </div>
  );
}