import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { Wind, Lightbulb, Lock, CheckCircle2, AlertCircle, Clock, ShieldCheck, Check, Snowflake, UserCheck, FileText, Loader2 } from 'lucide-react';

export default function Rooms({ rooms, user }) {
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // AC Override States: 0 = closed, 1 = warning, 2 = loading, 3 = success (confetti)
  const [overrideStep, setOverrideStep] = useState(0); 
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalData, setModalData] = useState({});

  const floorRooms = rooms.filter((r) => r.floor === activeFloor);

  const statusConfig = {
    pending: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
    cleaned: { label: 'Cleaned', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    needs_reclean: { label: 'Needs Reclean', bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertCircle },
    verified: { label: 'Verified', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: ShieldCheck },
  };

  const openInspectionModal = (room) => {
    setSelectedRoom(room);
    setModalData({
      status: room.status || 'pending',
      class_in_session: room.class_in_session || false,
      ac_switch: room.ac_switch || false,
      lighting_switch: room.lighting_switch || false,
      door_locked: room.door_locked || false,
      notes: room.notes || '',
    });
  };

  const handleSaveInspection = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('rooms').update({ ...modalData, updated_at: new Date().toISOString() }).eq('id', selectedRoom.id);
    if (!error) setSelectedRoom(null);
    setIsUpdating(false);
  };

  const startOverrideSequence = () => {
    setOverrideStep(2); // Move to Loading
    setTimeout(() => {
      setOverrideStep(3); // Move to Success after 2 seconds
      triggerConfetti();
    }, 2000);
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#176e57', '#34d399', '#fcd34d'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#176e57', '#34d399', '#fcd34d'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const executeMassACOverride = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('rooms').update({ ac_switch: true }).gte('floor', 1);
    if (!error) setOverrideStep(0); // Close modal
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Room Inspections</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Floor {activeFloor} • Dimasalang Hall</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm font-bold px-4 py-2.5 bg-slate-50 text-slate-600 rounded-2xl border border-slate-200">35 Total Rooms</div>
          <button onClick={() => setOverrideStep(1)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-[#176e57] hover:bg-emerald-100 rounded-2xl font-bold border border-emerald-200 transition-colors">
            <Snowflake className="w-5 h-5" /> Start AC Override
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 7].map((floorNum) => (
          <button key={floorNum} onClick={() => setActiveFloor(floorNum)} className={`flex-1 min-w-[60px] md:min-w-[80px] py-3 md:py-4 rounded-2xl font-black text-sm md:text-base transition-all ${activeFloor === floorNum ? 'bg-[#176e57] text-white shadow-lg shadow-emerald-900/20 scale-105' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'}`}>
            F{floorNum}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {floorRooms.map((room) => {
          const currentStatus = statusConfig[room.status] || statusConfig.pending;
          return (
            <div key={room.id} onClick={() => openInspectionModal(room)} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-[#176e57]/30 cursor-pointer transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${room.status === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-800'}`}>
                    {room.room_number || room.id}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">Room {room.room_number || room.id}</h3>
                    {room.class_in_session ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Class inside</span> : <span className="text-xs font-medium text-slate-400">Empty</span>}
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${currentStatus.bg}`}><currentStatus.icon className="w-4 h-4" /></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${room.ac_switch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}><Wind className="w-4 h-4" /></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${room.lighting_switch ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}><Lightbulb className="w-4 h-4" /></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${room.door_locked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}><Lock className="w-4 h-4" /></div>
                </div>
                {room.notes && <FileText className="w-5 h-5 text-amber-500" />}
              </div>
            </div>
          );
        })}
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Inspect Room {selectedRoom.room_number || selectedRoom.id}</h3>
                <p className="text-xs text-slate-500 font-medium">Update status and safety flags</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300"><span className="absolute top-6 right-6 font-bold text-slate-400">✕</span><Lock className="w-4 h-4 opacity-0" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <label className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl cursor-pointer">
                <div className="flex items-center gap-3"><UserCheck className="w-6 h-6 text-amber-600" /><span className="font-bold text-amber-900 text-sm">Students Inside / Class in Session</span></div>
                <input type="checkbox" checked={modalData.class_in_session} onChange={(e) => setModalData({...modalData, class_in_session: e.target.checked})} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500" />
              </label>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sanitation & Cleanliness</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'cleaned', 'needs_reclean', 'verified'].map((statusKey) => (
                    <button key={statusKey} onClick={() => setModalData({...modalData, status: statusKey})} className={`py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${modalData.status === statusKey ? (statusKey === 'verified' ? 'bg-blue-600 border-blue-600 text-white' : statusKey === 'needs_reclean' ? 'bg-red-600 border-red-600 text-white' : statusKey === 'cleaned' ? 'bg-[#176e57] border-[#176e57] text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {statusKey.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Safety & Energy Checks</h4>
                <div className="space-y-2">
                  {[{ key: 'ac_switch', label: 'Air Conditioning Switched OFF', icon: Wind }, { key: 'lighting_switch', label: 'Classroom Lights Switched OFF', icon: Lightbulb }, { key: 'door_locked', label: 'Door Securely Locked', icon: Lock }].map((check) => (
                    <label key={check.key} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
                      <div className="flex items-center gap-3"><check.icon className={`w-5 h-5 ${modalData[check.key] ? 'text-[#176e57]' : 'text-slate-400'}`} /><span className="font-bold text-slate-700 text-sm">{check.label}</span></div>
                      <input type="checkbox" checked={modalData[check.key]} onChange={(e) => setModalData({...modalData, [check.key]: e.target.checked})} className="w-5 h-5 rounded text-[#176e57] focus:ring-[#176e57]" />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Room Notes & Incident Reports</h4>
                <textarea rows="2" placeholder="e.g., There's still student's card present..." value={modalData.notes} onChange={(e) => setModalData({...modalData, notes: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] resize-none" />
              </div>
            </div>
            <div className="p-5 bg-white border-t border-slate-100">
              <button disabled={isUpdating} onClick={handleSaveInspection} className="w-full py-4 bg-[#176e57] text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-[#125744] shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                <CheckCircle2 className="w-5 h-5" /> Save Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Step Advanced AC Override Modal */}
      {overrideStep > 0 && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          
          {overrideStep === 1 && (
            <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100"><Snowflake className="w-8 h-8" /></div>
              <div>
                <h3 className="font-black text-slate-800 text-xl mb-2">Trigger All 35 Air Conditioners?</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">You are about to activate the compressors in all 35 classrooms simultaneously. Proceed with caution to prevent circuit breaker overload.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-500">Peak Draw:</span><span className="text-red-600">~87.5 kW / hr</span></div>
                <div className="flex justify-between text-xs font-bold"><span className="text-slate-500">Substation:</span><span className="text-slate-800">Transformer A</span></div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={startOverrideSequence} className="w-full py-3.5 bg-[#176e57] text-white rounded-xl font-bold hover:bg-[#125744] shadow-md flex items-center justify-center gap-2">
                  Yes, Proceed to Remote Override
                </button>
                <button onClick={() => setOverrideStep(0)} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Cancel Override</button>
              </div>
            </div>
          )}

          {overrideStep === 2 && (
            <div className="bg-white rounded-[2rem] max-w-xs w-full p-8 shadow-2xl text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#176e57] animate-spin mx-auto" />
              <div>
                <h3 className="font-black text-slate-800 text-lg">Connecting to Dimasalang Solid...</h3>
                <p className="text-xs font-medium text-slate-500 mt-2">Igniting 35 Panasonic compressors...</p>
              </div>
            </div>
          )}

          {overrideStep === 3 && (
            <div className="bg-[#176e57] rounded-[2rem] max-w-sm w-full p-8 shadow-2xl text-center space-y-6 text-white relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30 relative z-10"><Snowflake className="w-8 h-8 text-white" /></div>
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-1">Central Climate Cloud Tier</h3>
                <p className="text-[10px] text-emerald-100/90 font-medium leading-relaxed px-4">Simultaneous 35-classroom override requires an active Institutional IoT Cloud license.</p>
              </div>
              <div className="bg-black/20 p-5 rounded-2xl border border-white/10 text-left space-y-3 relative z-10">
                <h4 className="text-[10px] font-black text-emerald-200 uppercase tracking-widest">Enterprise Licenses Included:</h4>
                <ul className="text-xs text-white/90 space-y-2 font-medium">
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Instant remote bypass for Floors 1 to 7</li>
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Direct commercial peak-hour Meralco quota</li>
                  <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Priority maintenance dispatch on breaker trip</li>
                </ul>
              </div>
              <div className="flex justify-between items-center bg-white text-slate-800 p-4 rounded-2xl relative z-10 shadow-inner">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Campus Facility Billing</span>
                <span className="text-xl font-black text-[#176e57]">₱5,000.00</span>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <button onClick={executeMassACOverride} disabled={isUpdating} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] flex items-center justify-center transition-all active:scale-95">
                  Authorize Charge (₱5,000.00)
                </button>
                <button onClick={() => setOverrideStep(0)} className="text-xs font-bold text-emerald-200 hover:text-white">Cancel / Use manual wall-switches</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}