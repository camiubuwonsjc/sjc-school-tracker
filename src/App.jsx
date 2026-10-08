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

  // Check initial login session
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

  // Fetch initial data & bind Supabase Realtime listeners
  useEffect(() => {
    const fetchInitialData = async () => {
      const [{ data: roomsData }, { data: suppliesData }, { data: logsData }, { data: broadcastData }] =
        await Promise.all([
          supabase.from('rooms').select('*').order('id', { ascending: true }),
          supabase.from('supplies').select('*').order('name', { ascending: true }),
          supabase.from('logs').select('*').order('time', { ascending: false }),
          supabase.from('broadcast').select('*').eq('id', 1).maybeSingle(),
        ]);

      if (roomsData) setRooms(roomsData);
      if (suppliesData) setSupplies(suppliesData);
      if (logsData) setLogs(logsData);
      if (broadcastData) setBroadcast(broadcastData);
    };

    fetchInitialData();

    // Supabase Realtime Channel
    const realtimeChannel = supabase
      .channel('global-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setRooms((prev) => prev.map((r) => (r.id === payload.new.id ? payload.new : r)));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSupplies((prev) => {
            const isDuplicate = prev.some((s) => s.id === payload.new.id);
            return isDuplicate ? prev : [...prev, payload.new];
          });
        } else if (payload.eventType === 'UPDATE') {
          setSupplies((prev) => prev.map((s) => (s.id === payload.new.id ? payload.new : s)));
        } else if (payload.eventType === 'DELETE') {
          setSupplies((prev) => prev.filter((s) => s.id === payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLogs((prev) => {
            const isDuplicate = prev.some(
              (item) => item.id === payload.new.id || (item.text === payload.new.text && item.time === payload.new.time)
            );
            return isDuplicate ? prev : [payload.new, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setLogs((prev) => prev.filter((item) => item.id === payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcast' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setBroadcast(payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  // Online Staff Presence Channel
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('online-staff-tracker', {
      config: { presence: { key: user.id } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeUsers = Object.values(state).flatMap((presences) => presences);
        setOnlineStaff(activeUsers);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            id: user.id,
            name: user.name,
            role: user.role,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user]);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <BrowserRouter>
      {/* PC: pb-0 because navbar is hidden, Mobile: pb-20 to clear bottom nav */}
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 select-none">
        <Header user={user} setUser={setUser} broadcast={broadcast} />

        {broadcast?.active && broadcast?.message && (
          <div className="bg-amber-500 text-white text-sm md:text-base font-bold px-4 py-2.5 text-center shadow-md animate-pulse">
            📢 Notice: {broadcast.message}
          </div>
        )}

        {/* Expanded max-w-6xl for Desktop layout */}
        <main className="max-w-6xl mx-auto px-4 pt-6 md:pt-8 md:px-8">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  rooms={rooms}
                  supplies={supplies}
                  logs={logs}
                  onlineStaff={onlineStaff}
                  user={user}
                />
              }
            />
            <Route path="/rooms" element={<Rooms rooms={rooms} user={user} />} />
            <Route path="/supplies" element={<Supplies supplies={supplies} user={user} />} />
            {user.role === 'admin' && (
              <Route path="/admin" element={<Admin rooms={rooms} supplies={supplies} user={user} />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Navbar role={user.role} />
      </div>
    </BrowserRouter>
  );
}