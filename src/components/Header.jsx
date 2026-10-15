import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  User, Shield, Key, Smartphone, Lock, 
  LogOut, CheckCircle2, Clock, MapPin, X, Bell,
  LayoutDashboard, DoorOpen, Package, ShieldCheck,
  ChevronDown, Megaphone, Users, RefreshCw, Zap
} from 'lucide-react';

export default function Header({ user, onOpenStaffPresence, onOpenAdminModal, activeTab, setActiveTab }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || 'Staff Member',
    role: user?.user_metadata?.role || 'Custodial Staff',
    assignedFloor: user?.user_metadata?.assigned_floor || '3rd Floor - Main Wing',
    shiftStatus: 'active',
    assignedZones: ['Restrooms 3A-3C', 'Hallway B', 'Storage Room 302']
  });

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loadingPassword, setLoadingPassword] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const isAdmin = profileData.role.toLowerCase().includes('admin') || user?.email?.includes('admin') || true;

  // Handle Shift Status update in Supabase profile
  const handleShiftChange = async (status) => {
    setProfileData(prev => ({ ...prev, shiftStatus: status }));
    try {
      await supabase
        .from('profiles')
        .update({ shift_status: status, last_seen: new Date().toISOString() })
        .eq('id', user?.id);
    } catch (err) {
      console.error('Error updating shift status:', err);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoadingPassword(true);
    setPasswordMsg({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoadingPassword(false);
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsPasswordModalOpen(false), 1500);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-[#176e57] text-white border-b border-emerald-800/40 px-6 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">
      {/* App Branding */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-base shadow-inner">
            JT
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-wide">PHINMA Saint Jude College</h1>
            <p className="text-xs text-emerald-100/80 font-medium">Inventory & Janitorial Tracker</p>
          </div>
        </Link>
      </div>

      {/* ================= MAIN NAVIGATION LINKS ================= */}
      <nav className="hidden md:flex items-center gap-1 bg-emerald-900/30 p-1 rounded-xl border border-emerald-500/20">
        {setActiveTab ? (
          // State-driven tab switcher
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#176e57] font-semibold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'rooms'
                  ? 'bg-white text-[#176e57] font-semibold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <DoorOpen size={15} />
              Rooms
            </button>

            <button
              onClick={() => setActiveTab('supplies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                activeTab === 'supplies'
                  ? 'bg-white text-[#176e57] font-semibold shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
              }`}
            >
              <Package size={15} />
              Supplies
            </button>

            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setIsAdminMenuOpen(!isAdminMenuOpen);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                    activeTab === 'admin'
                      ? 'bg-white text-[#176e57] font-semibold shadow-sm'
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }`}
                >
                  <ShieldCheck size={15} />
                  Admin Workspace
                  <ChevronDown size={13} className="ml-0.5 opacity-80" />
                </button>

                {/* Quick Admin Features Dropdown */}
                {isAdminMenuOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-slate-200 text-xs">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Admin Features
                    </div>
                    <button
                      onClick={() => { setActiveTab('admin'); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <LayoutDashboard size={14} className="text-emerald-400" /> System Analytics
                    </button>
                    <button
                      onClick={() => { onOpenAdminModal(); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <Megaphone size={14} className="text-amber-400" /> Broadcast Push
                    </button>
                    <button
                      onClick={() => { setActiveTab('admin'); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <Users size={14} className="text-indigo-400" /> Staff Floor Roster
                    </button>
                    <button
                      onClick={() => { setActiveTab('admin'); setIsAdminMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-800 rounded-lg flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <RefreshCw size={14} className="text-red-400" /> Campus Shift Reset
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Router-driven links (React Router NavLink)
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive 
                    ? 'bg-white text-[#176e57] font-semibold shadow-sm' 
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={15} />
              Dashboard
            </NavLink>

            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive 
                    ? 'bg-white text-[#176e57] font-semibold shadow-sm' 
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`
              }
            >
              <DoorOpen size={15} />
              Rooms
            </NavLink>

            <NavLink
              to="/supplies"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive 
                    ? 'bg-white text-[#176e57] font-semibold shadow-sm' 
                    : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                }`
              }
            >
              <Package size={15} />
              Supplies
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                    isActive 
                      ? 'bg-white text-[#176e57] font-semibold shadow-sm' 
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }`
                }
              >
                <ShieldCheck size={15} />
                Admin Workspace
              </NavLink>
            )}
          </>
        )}
      </nav>

      {/* Header Controls */}
      <div className="flex items-center gap-2.5">
        {/* Presence Roster Button */}
        <button
          onClick={onOpenStaffPresence}
          className="px-3 py-1.5 bg-emerald-800/60 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg flex items-center gap-2 border border-emerald-500/30 transition shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          Staff Roster
        </button>

        {/* Admin Broadcast Trigger */}
        {isAdmin && (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <Bell size={14} />
            Admin Broadcast
          </button>
        )}

        {/* User Profile Avatar / Trigger */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-900/40 hover:bg-emerald-900/70 p-1 pr-3 rounded-full border border-emerald-400/30 transition ml-1"
        >
          <div className="w-8 h-8 rounded-full bg-white text-[#176e57] font-bold text-xs flex items-center justify-center shadow">
            {profileData.fullName.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-white leading-tight">{profileData.fullName}</div>
            <div className="text-[10px] text-emerald-200 capitalize">{profileData.shiftStatus.replace('_', ' ')}</div>
          </div>
        </button>
      </div>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-[#176e57] border-b border-emerald-800/50 flex justify-between items-start text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#176e57] text-xl font-bold flex items-center justify-center shadow-lg">
                  {profileData.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{profileData.fullName}</h2>
                  <p className="text-xs text-emerald-100/90">{user?.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white border border-white/30">
                    {profileData.role}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Current Shift Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active', label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                    { id: 'break', label: 'On Break', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
                    { id: 'off_duty', label: 'Off Duty', color: 'bg-slate-700/40 text-slate-400 border-slate-700' },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => handleShiftChange(status.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                        profileData.shiftStatus === status.id 
                          ? `${status.color} ring-2 ring-emerald-500` 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        status.id === 'active' ? 'bg-emerald-400' : status.id === 'break' ? 'bg-amber-400' : 'bg-slate-500'
                      }`} />
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <MapPin size={16} className="text-emerald-400" />
                  <span>Assigned Zone: <strong className="text-white">{profileData.assignedFloor}</strong></span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Duty Bubbles & Coverage
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.assignedZones.map((zone, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-950/60 text-emerald-200 border border-emerald-800/50 rounded-lg text-xs font-medium"
                      >
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Security & Authentication
                </div>

                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs text-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Key size={16} className="text-slate-400" />
                    <span>Update Password</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Action</span>
                </button>

                <div className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-slate-400" />
                    <div>
                      <div>Two-Factor Auth (2FA / OTP)</div>
                      <div className="text-[10px] text-slate-500">Require email OTP on login</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl text-xs font-medium transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Lock size={18} className="text-emerald-400" />
                Update Password
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-xs ${
                passwordMsg.type === 'error' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loadingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}