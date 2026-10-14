import React, { useState, useEffect } from 'react';
import { Lock, Mail, ChevronRight } from 'lucide-react';

export default function Login() {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Triggers the poppy animation instantly upon load
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Add your actual login logic here
    setTimeout(() => setIsSubmitting(false), 1000); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      {/* Animated Wrapper Container */}
      <div 
        className="transition-all duration-700 overflow-hidden origin-left flex flex-col justify-center"
        style={{ 
          width: isMounted ? '100%' : '1%', 
          opacity: isMounted ? 1 : 0,
          maxWidth: '400px', // Ensures the maximum width remains standard for a login box
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
        }}
      >
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full border border-slate-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-500">Sign in to the SJC Facilities Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-[#176e57] focus:ring-1 focus:ring-[#176e57] transition"
                  placeholder="admin@sjc.edu.ph"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-[#176e57] focus:ring-1 focus:ring-[#176e57] transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#176e57] hover:bg-[#135c49] active:scale-95 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2 mt-4"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}