import React, { useState } from 'react';
import { X, AlertTriangle, Snowflake, CheckCircle2 } from 'lucide-react';

// Zero-dependency CSS Confetti
const ConfettiEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
    {[...Array(40)].map((_, i) => (
      <div
        key={i}
        className="absolute animate-confetti"
        style={{
          left: `${Math.random() * 100}%`,
          top: `-10%`,
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 12 + 6}px`,
          opacity: Math.random() + 0.5,
          animationDelay: `${Math.random() * 1.5}s`,
          animationDuration: `${Math.random() * 2 + 2}s`,
          transform: `rotate(${Math.random() * 360}deg)`
        }}
      />
    ))}
    <style>{`
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(400px) rotate(720deg); }
      }
      .animate-confetti { animation: confetti linear forwards; }
    `}</style>
  </div>
);

export default function BlastACModal({ isOpen, onClose }) {
  const [stage, setStage] = useState(1); // 1: Warning, 2: Loading, 3: Paywall

  if (!isOpen) return null;

  const handleProceed = () => {
    setStage(2);
    setTimeout(() => {
      setStage(3);
    }, 2500); // 2.5 second loading screen
  };

  const handleClose = () => {
    setStage(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl relative animate-in zoom-in-95">
        
        {/* STAGE 1: CRITICAL WARNING */}
        {stage === 1 && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border-4 border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">⚠️ Critical Grid Override</p>
              <h3 className="font-black text-slate-900 text-xl">Trigger All 35 Air Conditioners!</h3>
              <p className="text-xs text-slate-500 font-medium mt-2">
                You are about to override the compressors in all 35 classrooms through 7 floors simultaneously.
              </p>
            </div>

            <div className="border border-rose-200 bg-rose-50/50 p-4 rounded-xl text-left space-y-2 mt-4">
              <div className="flex justify-between items-center border-b border-rose-200/60 pb-2">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Estimated Peak Draw:</span>
                <span className="text-xs font-black text-rose-700">~47.5 kW / hr</span>
              </div>
              <div className="flex justify-between items-center border-b border-rose-200/60 pb-2">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Status:</span>
                <span className="text-xs font-black text-rose-700">Overloading Transformer 4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Circuit Breaker Risk:</span>
                <span className="text-xs font-black text-rose-700 uppercase bg-rose-200 px-1.5 py-0.5 rounded">Severe Overload</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button onClick={handleProceed} className="w-full py-3.5 bg-[#176e57] text-white font-black rounded-xl hover:bg-[#135c49] transition-colors shadow-lg shadow-emerald-900/20 active:scale-95">
                Yes, Proceed to Remote Override
              </button>
              <button onClick={handleClose} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600">
                Cancel Grid Override
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: LOADING GRID */}
        {stage === 2 && (
          <div className="p-8 text-center space-y-6">
            <div className="relative flex items-center justify-center w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#176e57] rounded-full border-t-transparent animate-spin"></div>
              <Snowflake className="w-8 h-8 text-[#176e57] animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg animate-pulse">Connecting to Dimasalang Grid...</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Bypassing local thermostat controls...</p>
            </div>
          </div>
        )}

        {/* STAGE 3: PAYWALL CONFETTI */}
        {stage === 3 && (
          <div className="p-6 relative overflow-hidden rounded-3xl">
            <ConfettiEffect />
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-[#176e57] rounded-2xl flex items-center justify-center shadow-inner">
                <Snowflake className="w-8 h-8" />
              </div>
              
              <div>
                <p className="text-[10px] font-black text-[#176e57] uppercase tracking-widest mb-1">❄️ PHINMA Facilities Enterprise</p>
                <h3 className="font-black text-slate-900 text-2xl leading-tight">Central Climate Cloud Tier</h3>
                <p className="text-xs text-slate-600 font-semibold mt-2 px-2">
                  Dingdong! To maintain automated enterprise cooling, an active subscription is required.
                </p>
              </div>

              <div className="w-full text-left space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176e57] shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-slate-700">UNLIMITED ROOM COOLING</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176e57] shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-slate-700">Direct compressor access from your device</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#176e57] shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-slate-700">Priority maintenance dispatch in Metro Manila</span>
                </div>
              </div>

              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Campus Facility Billing</span>
                <span className="text-3xl font-black text-[#176e57] my-1">₱5,000.00</span>
                <span className="text-[10px] font-semibold text-emerald-700">Billed Monthly to Department</span>
              </div>

              <div className="w-full pt-2">
                <button onClick={() => alert("Insufficient Department Funds! 😅")} className="w-full py-3.5 bg-[#176e57] text-white font-black rounded-xl hover:bg-[#135c49] transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-2">
                  <Snowflake className="w-4 h-4" /> Authorize Charge (₱5,000/mo)
                </button>
                <button onClick={handleClose} className="w-full mt-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline">
                  Cancel and revert to manual switches
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}