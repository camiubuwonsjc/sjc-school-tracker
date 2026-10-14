import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Megaphone, RotateCcw, Activity } from 'lucide-react';

export default function Admin({ rooms, supplies, setBroadcast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [noticeText, setNoticeText] = useState('');

  const handleSaveBroadcast = async (e) => {
    e.preventDefault();
    if (!noticeText.trim()) return;
    try {
      await supabase.from('broadcast').upsert({ id: 1, active: true, message: noticeText.trim(), posted_by: 'Admin' });
      setNoticeText('');
      alert('Broadcast Live!');
    } catch (err) { console.error(err); }
  };

  const handleResetDay = async () => {
    if (!window.confirm('Reset all 35 classrooms back to "Pending" for the new shift?')) return;
    try {
      await supabase.from('rooms').update({ status: 'pending', staff: 'Unassigned' }).neq('id', 'placeholder');
      alert('Shift reset successful!');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#176e57] rounded-xl text-white"><ShieldCheck className="w-6 h-6" /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Admin Workspace</h2>
          <p className="text-sm font-semibold text-slate-500">Supervisor Control Panel</p>
        </div>
      </div>

      <div className="flex gap-3 border-b border-slate-200 pb-4">
        {[
          { id: 'overview', icon: Activity, label: 'Overview & Reset' },
          { id: 'notice', icon: Megaphone, label: 'Broadcast Banner' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-slate-800">System Reset</h3>
            <button
              onClick={handleResetDay}
              className="px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-bold text-sm flex items-center gap-3 transition"
            >
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Reset Entire Campus for New Day (Wipes all room statuses)</span>
            </button>
          </div>
        )}

        {activeTab === 'notice' && (
          <form onSubmit={handleSaveBroadcast} className="max-w-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-800">Push Campus Announcement</h3>
            <textarea
              rows={4}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="Enter emergency or inspection notice here..."
              className="w-full p-4 border border-slate-200 rounded-2xl text-sm font-semibold bg-slate-50 focus:outline-none focus:border-[#176e57]"
            />
            <button type="submit" className="px-6 py-3 bg-[#176e57] text-white font-bold rounded-xl shadow-sm">
              Publish Broadcast
            </button>
          </form>
        )}
      </div>
    </div>
  );
}