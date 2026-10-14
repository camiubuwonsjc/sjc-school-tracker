import React, { useState, useEffect } from 'react';
import { Lock, User, ChevronRight, Shield, Mail } from 'lucide-react';

// Importing assets from the src/assets folder
import buildingBg from '../assets/building.jpg';
import logoImg from '../assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Secret Admin Mode State
  const [clickCount, setClickCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Form State
  const [accountId, setAccountId] = useState('001');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Classic Staff Roster
  const staffList = [
    { id: '001', name: 'Kuya Bert' },
    { id: '002', name: 'Ate Linda' },
    { id: '003', name: 'Kuya Jon' },
    { id: '004', name: 'Ate Marites' },
    { id: '005', name: 'Kuya Jomar' },
  ];

  // Triggers the poppy animation instantly upon load
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // 5-click secret trigger for Admin Mode
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setIsAdminMode(true);
      setClickCount(0); // Reset after triggering
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Replace with your actual Supabase authentication logic
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Mock user object returning to App.jsx
      const mockUser = isAdminMode 
        ? { id: 'admin', name: 'Supervisor', role: 'admin' }
        : { id: accountId, name: staffList.find(s => s.id === accountId)?.name || 'Staff', role: 'staff' };
        
      if (onLoginSuccess) {
        onLoginSuccess(mockUser);
      }
    }, 1000); 
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
      {/* SJC Green Overlay for contrast */}
      <div className="absolute inset-0 bg-[#176e57]/85 backdrop-blur-[2px] z-0" />

      {/* Animated Wrapper Container */}
      <div 
        className="relative z-10 transition-all duration-700 overflow-hidden origin-center flex flex-col justify-center"
        style={{ 
          width: isMounted ? '100%' : '1%', 
          opacity: isMounted ? 1 : 0,
          maxWidth: '400px', 
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      >
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full border border-white/20">
          
          <div className="text-center mb-8 flex flex-col items-center">
            {/* Logo with 5-click secret admin trigger */}
            <div 
              onClick={handleLogoClick}
              className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm p-2 mb-4 cursor-pointer active:scale-95 transition-transform"
              title={!isAdminMode ? "Click 5 times for Admin Access" : ""}
            >
              <img src={logoImg} alt="SJC Logo" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              {isAdminMode ? 'Admin Portal' : 'Staff Portal'}
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              PHINMA Saint Jude College
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Conditional input: Staff Dropdown vs Admin Email */}
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

            <div className="space-y-1.5">
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 active:scale-95 text-white font-black rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4 ${
                isAdminMode 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' 
                  : 'bg-[#176e57] hover:bg-[#135c49] shadow-emerald-900/20'
              }`}
            >
              {isAdminMode && !isSubmitting && <Shield className="w-4 h-4" />}
              <span>{isSubmitting ? 'Authenticating...' : 'Secure Sign In'}</span>
              {!isSubmitting && !isAdminMode && <ChevronRight className="w-4 h-4" />}
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
      </div>
    </div>
  );
}