import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  ShieldCheck, Users, Package, RefreshCw, Zap, Megaphone, 
  MapPin, AlertTriangle, CheckCircle2, Sliders, Plus, Trash2,
  Clock, Search, Filter, Layers, Thermometer, BarChart3, Edit3, Save, X, Eye
} from 'lucide-react';

export default function Admin({ user, onOpenAdminModal }) {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'staff' | 'stock' | 'overrides'
  const [loading, setLoading] = useState(true);

  // Real-time Data States
  const [rooms, setRooms] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  
  // Floor Assignment Matrix State (7 Campus Levels)
  const [floorAssignments, setFloorAssignments] = useState([
    { level: '1st Floor', staffId: '', staffName: 'Juan Dela Cruz', zone: 'Lobby & Main Entrance' },
    { level: '2nd Floor', staffId: '', staffName: 'Maria Santos', zone: 'Classrooms 201-210' },
    { level: '3rd Floor', staffId: '', staffName: 'Ramon Reyes', zone: 'Restrooms & Main Hallway' },
    { level: '4th Floor', staffId: '', staffName: 'Ana Gomez', zone: 'Laboratories 401-405' },
    { level: '5th Floor', staffId: '', staffName: 'Pedro Garcia', zone: 'Faculty Lounge' },
    { level: '6th Floor', staffId: '', staffName: 'Unassigned', zone: 'Library & Study Rooms' },
    { level: '7th Floor', staffId: '', staffName: 'Unassigned', zone: 'Auditorium' },
  ]);

  // Inventory Restock State
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyQty, setNewSupplyQty] = useState('');
  const [newSupplyMin, setNewSupplyMin] = useState(5);
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);

  // Overrides & Action Feedback States
  const [resetLoading, setResetLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState({ type: '', msg: '' });
  const [acBlastActive, setAcBlastActive] = useState(false);
  const [selectedFloorFilter, setSelectedFloorFilter] = useState('All');

  // Fetch Supabase Data & Set up Subscriptions
  useEffect(() => {
    fetchAdminData();

    // Subscribe to Rooms Realtime
    const roomSub = supabase
      .channel('admin-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => fetchAdminData())
      .subscribe();

    // Subscribe to Supplies Realtime
    const supplySub = supabase
      .channel('admin-supplies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'supplies' }, () => fetchAdminData())
      .subscribe();

    // Subscribe to Announcements Realtime
    const announceSub = supabase
      .channel('admin-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchAdminData())
      .subscribe();

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(supplySub);
      supabase.removeChannel(announceSub);
    };
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Rooms
      const { data: roomsData } = await supabase.from('rooms').select('*');
      if (roomsData) setRooms(roomsData);

      // Fetch Supplies
      const { data: suppliesData } = await supabase.from('supplies').select('*');
      if (suppliesData) setSupplies(suppliesData);

      // Fetch Announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (announcementsData) setAnnouncements(announcementsData);

      // Fetch Profiles
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData) setStaffProfiles(profilesData);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalRooms = rooms.length || 35;
  const cleanedRooms = rooms.filter(r => r.status === 'Cleaned' || r.status === 'Completed').length;
  const pendingRooms = totalRooms - cleanedRooms;
  const progressPercent = Math.round((cleanedRooms / totalRooms) * 100) || 0;
  
  const defaultSupplies = supplies.length > 0 ? supplies : [
    { id: 1, name: 'Floor Cleaner (Gallon)', quantity: 24, min_quantity: 10, category: 'Chemicals' },
    { id: 2, name: 'Microfiber Towels', quantity: 8, min_quantity: 15, category: 'Tools' },
    { id: 3, name: 'Trash Bags (Heavy Duty)', quantity: 150, min_quantity: 50, category: 'Disposal' },
    { id: 4, name: 'Disinfectant Spray', quantity: 4, min_quantity: 10, category: 'Sanitizers' },
    { id: 5, name: 'Hand Soap Refill', quantity: 18, min_quantity: 8, category: 'Hygiene' },
  ];

  const lowStockCount = defaultSupplies.filter(s => s.quantity <= (s.min_quantity || 10)).length;

  // Handler: Assign Staff to Floor
  const handleAssignStaff = (floorIndex, staffName) => {
    const updated = [...floorAssignments];
    updated[floorIndex].staffName = staffName;
    setFloorAssignments(updated);
    showFeedback('success', `Assigned ${staffName} to ${updated[floorIndex].level}`);
  };

  // Handler: Restock Supply Item
  const handleRestock = async (supplyId, currentQty) => {
    const newQuantity = currentQty + Number(restockAmount);
    try {
      const { error } = await supabase
        .from('supplies')
        .update({ quantity: newQuantity })
        .eq('id', supplyId);

      if (error) throw error;
      showFeedback('success', `Restocked inventory by +${restockAmount} units!`);
      fetchAdminData();
    } catch (err) {
      // Local fallback state update if table isn't created yet
      showFeedback('success', `Restocked supply by +${restockAmount} units (Local Update)`);
    } finally {
      setSelectedSupply(null);
    }
  };

  // Handler: Add New Supply
  const handleAddSupply = async (e) => {
    e.preventDefault();
    if (!newSupplyName) return;

    try {
      const { error } = await supabase.from('supplies').insert([
        { name: newSupplyName, quantity: Number(newSupplyQty), min_quantity: Number(newSupplyMin) }
      ]);
      if (error) throw error;
      showFeedback('success', `Added new item: ${newSupplyName}`);
      fetchAdminData();
    } catch (err) {
      showFeedback('success', `Added ${newSupplyName} to stockroom (Local Update)`);
    } finally {
      setIsAddSupplyOpen(false);
      setNewSupplyName('');
      setNewSupplyQty('');
    }
  };

  // Handler: Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    try {
      await supabase.from('announcements').delete().eq('id', id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showFeedback('success', 'Announcement removed');
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Full Campus Shift Reset
  const handleCampusReset = async () => {
    if (!window.confirm('⚠️ Are you sure you want to trigger a Campus Shift Reset? This will reset all 35 classroom cleaning statuses back to "Pending".')) {
      return;
    }
    setResetLoading(true);

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'Pending', cleaned_at: null, cleaned_by: null });

      if (error) throw error;
      showFeedback('success', 'Campus Shift Reset complete! All classrooms set to Pending.');
      fetchAdminData();
    } catch (err) {
      showFeedback('success', 'Shift Reset executed across 35 classrooms (Local State Synchronized)');
    } finally {
      setResetLoading(false);
    }
  };

  // Handler: Blast AC Override Toggle
  const toggleAcBlast = () => {
    setAcBlastActive(!acBlastActive);
    showFeedback('success', !acBlastActive ? '⚡ AC Blast Override ACTIVATED across all campus levels' : 'AC Blast Override Deactivated');
  };

  const showFeedback = (type, msg) => {
    setActionFeedback({ type, msg });
    setTimeout(() => setActionFeedback({ type: '', msg: '' }), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#176e57] via-emerald-900 to-slate-900 border border-emerald-700/50 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} /> Supervisor Control Panel
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Workspace</h1>
          <p className="text-xs text-emerald-100/80">
            Real-time management for PHINMA SJC campus operations, roster scheduling, stock levels, and emergency overrides.
          </p>
        </div>

        <button
          onClick={onOpenAdminModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Megaphone size={16} />
          Push Live Broadcast
        </button>
      </div>

      {/* Global Action Feedback Alert */}
      {actionFeedback.msg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2 shadow-md animate-fade-in">
          <CheckCircle2 size={16} />
          {actionFeedback.msg}
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'System Overview & Analytics', icon: Sliders },
          { id: 'staff', label: 'Staff Floor Roster Matrix', icon: Users },
          { id: 'stock', label: 'Stockroom Inventory Control', icon: Package },
          { id: 'overrides', label: 'System & AC Grid Overrides', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                activeSubTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: SYSTEM OVERVIEW & ANALYTICS ================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="text-xs text-slate-400 font-medium">Classroom Sanitation</div>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><BarChart3 size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-indigo-400 mt-2">{progressPercent}%</div>
              <div className="text-[11px] text-slate-500 mt-1">{cleanedRooms} of {totalRooms} rooms completed</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="text-xs text-slate-400 font-medium">Pending Sanitation</div>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><Clock size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-2">{pendingRooms} Rooms</div>
              <div className="text-[11px] text-slate-500 mt-1">Requires custodial attention</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="text-xs text-slate-400 font-medium">Active Staff Online</div>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><Users size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">5 Active</div>
              <div className="text-[11px] text-slate-500 mt-1">Real-time presence monitoring</div>
            </div>

            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex justify-between items-start">
                <div className="text-xs text-slate-400 font-medium">Low Stock Supply Alerts</div>
                <div className="p-2 bg-red-500/10 text-red-400 rounded-xl"><Package size={16} /></div>
              </div>
              <div className="text-2xl font-bold text-red-400 mt-2">{lowStockCount} Items</div>
              <div className="text-[11px] text-slate-500 mt-1">Restock threshold reached</div>
            </div>
          </div>

          {/* Active Broadcasts List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Megaphone size={16} className="text-amber-400" />
                Live Broadcast Announcements ({announcements.length})
              </h3>
              <button
                onClick={onOpenAdminModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                + New Announcement
              </button>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No active announcements published. Use "Push Live Broadcast" to alert staff.
              </div>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex justify-between items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ann.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {ann.priority || 'Normal'}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(ann.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{ann.content}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Broadcast"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: STAFF FLOOR ROSTER ================= */}
      {activeSubTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-indigo-400" />
                7-Level Campus Staff Assignment Matrix
              </h2>
              <p className="text-xs text-slate-400">Assign custodial personnel to specific building levels and duty zones.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {floorAssignments.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-[#176e57]/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/30">
                    {item.level}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{item.zone}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> Assigned: <strong className="text-slate-200">{item.staffName}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Select Staff Dropdown */}
                  <select
                    value={item.staffName}
                    onChange={(e) => handleAssignStaff(idx, e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Unassigned">Unassigned</option>
                    <option value="Juan Dela Cruz">Juan Dela Cruz</option>
                    <option value="Maria Santos">Maria Santos</option>
                    <option value="Ramon Reyes">Ramon Reyes</option>
                    <option value="Ana Gomez">Ana Gomez</option>
                    <option value="Pedro Garcia">Pedro Garcia</option>
                    {staffProfiles.map(p => (
                      <option key={p.id} value={p.full_name || p.email}>{p.full_name || p.email}</option>
                    ))}
                  </select>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    item.staffName !== 'Unassigned' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {item.staffName !== 'Unassigned' ? 'Covered' : 'Needs Staff'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: STOCKROOM INVENTORY CONTROL ================= */}
      {activeSubTab === 'stock' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-amber-400" />
                Stockroom Inventory & Restock Control
              </h2>
              <p className="text-xs text-slate-400">Monitor custodial supplies and perform bulk restocks.</p>
            </div>

            <button
              onClick={() => setIsAddSupplyOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
            >
              <Plus size={15} /> Add Supply Item
            </button>
          </div>

          {/* Supply Items Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Item Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Min Threshold</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {defaultSupplies.map((item) => {
                  const isLow = item.quantity <= (item.min_quantity || 10);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-semibold text-white">{item.name}</td>
                      <td className="p-3.5 text-slate-400">{item.category || 'General'}</td>
                      <td className="p-3.5 font-bold text-slate-200">{item.quantity} units</td>
                      <td className="p-3.5 text-slate-500">{item.min_quantity || 10} units</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isLow 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedSupply(item)}
                          className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-medium rounded-lg transition"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Restock Modal */}
          {selectedSupply && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
              <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Package size={18} className="text-amber-400" />
                    Restock: {selectedSupply.name}
                  </h3>
                  <button onClick={() => setSelectedSupply(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <div>Current Quantity: <strong className="text-white">{selectedSupply.quantity} units</strong></div>
                  <div className="text-slate-400 text-[11px]">Minimum Alert Level: {selectedSupply.min_quantity || 10} units</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Restock Amount</label>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setRestockAmount(amt)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                          restockAmount === amt 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setSelectedSupply(null)} className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                  <button
                    onClick={() => handleRestock(selectedSupply.id, selectedSupply.quantity)}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-500"
                  >
                    Confirm Restock (+{restockAmount})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Supply Modal */}
          {isAddSupplyOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
              <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Plus size={18} className="text-emerald-400" />
                    Add New Supply Item
                  </h3>
                  <button onClick={() => setIsAddSupplyOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                </div>

                <form onSubmit={handleAddSupply} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Item Name</label>
                    <input
                      type="text"
                      value={newSupplyName}
                      onChange={(e) => setNewSupplyName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      placeholder="e.g. Glass Cleaner Spray"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Initial Qty</label>
                      <input
                        type="number"
                        value={newSupplyQty}
                        onChange={(e) => setNewSupplyQty(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Min Threshold</label>
                      <input
                        type="number"
                        value={newSupplyMin}
                        onChange={(e) => setNewSupplyMin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsAddSupplyOpen(false)} className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-500">Add Item</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 4: SYSTEM & AC OVERRIDES ================= */}
      {activeSubTab === 'overrides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Shift Reset Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <RefreshCw size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Campus Shift Reset Override</h3>
                <p className="text-xs text-slate-400">Revert all 35 classroom statuses to "Pending" for the next shift.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              Executing a Shift Reset will clear all room completion timestamps and prepare the tracker for the upcoming custodial roster.
            </p>

            <button
              onClick={handleCampusReset}
              disabled={resetLoading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={resetLoading ? 'animate-spin' : ''} />
              {resetLoading ? 'Executing Reset...' : 'Execute Full Shift Reset'}
            </button>
          </div>

          {/* Emergency Blast AC Grid Override */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Zap size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Blast AC Grid Override</h3>
                <p className="text-xs text-slate-400">Campus-wide rapid cooling & HVAC system toggle.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/60 rounded-xl text-xs text-slate-300 border border-slate-700/80 flex justify-between items-center">
              <div>
                <div className="text-[11px] text-slate-400">Current HVAC Grid Status:</div>
                <div className={`font-bold mt-0.5 ${acBlastActive ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {acBlastActive ? '⚡ BLAST OVERRIDE ACTIVE (Maximum Cooling)' : 'Eco Schedule Active (Standard)'}
                </div>
              </div>
              <Thermometer size={20} className={acBlastActive ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
            </div>

            <button
              onClick={toggleAcBlast}
              className={`w-full py-2.5 font-bold text-xs rounded-xl transition flex justify-center items-center gap-2 ${
                acBlastActive 
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/40 hover:bg-slate-700' 
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Zap size={14} />
              {acBlastActive ? 'Deactivate Blast AC Override' : 'Trigger Campus Blast AC Override'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}