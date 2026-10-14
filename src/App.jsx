import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Pages & Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Supplies from './pages/Supplies';
import Admin from './pages/Admin';
import Header from './components/Header';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [broadcast, setBroadcast] = useState(null);
  const [onlineStaff, setOnlineStaff] = useState([]);
  const [syncChannel, setSyncChannel] = useState(null); // Real-time broadcaster

  useEffect(() => {
    try {
      const localUser = localStorage.getItem('sjc_active_user');
      const sessionUser = sessionStorage.getItem('sjc_active_user');
      if (localUser && localUser !== 'undefined') setUser(JSON.parse(localUser));
      else if (sessionUser && sessionUser !== 'undefined') setUser(JSON.parse(sessionUser));
    } catch (e) {
      console.error('Session restore error:', e);
      localStorage.removeItem('sjc_active_user');
      sessionStorage.removeItem('sjc_active_user');
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [{ data: roomsData }, { data: suppliesData }, { data: logsData }, { data: broadcastData }] =
        await Promise.all([
          supabase.from('rooms').select('*').order('id', { ascending: true }),
          supabase.from('supplies').select('*').order('name', { ascending: true }),
          supabase.from('logs').select('*').order('time', { ascending: false }),
          supabase.from('broadcast').select('*').eq('id', 1).maybeSingle(),
        ]);

      // FIX: If database is empty, generate 35 dummy rooms so the UI never breaks
      if (roomsData && roomsData.length > 0) {
        setRooms(roomsData);
      } else {
        const fallbackRooms = Array.from({length: 35}, (_, i) => {
          const floor = Math.floor(i / 5) + 1;
          const roomNum = `${floor}0${(i % 5) + 1}`;
          return { id: roomNum, floor, status: 'pending', acChecked: false, lightsChecked: false, doorChecked: false, hasStudents: false, notes: '' };
        });
        setRooms(fallbackRooms);
      }

      if (suppliesData) setSupplies(suppliesData);
      if (logsData) setLogs(logsData);
      if (broadcastData) setBroadcast(broadcastData);
    };

    fetchInitialData();

    // SUPER-SYNC CHANNEL: Connects you and your friends instantly
    const channel = supabase.channel('sjc-sync-network');
    
    channel
      .on('broadcast', { event: 'new-log' }, (payload) => {
        setLogs(prev => [payload.payload, ...prev]);
      })
      .on('broadcast', { event: 'delete-log' }, (payload) => {
        setLogs(prev => prev.filter(l => l.id !== payload.payload.id));
      })
      .on('broadcast', { event: 'room-updated' }, (payload) => {
        setRooms(prev => prev.map(r => r.id === payload.payload.id ? { ...r, ...payload.payload } : r));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncChannel(channel); // Save channel so components can send messages
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const presenceChannel = supabase.channel('online-staff-tracker', { config: { presence: { key: user.id } } });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const activeUsers = Object.values(presenceChannel.presenceState()).flatMap(p => p);
        setOnlineStaff(activeUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ id: user.id, name: user.name, role: user.role, onlineAt: new Date().toISOString() });
        }
      });

    return () => { presenceChannel.unsubscribe(); };
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 select-none">
        <Header user={user} setUser={setUser} broadcast={broadcast} />

        {broadcast?.active && broadcast?.message && (
          <div className="bg-amber-500 text-white text-sm md:text-base font-bold px-4 py-2.5 text-center shadow-md animate-pulse">
            📢 Notice: {broadcast.message}
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-8 md:px-8">
          <Routes>
            <Route path="/" element={<Dashboard rooms={rooms} supplies={supplies} logs={logs} setLogs={setLogs} onlineStaff={onlineStaff} user={user} syncChannel={syncChannel} />} />
            <Route path="/rooms" element={<Rooms rooms={rooms} setRooms={setRooms} user={user} syncChannel={syncChannel} />} />
            <Route path="/supplies" element={<Supplies supplies={supplies} user={user} />} />
            {user.role === 'admin' && <Route path="/admin" element={<Admin rooms={rooms} supplies={supplies} user={user} />} />}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Navbar role={user.role} />
      </div>
    </BrowserRouter>
  );
}