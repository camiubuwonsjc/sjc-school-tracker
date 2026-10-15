import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Megaphone, X, Send } from 'lucide-react';

export default function AdminBroadcastModal({ isOpen, onClose, user }) {
  const [announcementText, setAnnouncementText] = useState('');
  const [priority, setPriority] = useState('normal');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsSending(true);
    setStatusMsg({ type: '', text: '' });

    const { error } = await supabase.from('announcements').insert([
      {
        created_by: user?.email || 'Admin',
        content: announcementText,
        priority: priority,
        created_at: new Date().toISOString(),
      },
    ]);

    setIsSending(false);

    if (error) {
      setStatusMsg({ type: 'error', text: error.message });
    } else {
      setStatusMsg({ type: 'success', text: 'Announcement broadcasted successfully!' });
      setAnnouncementText('');
      setTimeout(() => {
        setStatusMsg({ type: '', text: '' });
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">Broadcast Announcement</h3>
              <p className="text-xs text-slate-400">Push to all active staff dashboards</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {statusMsg.text && (
          <div className={`p-3 rounded-xl text-xs ${
            statusMsg.type === 'error' 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`flex-1 py-2 text-xs rounded-xl border font-medium transition ${
                  priority === 'normal' 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Normal Priority
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`flex-1 py-2 text-xs rounded-xl border font-medium transition ${
                  priority === 'urgent' 
                    ? 'bg-red-600 border-red-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Urgent Alert
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Message Content
            </label>
            <textarea
              rows={4}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="Enter announcement text for staff members..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              {isSending ? 'Sending...' : 'Broadcast'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}