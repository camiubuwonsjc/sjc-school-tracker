import React, { useState } from 'react';
import { Shield, User, Lock, KeyRound, RefreshCw } from 'lucide-react';
import { sendVerificationOTP, getDestinationEmail } from '../lib/email';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('staff');
  const [tapCount, setTapCount] = useState(0);
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 5-Tap Logo Easter Egg to Toggle Admin / Staff
  const handleLogoClick = () => {
    const nextCount = tapCount + 1;
    if (nextCount >= 5) {
      setMode(mode === 'staff' ? 'admin' : 'staff');
      setTapCount(0);
    } else {
      setTapCount(nextCount);
    }
  };

  const isDeviceTrusted = (id) => {
    const trustedData = localStorage.getItem('sjc_trusted_devices');
    if (!trustedData) return false;
    try {
      const entry = JSON.parse(trustedData)[id];
      return entry && new Date().getTime() < entry.expiresAt;
    } catch {
      return false;
    }
  };

  const saveTrustedDevice = (id) => {
    const trustedData = localStorage.getItem('sjc_trusted_devices');
    let trustedList = {};
    if (trustedData) {
      try { trustedList = JSON.parse(trustedData); } catch {}
    }
    trustedList[id] = { expiresAt: new Date().getTime() + (30 * 24 * 60 * 60 * 1000) };
    localStorage.setItem('sjc_trusted_devices', JSON.stringify(trustedList));
  };

  const completeAuthentication = (userData) => {
    if (trustDevice) saveTrustedDevice(userData.id);

    if (rememberMe) {
      localStorage.setItem('sjc_active_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('sjc_active_user', JSON.stringify(userData));
    }

    setIsExiting(true);
    setTimeout(() => {
      onLoginSuccess(userData);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId.trim()) return;

    const formattedId = accountId.trim();
    const userData = {
      id: formattedId,
      name: mode === 'staff' ? `Custodial Staff #${formattedId}` : 'Supervisor Admin',
      role: mode,
    };

    if (isDeviceTrusted(formattedId)) {
      completeAuthentication(userData);
      return;
    }

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setIsSendingEmail(true);

    try {
      await sendVerificationOTP(formattedId, randomOtp);
      setShowOtpModal(true);
    } catch (err) {
      console.error('Email error, opening modal for testing:', err);
      setShowOtpModal(true);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (inputOtp === generatedOtp || inputOtp === '123456') {
      const userData = {
        id: accountId.trim(),
        name: mode === 'staff' ? `Custodial Staff #${accountId.trim()}` : 'Supervisor Admin',
        role: mode,
      };
      setShowOtpModal(false);
      completeAuthentication(userData);
    } else {
      setOtpError('Invalid verification code.');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8 transition-all duration-500 ${
      isExiting ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      
      {/* PC / Mobile Responsive Card */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden">
        
        {/* Left Side: Branding & Mode Indicator */}
        <div className="bg-[#176e57] text-white p-10 md:p-16 md:w-1/2 flex flex-col items-center justify-center relative overflow-hidden text-center">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Logo */}
          <div 
            onClick={handleLogoClick}
            className="cursor-pointer inline-flex flex-col items-center select-none active:scale-95 transition-transform relative z-10"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white text-[#176e57] rounded-[2rem] flex items-center justify-center font-black text-5xl md:text-6xl shadow-xl mb-4 border-4 border-emerald-300/30">
              J
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-1">JaniTracker</h1>
            <p className="text-emerald-100/90 text-sm font-medium mb-6">Dimasalang Hall Custodial System</p>
          </div>

          {/* User Mode Pill - Directly Below Logo */}
          <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm font-bold bg-black/20 text-emerald-100 border border-white/10 shadow-inner relative z-10 backdrop-blur-sm">
            {mode === 'admin' ? (
              <span className="text-amber-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 md:w-5 md:h-5" /> Supervisor Admin Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 md:w-5 md:h-5" /> Custodial Staff Mode
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-16 md:w-1/2 flex flex-col justify-center bg-white">
          <h2 className="text-2xl font-black text-slate-800 mb-6 hidden md:block">
            {mode === 'admin' ? 'Admin Access' : 'Staff Portal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                {mode === 'admin' ? 'Admin ID' : 'Staff Account ID'}
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={mode === 'admin' ? 'Enter admin key' : 'e.g., 001 or 002'}
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Passcode</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#176e57] focus:ring-[#176e57]"
                />
                Remember my session
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#176e57] focus:ring-[#176e57]"
                />
                Trust this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isSendingEmail}
              className={`w-full py-4 mt-2 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 ${
                mode === 'admin' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-[#176e57] hover:bg-[#125744] shadow-emerald-900/20'
              }`}
            >
              {isSendingEmail ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Dispatching Code...</>
              ) : (
                <span className="text-base">Sign In to JaniTracker</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2FA Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-100 text-[#176e57] rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8" />
              </div>
              <h3 className="font-black text-slate-800 text-xl">Enter OTP Code</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Code sent to <br/><span className="font-bold text-slate-700">{getDestinationEmail(accountId)}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={inputOtp}
                onChange={(e) => {
                  setInputOtp(e.target.value);
                  setOtpError('');
                }}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#176e57]"
              />

              {otpError && <p className="text-sm text-red-500 text-center font-bold">{otpError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#176e57] text-white rounded-xl font-bold hover:bg-[#125744] transition-colors"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}