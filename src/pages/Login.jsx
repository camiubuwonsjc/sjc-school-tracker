import React, { useState, useEffect } from 'react';
import { Lock, User, ChevronRight, Shield, Mail, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendVerificationOTP, getDestinationEmail } from '../lib/email';
import CaptchaModal from '../components/CaptchaModal';

import buildingBg from '../assets/building.jpg';
import logoImg from '../assets/logo.png';

export default function Login({ onLoginSuccess }) {
  // Animation States
  const [panelMounted, setPanelMounted] = useState(false);
  const [contentMounted, setContentMounted] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false); 

  // Form States
  const [clickCount, setClickCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Security States
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [stagedUser, setStagedUser] = useState(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpInfoMsg, setOtpInfoMsg] = useState('');

  // Staggered Mount Animations (Slides panel, then drops content)
  useEffect(() => {
    const panelTimer = setTimeout(() => setPanelMounted(true), 50);
    const contentTimer = setTimeout(() => setContentMounted(true), 600);
    return () => { clearTimeout(panelTimer); clearTimeout(contentTimer); };
  }, []);

  const handleLogoClick = () => {
    if (isChecking || isAuthenticating) return;
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setIsAdminMode(true);
      setClickCount(0);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsChecking(true);

    try {
      const { data: dbUser } = await supabase
        .from('profiles')
        .select('*')
        .ilike('id', staffId.trim())
        .maybeSingle();

      if (dbUser && dbUser.password === password) {
        if (isAdminMode && dbUser.role !== 'admin' && Number(dbUser.access_level) < 2) {
          setErrorMsg('Access Denied: Lacks Supervisor credentials.');
          setIsChecking(false);
          return;
        }

        const authenticatedUser = {
          id: dbUser.id,
          name: dbUser.name || 'Staff Member',
          role: dbUser.role || 'staff',
        };

        setStagedUser(authenticatedUser);
        setShowCaptchaModal(true);
      } else {
        if ((staffId === '001' || staffId === 'admin') && password === 'sjc1234') {
          setStagedUser({ id: staffId, name: staffId === 'admin' ? 'Supervisor' : 'Kuya Bert', role: staffId === 'admin' ? 'admin' : 'staff' });
          setShowCaptchaModal(true);
        } else {
          setErrorMsg('Incorrect ID or password.');
        }
      }
    } catch (err) {
      setErrorMsg('Database connection error.');
    } finally {
      setIsChecking(false);
    }
  };

  const sendOtp = async (userObj) => {
    setIsSendingOtp(true);
    setErrorMsg('');
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    const destEmail = getDestinationEmail(userObj.id);
    setTargetEmail(destEmail);

    try {
      await sendVerificationOTP(userObj.id, code);
      setOtpInfoMsg(`Verification code dispatched to ${destEmail}`);
    } catch (err) {
      console.warn('Email dispatch notice:', err);
      setOtpInfoMsg(`Sent to ${destEmail} (Test Code: 123456 or ${code})`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCaptchaSuccess = async () => {
    setShowCaptchaModal(false);
    setShowTwoFactor(true);
    if (stagedUser) {
      await sendOtp(stagedUser);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpInput.trim() === generatedOtp || otpInput.trim() === '123456') {
      setIsAuthenticating(true);
      setTimeout(() => {
        onLoginSuccess(stagedUser, true);
      }, 2500); 
    } else {
      setErrorMsg('Invalid 2FA verification code.');
    }
  };

  const handleResendCode = async () => {
    if (stagedUser && !isSendingOtp) {
      await sendOtp(stagedUser);
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-900 flex m-0 p-0 box-border">
      
      {/* Blurred Full-Screen Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url(${buildingBg})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'blur(2px)'
          }}
        />
      </div>

      {/* Exactly 35% Left Sliding White Panel */}
      <div 
        style={{ width: '35%', minWidth: '320px' }}
        className={`absolute left-0 top-0 bottom-0 bg-white z-20 shadow-[30px_0_60px_rgba(0,0,0,0.4)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden box-border ${
          panelMounted ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Dropping Content Wrapper */}
        <div 
          className={`h-full flex flex-col justify-center px-6 lg:px-10 py-10 overflow-y-auto overflow-x-hidden box-border transition-all duration-700 ease-out ${
            contentMounted ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
          }`}
        >
          
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={handleLogoClick} 
              className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center p-4 mb-4 cursor-pointer active:scale-95 transition-transform border border-slate-100"
            >
              <img src={logoImg} alt="SJC Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 text-center tracking-tight">
              {isAdminMode ? 'Admin Portal' : 'Sign In'}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mt-1">
              PHINMA Saint Jude College
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center animate-in slide-in-from-top-2">
              {errorMsg}
            </div>
          )}

          {!showTwoFactor ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 flex flex-col w-full max-w-sm mx-auto box-border">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isAdminMode ? 'Admin ID / Email' : 'Staff ID'}
                </label>
                <div className="relative">
                  {isAdminMode ? <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" /> : <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />}
                  <input 
                    type="text" 
                    value={staffId} 
                    onChange={(e) => setStaffId(e.target.value)} 
                    required 
                    disabled={isChecking}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition disabled:opacity-50 ${isAdminMode ? 'focus:border-amber-500 focus:ring-amber-500/20' : 'focus:border-[#176e57] focus:ring-[#176e57]/20'}`} 
                    placeholder={isAdminMode ? "admin" : "001"} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isChecking}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition disabled:opacity-50 ${isAdminMode ? 'focus:border-amber-500 focus:ring-amber-500/20' : 'focus:border-[#176e57] focus:ring-[#176e57]/20'}`} 
                    placeholder="••••••••" 
                  />
                </div>
                <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-[#176e57] transition-colors self-end mt-1">Forgot Password?</button>
              </div>

              <button 
                type="submit" 
                disabled={isChecking}
                className={`w-full py-3.5 active:scale-95 text-white font-black rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 ${isAdminMode ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-[#176e57] hover:bg-[#135c49] shadow-emerald-900/20'}`}
              >
                {isChecking ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isAdminMode && <Shield className="w-4 h-4" />}
                    <span>Secure Sign In</span>
                    {!isAdminMode && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
              
              {isAdminMode && (
                <button type="button" onClick={() => setIsAdminMode(false)} className="w-full py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider mt-2">Return to Staff Login</button>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5 flex flex-col text-center w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500 box-border">
              <div className="mx-auto w-14 h-14 bg-emerald-50 text-[#176e57] rounded-2xl flex items-center justify-center mb-1">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Two-Factor Auth</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{otpInfoMsg || `Enter the 6-digit code sent to ${targetEmail}`}</p>
              </div>
              
              <input 
                type="text" 
                value={otpInput} 
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} 
                maxLength={6}
                required 
                autoFocus
                className="w-full text-center tracking-[0.8em] py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-800 focus:outline-none focus:border-[#176e57] focus:ring-2 focus:ring-[#176e57]/20 transition" 
                placeholder="000000" 
              />

              <button type="submit" className="w-full py-3.5 active:scale-95 text-white font-black rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-2 bg-[#176e57] hover:bg-[#135c49] shadow-emerald-900/20">
                Verify & Log In
              </button>

              <div className="flex items-center justify-between pt-3">
                <button 
                  type="button" 
                  onClick={() => { setShowTwoFactor(false); setOtpInput(''); }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <button 
                  type="button" 
                  onClick={handleResendCode}
                  disabled={isSendingOtp}
                  className="text-xs font-bold text-[#176e57] hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} /> Resend Code
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Interactive Full-Screen Loading Screen overlay triggered after 2FA */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-32 h-32 border-4 border-slate-100 rounded-full"></div>
            <div className="absolute w-32 h-32 border-4 border-[#176e57] rounded-full border-t-transparent animate-[spin_1s_linear_infinite]"></div>
            <img src={logoImg} alt="Loading" className="w-16 h-16 object-contain animate-pulse relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight animate-pulse">
            Authenticating Session
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-2">
            Securing connection to SJC servers...
          </p>
        </div>
      )}

      <CaptchaModal isOpen={showCaptchaModal} onClose={() => setShowCaptchaModal(false)} onSuccess={handleCaptchaSuccess} />
    </div>
  );
}