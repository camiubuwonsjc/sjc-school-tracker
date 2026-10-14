import React, { useState, useEffect } from 'react';
import { Lock, User, ChevronRight, Shield, Mail } from 'lucide-react';

import buildingBg from '../assets/building.jpg';
import logoImg from '../assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [accountId, setAccountId] = useState('001');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotToast, setShowForgotToast] = useState(false);

  const staffList = [
    { id: '001', name: 'Kuya Bert' },
    { id: '002', name: 'Ate Linda' },
    { id: '003', name: 'Kuya Jon' },
    { id: '004', name: 'Ate Marites' },
    { id: '005', name: 'Kuya Jomar' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    if (isSubmitting) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setIsAdminMode(true);
      setClickCount(0);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotToast(true);
    setTimeout(() => setShowForgotToast(false), 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Smooth spinning logo delay
    setTimeout(() => {
      setIsSubmitting(false);
      const mockUser = isAdminMode 
        ? { id: 'admin', name: 'Supervisor', role: 'admin' }
        : { id: accountId, name: staffList.find(s => s.id === accountId)?.name || 'Staff', role: 'staff' };
        
      if (onLoginSuccess) {
        onLoginSuccess(mockUser);
      }
    }, 1500); 
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${buildingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div 
        className="relative z-10 transition-all duration-700 overflow-hidden origin-center flex flex-col justify-center w-full max-w-3xl"
        style={{ 
          transform: isMounted ? 'scale(1)' : 'scale(0.95)', 
          opacity: isMounted ? 1 : 0,
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full border border-white/40 flex flex-col-reverse md:flex-row overflow-hidden relative min-h-[450px]">
          
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
              <img 
                src={logoImg} 
                alt="Loading" 
                className="w-24 h-24 object-contain animate-[spin_2s_linear_infinite]" 
              />
              <p className="mt-6 font-black text-[#176e57] tracking-widest uppercase text-sm animate-pulse">
                Authenticating...
              </p>
            </div>
          )}

          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            
            {showForgotToast && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl text-center animate-in slide-in-from-top-2">
                Please contact the Head Supervisor to reset your access PIN.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 flex flex-col">
              {isAdminMode ? (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admin Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition"
                      placeholder="admin@sjc.edu.ph"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Account</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#176e57] focus:ring-2 focus:ring-[#176e57]/20 transition appearance-none cursor-pointer"
                    >
                      {staffList.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password / PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition ${isAdminMode ? 'focus:border-amber-500 focus:ring-amber-500/20' : 'focus:border-[#176e57] focus:ring-[#176e57]/20'}`}
                    placeholder="••••••••"
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-slate-400 hover:text-[#176e57] transition-colors self-end mt-2"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 active:scale-95 text-white font-black rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 ${
                  isAdminMode 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' 
                    : 'bg-[#176e57] hover:bg-[#135c49] shadow-emerald-900/20'
                }`}
              >
                {isAdminMode && <Shield className="w-4 h-4" />}
                <span>Secure Sign In</span>
                {!isAdminMode && <ChevronRight className="w-4 h-4" />}
              </button>
              
              {isAdminMode && (
                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                  Cancel / Return to Staff Login
                </button>
              )}
            </form>
          </div>

          {/* Right Side: Logo & Branding */}
          <div className="w-full md:w-1/2 bg-[#176e57]/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-slate-200/50">
            <div 
              onClick={handleLogoClick}
              className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-md p-3 mb-6 cursor-pointer active:scale-95 transition-transform"
              title={!isAdminMode ? "Click 5 times for Admin Access" : ""}
            >
              <img src={logoImg} alt="SJC Logo" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 mb-1 text-center">
              {isAdminMode ? 'Admin Portal' : 'Staff Portal'}
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              PHINMA Saint Jude College
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}