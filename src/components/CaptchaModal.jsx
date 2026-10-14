import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw } from 'lucide-react';

export default function CaptchaModal({ isOpen, onClose, onSuccess }) {
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  const generateNewCaptcha = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(newCode);
    setInputVal('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      generateNewCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim() === captchaCode) {
      setError('');
      setInputVal('');
      onSuccess();
    } else {
      setError(`Incorrect code. Please enter ${captchaCode}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#176e57]">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Security Verification</h3>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500 font-medium">Please enter the security PIN below to verify human presence.</p>
          
          <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-center gap-3 select-none relative">
            <span className="text-2xl font-black tracking-widest text-[#176e57] line-through decoration-wavy">
              {captchaCode}
            </span>
            <button
              type="button"
              onClick={generateNewCaptcha}
              className="p-1.5 text-slate-400 hover:text-[#176e57] hover:bg-slate-200 rounded-lg transition-colors absolute right-3"
              title="Generate new PIN"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            required
            autoFocus
            placeholder="Enter security code"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#176e57]"
          />

          {error && <p className="text-xs text-rose-600 font-bold text-center">{error}</p>}

          <button type="submit" className="w-full py-3 bg-[#176e57] text-white font-bold rounded-xl hover:bg-[#135c49] transition-colors shadow-md">
            Verify & Continue
          </button>
        </form>
      </div>
    </div>
  );
}