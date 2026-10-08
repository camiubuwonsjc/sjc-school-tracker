import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, LogOut, X, Shield, Home, Grid, Package, ShieldCheck, Sparkles, KeyRound, MonitorSmartphone, Loader2, CheckCircle2 } from 'lucide-react';

export default function Header({ user, setUser, broadcast }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null); // { type: 'error' | 'success', msg: '' }
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const desktopTabs = [
    { id: 'home', label: 'Dashboard', path: '/', icon: Home },
    { id: 'rooms', label: 'Rooms', path: '/rooms', icon: Grid },
    { id: 'supplies', label: 'Supplies', path: '/supplies', icon: Package },
  ];
  if (user?.role === 'admin') desktopTabs.push({ id: 'admin', label: 'Admin Workspace', path: '/admin', icon: ShieldCheck });

  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef(0);
  const handleTouchStart = (e) => touchStartY.current = e.touches[0].clientY;
  const handleTouchMove = (e) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) setDragY(deltaY);
  };
  const handleTouchEnd = () => {
    if (dragY > 75) setIsProfileOpen(false);
    setDragY(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('sjc_active_user');
    sessionStorage.removeItem('sjc_active_user');
    setUser(null);
  };

  // Securely update password in DB
  const handleUpdatePassword = async () => {
    setPasswordStatus(null);
    if (!currentPassword || !newPassword || !confirmPassword) return setPasswordStatus({ type: 'error', msg: 'Please fill out all fields.' });
    if (newPassword !== confirmPassword) return setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
    if (newPassword.length < 6) return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });

    setIsUpdatingPassword(true);
    
    // Step 1: Verify Current Password
    const { data: userData, error: fetchError } = await supabase.from('staff_credentials').select('password').eq('id', user.id).single();
    if (fetchError || !userData) {
      setIsUpdatingPassword(false);
      return setPasswordStatus({ type: 'error', msg: 'Could not verify current account.' });
    }
    if (userData.password !== currentPassword) {
      setIsUpdatingPassword(false);
      return setPasswordStatus({ type: 'error', msg: 'Current password does not match.' });
    }

    // Step 2: Update to New Password
    const { error: updateError } = await supabase.from('staff_credentials').update({ password: newPassword }).eq('id', user.id);
    if (updateError) {
      setPasswordStatus({ type: 'error', msg: 'Failed to update database.' });
    } else {
      setPasswordStatus({ type: 'success', msg: 'Password securely updated!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }
    setIsUpdatingPassword(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#176e57] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white text-[#176e57] rounded-xl flex items-center justify-center font-black text-xl shadow-sm">J</div>
            <div>
              <h1 className="text-base md:text-lg font-black leading-tight tracking-wide">JaniTracker</h1>
              <p className="text-[10px] md:text-xs text-emerald-100/90 font-medium">Dimasalang Hall</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {desktopTabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => navigate(tab.path)} className={`flex items-center gap-2 font-bold transition-all ${isActive ? tab.id === 'admin' ? 'text-amber-300 scale-105' : 'text-white scale-105' : 'text-emerald-200 hover:text-white'}`}>
                  <Icon className="w-4 h-4" /> <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors border border-white/10">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#176e57] flex items-center justify-center text-sm font-bold">{user?.id ? user.id.slice(-2) : '00'}</div>
            <span className="text-sm font-bold max-w-[100px] truncate hidden sm:block">{user?.role === 'admin' ? 'Supervisor' : `Staff #${user?.id}`}</span>
          </button>
        </div>
      </header>

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="flex-1 md:hidden" onClick={() => setIsProfileOpen(false)} />
          <div className="hidden md:block absolute inset-0" onClick={() => setIsProfileOpen(false)} />

          <div className="bg-white rounded-t-3xl md:rounded-3xl p-6 shadow-2xl transition-transform duration-200 flex flex-col max-w-md mx-auto w-full max-h-[85vh] relative z-10" style={{ transform: window.innerWidth < 768 ? `translateY(${dragY}px)` : 'none' }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="md:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto cursor-grab active:cursor-grabbing mb-4" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#176e57]/10 text-[#176e57] flex items-center justify-center font-bold text-xl">
                  {user?.role === 'admin' ? <Shield className="w-6 h-6 text-amber-600" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{user?.name}</h3>
                  <p className="text-sm text-slate-500 capitalize font-medium">Assigned: Dimasalang F1</p>
                </div>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto space-y-4 py-4 pr-1 scrollbar-none">
              <div className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#176e57] mb-3"><Sparkles className="w-5 h-5" /><h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Experience Mode</h4></div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-600">Presentation Animations (ON)</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#176e57] focus:ring-[#176e57]" />
                </label>
              </div>

              {/* Working Password Settings */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#176e57] mb-1">
                  <KeyRound className="w-5 h-5" />
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Security & Password</h4>
                </div>
                
                {passwordStatus && (
                  <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${passwordStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {passwordStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {passwordStatus.msg}
                  </div>
                )}

                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" />
                <input type="password" placeholder="New Password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" />
                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" />
                
                <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="w-full py-2.5 bg-[#176e57] hover:bg-[#125744] text-white font-bold rounded-xl text-sm transition-colors flex justify-center items-center gap-2">
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Update Password'}
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#176e57]"><MonitorSmartphone className="w-5 h-5" /><h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Two-Factor Trusted Devices</h4></div>
                <p className="text-xs text-slate-500 font-medium">Manage 30-day remembered accounts.</p>
                <button onClick={() => { localStorage.removeItem('sjc_trusted_devices'); alert("Trusted devices cleared."); }} className="w-full py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Forget All Trusted Devices</button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 shrink-0">
              <button onClick={() => setShowLogoutModal(true)} className="w-full py-3.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
                <LogOut className="w-5 h-5" /> Log Out of Session
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 relative z-50">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><LogOut className="w-7 h-7" /></div>
            <h3 className="font-black text-slate-800 text-xl">Confirm Sign Out</h3>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}