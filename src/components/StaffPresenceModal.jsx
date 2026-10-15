import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Users, Circle, MapPin, Mail, Clock } from 'lucide-react';

export default function StaffPresenceModal({ isOpen, onClose, currentUser }) {
  const [presenceState, setPresenceState] = useState({});
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    // Create Supabase Realtime channel for presence
    const channel = supabase.channel('presence-staff', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    // Subscribe and track user presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setPresenceState(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Staff joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Staff left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: currentUser.id,
            name: currentUser.user_metadata?.full_name || currentUser.email,
            email: currentUser.email,
            role: currentUser.user_metadata?.role || 'Staff',
            assignedFloor: currentUser.user_metadata?.assigned_floor || 'General Campus',
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Flatten active users from presence state
  const activeStaff = Object.values(presenceState).flatMap((p) => p);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-800/60 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">Real-Time Staff Presence</h3>
              <p className="text-xs text-slate-400">Live roster tracking via Supabase Realtime</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Staff Presence Roster */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Custodial Staff ({activeStaff.length})
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed
            </span>
          </div>

          {activeStaff.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No staff members online right now.
            </div>
          ) : (
            activeStaff.map((staff, idx) => (
              <div 
                key={idx}
                className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-semibold flex items-center justify-center text-sm border border-slate-600">
                      {staff.name ? staff.name.charAt(0) : 'S'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-slate-100">{staff.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {staff.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2.5 py-0.5 rounded-full">
                    <MapPin size={12} />
                    {staff.assignedFloor}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                    <Clock size={10} />
                    Connected {new Date(staff.onlineAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition"
          >
            Close Roster
          </button>
        </div>

      </div>
    </div>
  );
}