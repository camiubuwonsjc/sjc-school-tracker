import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Megaphone, Users, PackagePlus, RotateCcw, Trash2, CheckCircle2, ShieldCheck, Send, Plus, Download, FileX, Settings2 } from 'lucide-react';

export default function Admin({ rooms, supplies, user }) {
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isNoticeActive, setIsNoticeActive] = useState(false);
  const [isSavingNotice, setIsSavingNotice] = useState(false);

  const [assignments, setAssignments] = useState({});
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const [stockName, setStockName] = useState('');
  const [stockCategory, setStockCategory] = useState('Chemicals');
  const [stockCount, setStockCount] = useState(10);
  const [stockThreshold, setStockThreshold] = useState(5);
  const [stockUnit, setStockUnit] = useState('pcs');
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [stockSuccess, setStockSuccess] = useState(false);

  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [isRollingOver, setIsRollingOver] = useState(false);
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const staffList = [
    { id: '001', name: 'Kuya Bert' }, { id: '002', name: 'Ate Linda' }, { id: '003', name: 'Kuya Jon' }, { id: '004', name: 'Ate Marites' }, { id: '005', name: 'Kuya Jomar' },
  ];

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: bData } = await supabase.from('broadcast').select('*').eq('id', 1).maybeSingle();
      if (bData) { setNoticeMessage(bData.message || ''); setIsNoticeActive(bData.active || false); }
      
      const { data: aData } = await supabase.from('assignments').select('*');
      if (aData) {
        const assignmentMap = {};
        aData.forEach((item) => { assignmentMap[item.floor] = item.staff_id; });
        setAssignments(assignmentMap);
      }
    };
    fetchAdminData();
  }, []);

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    setIsSavingNotice(true);
    const { error } = await supabase.from('broadcast').upsert({ id: 1, message: noticeMessage.trim(), active: true, updated_at: new Date().toISOString() });
    if (!error) setIsNoticeActive(true);
    setIsSavingNotice(false);
  };

  const handleClearNotice = async () => {
    setIsSavingNotice(true);
    const { error } = await supabase.from('broadcast').upsert({ id: 1, message: '', active: false, updated_at: new Date().toISOString() });
    if (!error) { setNoticeMessage(''); setIsNoticeActive(false); }
    setIsSavingNotice(false);
  };

  const handleAssignStaff = async (floorNum, staffId) => {
    setIsSavingAssignment(true);
    const staffName = staffList.find(s => s.id === staffId)?.name || `Staff #${staffId}`;
    const { error } = await supabase.from('assignments').upsert({ floor: floorNum, staff_id: staffId, staff_name: staffName, updated_at: new Date().toISOString() });
    if (!error) setAssignments((prev) => ({ ...prev, [floorNum]: staffId }));
    setIsSavingAssignment(false);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!stockName.trim()) return;
    setIsAddingStock(true);
    const { error } = await supabase.from('supplies').insert({ name: stockName.trim(), category: stockCategory, count: Number(stockCount), threshold: Number(stockThreshold), unit: stockUnit.trim() || 'pcs', updated_at: new Date().toISOString() });
    if (!error) { setStockName(''); setStockCount(10); setStockThreshold(5); setStockSuccess(true); setTimeout(() => setStockSuccess(false), 3000); }
    setIsAddingStock(false);
  };

  const handleExportData = async () => {
    const { data: roomsData } = await supabase.from('rooms').select('*').order('id');
    const headers = ['Room Number', 'Floor', 'Status', 'Class In Session', 'AC Off', 'Lights Off', 'Locked', 'Incident Notes'];
    const rows = (roomsData || []).map(r => [r.room_number || r.id, r.floor, `"${r.status}"`, r.class_in_session ? 'Yes' : 'No', r.ac_switch ? 'Yes' : 'No', r.lighting_switch ? 'Yes' : 'No', r.door_locked ? 'Yes' : 'No', `"${(r.notes || '').replace(/"/g, '""')}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Dimasalang_Shift_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExecuteRollover = async () => {
    setIsRollingOver(true);
    const { error } = await supabase.from('rooms').update({ status: 'pending', ac_switch: false, lighting_switch: false, door_locked: false, class_in_session: false, notes: '', updated_at: new Date().toISOString() }).gte('floor', 1);
    if (!error) setShowRolloverModal(false);
    setIsRollingOver(false);
  };

  const handleClearLogs = async () => {
    setIsClearingLogs(true);
    const { error } = await supabase.from('logs').delete().lte('time', '2100-01-01T00:00:00.000Z');
    if (!error) setShowClearLogsModal(false);
    setIsClearingLogs(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Upgraded Header Color to bright #176e57 Pine Green */}
      <div className="bg-[#176e57] text-white p-6 md:p-8 rounded-[2rem] shadow-xl space-y-2 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <ShieldCheck className="w-8 h-8 text-emerald-300" />
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Supervisor Control Center</h2>
        </div>
        <p className="text-sm text-emerald-100/90 font-medium relative z-10">Campus Operations Management & Data Export</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-800"><Settings2 className="w-6 h-6 text-[#176e57]" /><h3 className="font-black text-lg">Shift Operations & Data Export</h3></div>
            <div className="space-y-3">
              <button onClick={handleExportData} className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-between transition-colors group">
                <div className="text-left"><h4 className="font-bold text-[#176e57] text-sm">Export Excel Report (.xlsx)</h4><p className="text-xs text-emerald-600/80 font-medium mt-0.5">Classroom logs, verification status, and stock counts</p></div><Download className="w-5 h-5 text-[#176e57] group-hover:scale-110 transition-transform" />
              </button>
              <button onClick={() => setShowRolloverModal(true)} className="w-full p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-between transition-colors group">
                <div className="text-left"><h4 className="font-bold text-amber-800 text-sm">Reset Campus for New Day</h4><p className="text-xs text-amber-600/80 font-medium mt-0.5">Sets all 35 rooms back to Pending inspection</p></div><RotateCcw className="w-5 h-5 text-amber-600 group-hover:-rotate-90 transition-transform" />
              </button>
              <button onClick={() => setShowClearLogsModal(true)} className="w-full p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl flex items-center justify-between transition-colors group">
                <div className="text-left"><h4 className="font-bold text-red-800 text-sm">Clear Shift Notes & Logs</h4><p className="text-xs text-red-600/80 font-medium mt-0.5">Wipes handover reports and incident records</p></div><FileX className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800"><Megaphone className="w-6 h-6 text-indigo-500" /><h3 className="font-black text-lg">Campus Broadcast Banner</h3></div>
              {isNoticeActive && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">Active</span>}
            </div>
            <form onSubmit={handleSaveNotice} className="space-y-3">
              <textarea rows={3} required placeholder="Type priority announcement broadcasted to all devices..." value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
              <div className="flex gap-2">
                {isNoticeActive && <button type="button" onClick={handleClearNotice} disabled={isSavingNotice} className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">Turn Off</button>}
                <button type="submit" disabled={isSavingNotice} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10">
                  <Send className="w-4 h-4" /> <span>{isNoticeActive ? 'Update Broadcast' : 'Broadcast to All Staff'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-slate-800"><Users className="w-6 h-6 text-[#176e57]" /><h3 className="font-black text-lg">Floor Assignment Matrix</h3></div>
            <div className="space-y-3 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((floorNum) => (
                <div key={floorNum} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:bg-slate-100 transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#176e57] font-black text-xs flex items-center justify-center">F{floorNum}</div>
                    <span className="text-sm font-black text-slate-700">Floor {floorNum}</span>
                  </div>
                  <select value={assignments[floorNum] || '001'} onChange={(e) => handleAssignStaff(floorNum, e.target.value)} disabled={isSavingAssignment} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176e57] w-full sm:w-auto">
                    {staffList.map(staff => (<option key={staff.id} value={staff.id}>{staff.name} ({staff.id})</option>))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800"><PackagePlus className="w-6 h-6 text-[#176e57]" /><h3 className="font-black text-lg">Add Supply to Inventory</h3></div>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Item Name</label><input type="text" required placeholder="e.g., Bleach Disinfectant 1L" value={stockName} onChange={(e) => setStockName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Category</label>
                  <select value={stockCategory} onChange={(e) => setStockCategory(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176e57]">
                    <option value="Chemicals">Chemicals</option><option value="Equipment">Equipment</option><option value="Disposables">Disposables</option><option value="Hygiene">Hygiene</option><option value="PPE">PPE</option>
                  </select>
                </div>
                <div><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Unit Type</label><input type="text" required placeholder="pcs, bottles" value={stockUnit} onChange={(e) => setStockUnit(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Initial Quantity</label><input type="number" min="0" required value={stockCount} onChange={(e) => setStockCount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" /></div>
                <div><label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Low Stock Threshold</label><input type="number" min="1" required value={stockThreshold} onChange={(e) => setStockThreshold(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57]" /></div>
              </div>
              {stockSuccess && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Supply item registered!</div>}
              <button type="submit" disabled={isAddingStock} className="w-full py-3.5 bg-[#176e57] text-white font-bold rounded-xl text-sm hover:bg-[#125744] transition-colors flex items-center justify-center gap-2 shadow-md">
                <Plus className="w-5 h-5" /> Add Item to Storage
              </button>
            </form>
          </div>
        </div>
      </div>

      {showRolloverModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto"><RotateCcw className="w-8 h-8" /></div>
            <h3 className="font-black text-slate-800 text-xl">Reset Campus for New Day?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">This resets all 35 classrooms back to "Pending" and clears all safety flags, incident notes, and session statuses for the new shift.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowRolloverModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleExecuteRollover} disabled={isRollingOver} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-md">{isRollingOver ? 'Resetting...' : 'Confirm Reset'}</button>
            </div>
          </div>
        </div>
      )}

      {showClearLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><Trash2 className="w-8 h-8" /></div>
            <h3 className="font-black text-slate-800 text-xl">Delete All Shift Logs?</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">Are you sure you want to permanently delete all handover logs and incident reports? This cannot be undone.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowClearLogsModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
              <button onClick={handleClearLogs} disabled={isClearingLogs} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md">{isClearingLogs ? 'Clearing...' : 'Delete Logs'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}