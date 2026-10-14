import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Supplies from './pages/Supplies';
import Admin from './pages/Admin';
import { supabase } from './lib/supabase';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sjc_active_user') || sessionStorage.getItem('sjc_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [rooms, setRooms] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [broadcast, setBroadcast] = useState({ active: false, message: '' });
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [roomsRes, suppliesRes, assignRes, broadRes, logsRes] = await Promise.all([
          supabase.from('rooms').select('*').order('id', { ascending: true }),
          supabase.from('supplies').select('*').order('id', { ascending: true }),
          supabase.from('assignments').select('*'),
          supabase.from('broadcast').select('*').limit(1),
          supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(20)
        ]);

        if (roomsRes.data) {
          const formattedRooms = roomsRes.data.map((r) => ({
            id: r.id, floor: r.floor, status: r.status, staff: r.staff,
            lastCleaned: r.last_cleaned, recleanReason: r.reclean_reason,
            acChecked: r.ac_checked, lightsChecked: r.lights_checked,
            doorChecked: r.door_checked, hasStudents: r.has_students
          }));
          setRooms(formattedRooms);
        }
        if (suppliesRes.data) setSupplies(suppliesRes.data);
        if (assignRes.data) {
          const assignMap = {};
          assignRes.data.forEach((a) => { assignMap[a.floor] = a.staff_id; });
          setAssignments(assignMap);
        }
        if (broadRes.data?.length > 0) {
          setBroadcast({ active: broadRes.data[0].active, message: broadRes.data[0].message });
        }
        if (logsRes.data) setLogs(logsRes.data);
      } catch (err) {
        console.warn('Initial fetch error:', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        if (payload.new) {
          setRooms((prev) => prev.map((r) => r.id === payload.new.id ? {
            id: payload.new.id, floor: payload.new.floor, status: payload.new.status,
            staff: payload.new.staff, lastCleaned: payload.new.last_cleaned,
            acChecked: payload.new.ac_checked, lightsChecked: payload.new.lights_checked,
            doorChecked: payload.new.door_checked, hasStudents: payload.new.has_students
          } : r));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplies' }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new) {
          setSupplies((prev) => prev.map((s) => s.id === payload.new.id ? payload.new : s));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcast' }, (payload) => {
        if (payload.new) {
          setBroadcast({ active: payload.new.active, message: payload.new.message });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleLoginSuccess = (userData, remember) => {
    setUser(userData);
    if (remember) {
      localStorage.setItem('sjc_active_user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('sjc_active_user', JSON.stringify(userData));
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pb-16 md:pb-0">
      {user && <Header user={user} setUser={setUser} />}
      {user && <Navbar role={user.role} />}
      
      {user && broadcast.active && (
        <div className="max-w-6xl mx-auto w-full px-4 pt-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl shadow-sm flex items-start gap-3">
            <div className="p-2 bg-amber-200/80 text-amber-800 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-amber-950 uppercase tracking-widest text-[10px]">Supervisor Notice</span>
              <p className="text-amber-900 font-bold text-sm mt-0.5">{broadcast.message}</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/dashboard" element={user ? <Dashboard rooms={rooms} supplies={supplies} logs={logs} setLogs={setLogs} user={user} assignments={assignments} onlineStaff={onlineUsers} /> : <Navigate to="/login" />} />
          <Route path="/rooms" element={user ? <Rooms rooms={rooms} setRooms={setRooms} user={user} /> : <Navigate to="/login" />} />
          <Route path="/supplies" element={user ? <Supplies supplies={supplies} setSupplies={setSupplies} user={user} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin rooms={rooms} setRooms={setRooms} supplies={supplies} setSupplies={setSupplies} setBroadcast={setBroadcast} /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}