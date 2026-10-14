import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import BlastACModal from '../components/BlastACModal';
import { Building2, Power, Lightbulb, Lock, Snowflake, Users } from 'lucide-react';

export default function Rooms({ rooms = [], setRooms, user }) {
  const [showBlastModal, setShowBlastModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(1);

  const floorRooms = rooms.filter(r => r.floor === selectedFloor);

  const toggleRoomStatus = async (room) => {
    const newStatus = room.status === 'cleaned' ? 'pending' : 'cleaned';
    
    // Optimistic Update
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));

    // Supabase DB Update
    try {
      await supabase.from('rooms').update({ status: newStatus }).eq('id', room.id);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Classroom Inspection</h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Select a floor to manage status</p>
        </div>
        
        {/* Blast AC Button */}
        <button
          onClick={() => setShowBlastModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-cyan-50 hover:bg-cyan-100 active:scale-95 text-cyan-700 rounded-xl font-bold transition border border-cyan-200 shadow-sm"
        >
          <Snowflake className="w-5 h-5 text-cyan-600" />
          <span className="hidden sm:inline">Blast AC</span>
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 7].map(f => (
          <button
            key={f}
            onClick={() => setSelectedFloor(f)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              selectedFloor === f 
                ? 'bg-[#176e57] text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Floor {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {floorRooms.map(room => (
          <div key={room.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="flex justify-between items-start">
              <span className="text-xl font-black text-slate-900">Room {room.id}</span>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                room.status === 'cleaned' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {room.status || 'Pending'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-4">
              <Power className={`w-4 h-4 ${room.acChecked ? 'text-emerald-500' : ''}`} />
              <Lightbulb className={`w-4 h-4 ${room.lightsChecked ? 'text-emerald-500' : ''}`} />
              <Lock className={`w-4 h-4 ${room.doorChecked ? 'text-emerald-500' : ''}`} />
              {room.hasStudents && <Users className="w-4 h-4 text-amber-500 ml-auto" />}
            </div>

            <button 
              onClick={() => toggleRoomStatus(room)}
              className={`mt-4 w-full py-2.5 rounded-xl text-xs font-black transition-colors ${
                room.status === 'cleaned' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#176e57] text-white hover:bg-[#135c49]'
              }`}
            >
              {room.status === 'cleaned' ? 'Mark Pending' : 'Mark Cleaned'}
            </button>
          </div>
        ))}
      </div>

      <BlastACModal isOpen={showBlastModal} onClose={() => setShowBlastModal(false)} />
    </div>
  );
}