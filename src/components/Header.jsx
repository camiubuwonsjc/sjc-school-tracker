import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Home, Building2, Package, ShieldCheck } from 'lucide-react';

import logoImg from '../assets/logo.png';

export default function Header({ user, setUser }) {
  const handleLogout = () => {
    localStorage.removeItem('sjc_active_user');
    sessionStorage.removeItem('sjc_active_user');
    setUser(null);
  };

  const navLinkClass = ({ isActive }) =>
    `hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
      isActive ? 'bg-white/20 text-white' : 'text-emerald-100 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <header className="bg-[#176e57] text-white p-3.5 md:p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm p-1.5 flex-shrink-0">
            <img src={logoImg} alt="SJC" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-lg font-black leading-tight tracking-tight">PHINMA Saint Jude College</h1>
            <p className="text-[10px] md:text-xs text-emerald-100 font-bold opacity-90">Inventory and Janitory Tracker</p>
          </div>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-2 md:gap-4">
          <NavLink to="/dashboard" className={navLinkClass}><Home className="w-4 h-4" /> Dashboard</NavLink>
          <NavLink to="/rooms" className={navLinkClass}><Building2 className="w-4 h-4" /> Rooms</NavLink>
          <NavLink to="/supplies" className={navLinkClass}><Package className="w-4 h-4" /> Supplies</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}><ShieldCheck className="w-4 h-4" /> Admin Workspace</NavLink>
          )}
        </nav>

        {/* User Profile Area */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-400' : 'bg-emerald-300'}`} />
            <span className="text-xs font-bold whitespace-nowrap">{user?.name}</span>
          </div>
          
          <button onClick={handleLogout} className="p-2 md:px-3 md:py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl md:rounded-full flex items-center gap-2">
            <span className="hidden md:block text-xs font-bold">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}