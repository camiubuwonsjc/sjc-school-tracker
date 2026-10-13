import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Lock, User, ShieldAlert } from 'lucide-react';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // Instant login helper to prevent any stuck loading states
  const completeLogin = (id, role, name) => {
    const userData = { id, role, name };
    localStorage.setItem('sjc_active_user', JSON.stringify(userData));
    sessionStorage.setItem('sjc_active_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Hidden Multi-Click Admin Bypass (Presentation Mode)
  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 5) {
      completeLogin('admin', 'admin', 'Supervisor');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const defaultAccounts = {
      'admin': 'admin123', '001': '12345678', '002': '12345678',
      '003': '12345678', '004': '12345678', '005': '12345678'
    };
    
    let isValid = false;
    
    // Check hardcoded backup passwords first for instant offline reliability
    if (defaultAccounts[cleanUsername] === password) {
      isValid = true;
    }

    // Check database if local match fails
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
        console.log("Database offline, falling back to local verification", err);
      }
    }

    if (!isValid) {
      setError('Invalid Staff ID or Password.');
      setIsLoading(false);
      return;
    }

    const role = cleanUsername === 'admin' ? 'admin' : 'staff';
    const name = role === 'admin' ? 'Supervisor' : `Staff #${username.trim()}`;
    
    setIsLoading(false);
    completeLogin(username.trim(), role, name);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{ backgroundImage: "url('/building.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Container - Split Layout (Form Left, Logo Right) */}
      <div className="relative z-10 w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/40 p-8 md:p-12 overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* LEFT SIDE: Username, Password & Form */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">PHINMA Saint Jude College</h1>
              <p className="text-xs font-bold text-[#176e57] uppercase tracking-wider">Inventory & Janitorial Tracker</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                  <input type="text" required placeholder="Staff ID (e.g., 001 or admin)" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176e57]" />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                  <input type="password" required placeholder="Security Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176e57]" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#176e57] text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#125744] transition-all shadow-lg shadow-emerald-900/20 text-sm">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Secure Login'}
              </button>
            </form>
            
            <div className="text-left">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Authorized Personnel Only</p>
            </div>
          </div>

          {/* RIGHT SIDE: Logo in the Middle (5-Tap Bypass) */}
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/80 rounded-[2.5rem] border border-slate-200/60 shadow-inner">
            <div 
              onClick={handleLogoTap} 
              className="w-32 h-32 bg-white rounded-3xl shadow-md p-2 cursor-pointer active:scale-95 transition-transform border border-slate-100 flex items-center justify-center mb-4"
            >
              <img 
                src="/logo.png" 
                alt="SJC Logo" 
                className="w-full h-full object-contain rounded-2xl" 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
              />
              <div style={{ display: 'none' }} className="w-full h-full bg-emerald-50 rounded-2xl items-center justify-center font-black text-2xl text-[#176e57]">SJC</div>
            </div>
            
            <h3 className="font-black text-slate-700 text-sm">Dimasalang Campus</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Tap logo 5x for instant supervisor access</p>
          </div>

        </div>
      </div>
    </div>
  );
}