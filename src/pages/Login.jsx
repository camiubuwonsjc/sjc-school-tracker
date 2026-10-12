import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Lock, User, ShieldAlert, Grid, Package } from 'lucide-react';

// Explicitly import your local assets for Vite
import buildingBg from '../assets/building.jpg';
import sjcLogo from '/logo.png';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Hidden Multi-Click Admin Bypass (Presentation Mode)
  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 5) {
      setUsername('admin');
      setPassword('admin123');
      const userData = { id: 'admin', role: 'admin', name: 'Supervisor' };
      localStorage.setItem('sjc_active_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. BULLETPROOF OFFLINE FALLBACK - Check this FIRST to completely prevent connection errors
    const defaultAccounts = {
      'admin': 'admin123', '001': '12345678', '002': '12345678',
      '003': '12345678', '004': '12345678', '005': '12345678'
    };
    
    let isValid = false;
    
    // Check local hardcoded passwords first. If correct, bypass network check.
    if (defaultAccounts[username.trim().toLowerCase()] === password) {
      isValid = true;
    }

    // 2. Only ping the database if the local password didn't match
    if (!isValid) {
      try {
        const { data, error: fetchError } = await supabase
          .from('staff_credentials')
          .select('*')
          .eq('id', username.trim())
          .maybeSingle();

        if (!fetchError && data && data.password === password) {
          isValid = true;
        }
      } catch (err) {
        console.log("Network fetch skipped or failed", err);
      }
    }

    // 3. Final Validation
    if (!isValid) {
      setError('Invalid Staff ID or Password.');
      setIsLoading(false);
      return;
    }

    const role = username.toLowerCase() === 'admin' ? 'admin' : 'staff';
    const name = role === 'admin' ? 'Supervisor' : `Staff #${username}`;
    
    const userData = { id: username.trim(), role, name };
    localStorage.setItem('sjc_active_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{ backgroundImage: `url(${buildingBg})` }}
    >
      {/* Removed the blue tint. Using a subtle dark overlay just enough to make white text readable */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* LEFT SIDE: ROOMS (Restored) */}
        <div className="hidden lg:flex flex-col w-1/3 bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 text-white shadow-2xl animate-in slide-in-from-left">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Grid className="w-7 h-7 text-emerald-300" />
          </div>
          <h2 className="text-3xl font-black mb-3 drop-shadow-md">Rooms</h2>
          <p className="text-emerald-50 leading-relaxed font-medium drop-shadow">
            Real-time tracking of daily sanitation, floor rosters, and instant AC overrides across all active halls.
          </p>
        </div>

        {/* CENTER: LOGIN CARD */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/50 p-8 space-y-6">
          
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {/* 5-Tap Bypass Logo */}
            <div 
              onClick={handleLogoTap} 
              className="w-28 h-28 bg-slate-50 rounded-3xl shadow-lg p-2 cursor-pointer active:scale-95 transition-transform border border-slate-100"
            >
              <img 
                src={sjcLogo} 
                alt="SJC Logo" 
                className="w-full h-full object-contain rounded-2xl" 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
              />
              <div style={{ display: 'none' }} className="w-full h-full bg-emerald-50 rounded-2xl items-center justify-center font-black text-2xl text-[#176e57]">SJC</div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">PHINMA Saint Jude College</h1>
              <p className="text-sm font-bold text-[#176e57]">Inventory and Janitory Tracker</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-5 h-5" /> {error}
              </div>
            )}
            
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                <input type="text" required placeholder="Staff ID (e.g., 001 or admin)" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                <input type="password" required placeholder="Security Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#176e57] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#125744] transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 mt-2">
              {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Access...</> : 'Secure Login'}
            </button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
          </div>
        </div>

        {/* RIGHT SIDE: SUPPLIES (Restored) */}
        <div className="hidden lg:flex flex-col w-1/3 bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 text-white shadow-2xl animate-in slide-in-from-right">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <Package className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-3xl font-black mb-3 drop-shadow-md">Supplies</h2>
          <p className="text-emerald-50 leading-relaxed font-medium drop-shadow">
            Monitor stockroom items, track chemical usage, and maintain equipment availability seamlessly.
          </p>
        </div>

      </div>
    </div>
  );
}