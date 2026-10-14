import React from 'react';
import { LogOut } from 'lucide-react';

import logoImg from '../assets/logo.png';

export default function Header({ user, setUser, broadcast }) {
  const handleLogout = () => {
    localStorage.removeItem('sjc_active_user');
    sessionStorage.removeItem('sjc_active_user');
    setUser(null);
  };

  return (
    <header className="bg-[#176e57] text-white p-3.5 md:p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo and Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm p-1.5">
            <img src={logoImg} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black leading-tight tracking-tight">
              PHINMA Saint Jude College
            </h1>
            <p className="text-[10px] md:text-xs text-emerald-100 font-bold opacity-90">
              Inventory and Janitory Tracker
            </p>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-300'}`} />
            <span className="text-xs font-bold">{user?.name}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="p-2 md:px-3 md:py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl md:rounded-full flex items-center gap-2"
          >
            <span className="hidden md:block text-xs font-bold">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}