import React from 'react';
import { X, Users, CheckCircle2, Circle } from 'lucide-react';

export default function StaffPresenceModal({ isOpen, onClose, onlineStaff }) {
  if (!isOpen) return null;

  // Default custodial roster mapping for Saint Jude College (Floors 1–7)
  const roster = [
    { id: '001', name: 'Custodial Staff #001', defaultFloor: 'Floors 1 & 2' },
    { id: '002', name: 'Custodial Staff #002', defaultFloor: 'Floors 3 & 4' },
    { id: '003', name: 'Custodial Staff #003', defaultFloor: 'Floor 5' },
    { id: '004', name: 'Custodial Staff #004', defaultFloor: 'Floor 6' },
    { id: '005', name: 'Custodial Staff #005', defaultFloor: 'Floor 7' },
  ];

  const isStaffOnline = (staffId) => {
    return onlineStaff.some((member) => member.id === staffId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#176e57]">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Live Staff Roster</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Roster List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {roster.map((staff) => {
            const online = isStaffOnline(staff.id);
            return (
              <div
                key={staff.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                  online ? 'bg-emerald-50/50 border-emerald-200/80' : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {staff.id}
                    </div>
                    <span
                      className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{staff.name}</h4>
                    <p className="text-[10px] text-slate-500">{staff.defaultFloor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {online ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5" /> Offline
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-center text-slate-400">
          Powered by Supabase Presence Realtime Channel
        </p>
      </div>
    </div>
  );
}