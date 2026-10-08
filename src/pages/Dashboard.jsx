import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StaffPresenceModal from '../components/StaffPresenceModal';
import { 
  Building2, Package, Users, Send, Trash2, 
  AlertTriangle, Sparkles, ChevronRight, ClipboardCheck, CheckCircle2
} from 'lucide-react';

export default function Dashboard({ rooms, supplies, logs, onlineStaff, user }) {
  const navigate = useNavigate();
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const [newLogText, setNewLogText] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const totalRooms = 35;
  const cleanedRoomsCount = rooms.filter((r) => r.status === 'cleaned' || r.status === 'verified').length;
  const progressPercent = Math.round((cleanedRoomsCount / totalRooms) * 100) || 0;
  const lowStockCount = supplies.filter((s) => s.count <= s.threshold).length;

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogText.trim()) return;

    setIsSubmittingLog(true);
    const { error } = await supabase.from('logs').insert({
      text: newLogText.trim(),
      staff_id: user.id,
      staff_name: user.name,
      time: new Date().toISOString(),
    });

    if (!error) setNewLogText('');
    else console.error('Failed to dispatch log entry:', error);
    setIsSubmittingLog(false);
  };

  const handleDeleteLog = async (logId) => {
    const { error } = await supabase.from('logs').delete().eq('id', logId);
    if (error) console.error('Failed to delete log entry:', error);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8">
      {/* LEFT COLUMN (Main Desktop Content) */}
      <div className="flex-1 space-y-5 md:space-y-6">
        
        {/* Sanitation Progress Banner - Upgraded to Bright Pine Green */}
        <div className="bg-[#176e57] rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4 relative z-10">
            <div>
              <span className="text-xs md:text-sm uppercase tracking-widest font-bold text-emerald-200">
                Daily Sanitation Overall
              </span>
              <h2 className="text-2xl md:text-4xl font-black mt-1">
                {cleanedRoomsCount} of {totalRooms} Rooms Ready
              </h2>
            </div>
            <span className="text-3xl md:text-5xl font-black text-white bg-black/10 px-4 py-2 md:px-5 md:py-3 rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-sm shadow-inner">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full bg-black/20 h-4 md:h-5 rounded-full overflow-hidden p-1 border border-white/10 backdrop-blur-sm relative z-10">
            <div
              className="bg-emerald-300 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div onClick={() => navigate('/rooms')} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 space-y-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-emerald-50 text-[#176e57] flex items-center justify-center">
              <Building2 className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <div className="flex items-center justify-between"><h3 className="font-black text-slate-800 text-base md:text-lg">Room Matrix</h3><ChevronRight className="w-5 h-5 text-slate-400" /></div>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Floors 1 – 7 Status</p>
            </div>
          </div>

          <div onClick={() => navigate('/supplies')} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 space-y-4 relative">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <div>
              <div className="flex items-center justify-between"><h3 className="font-black text-slate-800 text-base md:text-lg">Stockroom</h3><ChevronRight className="w-5 h-5 text-slate-400" /></div>
              {lowStockCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full mt-1.5"><AlertTriangle className="w-4 h-4" /> {lowStockCount} Low Item{lowStockCount > 1 ? 's' : ''}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-[#176e57] bg-emerald-50 px-2.5 py-1 rounded-full mt-1.5"><CheckCircle2 className="w-4 h-4" /> Stocked</span>
              )}
            </div>
          </div>
        </div>

        {/* Floor Assignment & Presence Header */}
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-[#176e57]">
              <ClipboardCheck className="w-6 h-6" />
              <h3 className="font-black text-slate-800 text-base md:text-lg">Floor Roster & Presence</h3>
            </div>
            <button onClick={() => setIsPresenceOpen(true)} className="flex items-center justify-center gap-2 bg-emerald-50 text-[#176e57] hover:bg-emerald-100 px-4 py-2 rounded-2xl text-sm font-bold transition-colors">
              <Users className="w-4 h-4" /> <span>Online Staff ({onlineStaff.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((floorNum) => {
              const floorRooms = rooms.filter((r) => r.floor === floorNum);
              const floorCleaned = floorRooms.filter((r) => r.status === 'cleaned' || r.status === 'verified').length;
              const isFullyClean = floorRooms.length > 0 && floorCleaned === floorRooms.length;

              return (
                <div key={floorNum} onClick={() => navigate('/rooms')} className={`p-2.5 md:p-4 rounded-2xl text-center cursor-pointer border-2 transition-all hover:-translate-y-1 ${isFullyClean ? 'bg-emerald-500 text-white border-emerald-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'}`}>
                  <div className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-wider mb-0.5">F{floorNum}</div>
                  <div className="text-sm md:text-xl font-black">{floorCleaned}/5</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (Live Shift Handover Feed) */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-5">
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex-1 flex flex-col h-full max-h-[600px] md:max-h-none">
          <h3 className="font-black text-slate-800 text-base md:text-lg flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#176e57]" /> Live Handover Feed
          </h3>

          {/* Chat Feed */}
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar mb-4 flex flex-col">
            {logs.length === 0 ? (
              <p className="text-center text-sm font-medium text-slate-400 py-8 m-auto">No shift logs recorded today.</p>
            ) : (
              logs.map((log) => {
                const isMe = log.staff_id === user.id;
                return (
                  <div 
                    key={log.id} 
                    className={`p-4 rounded-2xl border flex flex-col gap-1.5 transition-colors relative group ${
                      isMe ? 'bg-emerald-50/50 border-emerald-200 ml-6 rounded-tr-sm' : 'bg-slate-50 border-slate-200/80 mr-6 rounded-tl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isMe ? 'text-[#176e57]' : 'text-slate-500'}`}>
                        {isMe ? 'You' : log.staff_name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">{log.text}</p>
                    
                    {/* Admins can delete any log, Users can delete their own */}
                    {(user.role === 'admin' || isMe) && (
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="absolute -right-2 -top-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
                        title="Delete message"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              }).reverse() // Reverse so newest is at the bottom like a real chat
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleAddLog} className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              required
              placeholder="Type report..."
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all"
            />
            <button
              type="submit"
              disabled={isSubmittingLog}
              className="px-5 bg-[#176e57] text-white rounded-2xl hover:bg-[#125744] transition-colors flex items-center justify-center shadow-md shadow-emerald-900/10 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <StaffPresenceModal isOpen={isPresenceOpen} onClose={() => setIsPresenceOpen(false)} onlineStaff={onlineStaff} />
    </div>
  );
}