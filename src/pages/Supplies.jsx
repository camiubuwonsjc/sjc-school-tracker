import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Plus, Minus, Trash2, AlertTriangle, Download, X, CheckCircle2 } from 'lucide-react';

export default function Supplies({ supplies, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Optimistic UI State (Ensures instant visual updates during presentations)
  const [localSupplies, setLocalSupplies] = useState([]);

  // Deduction Modal State
  const [deductModal, setDeductModal] = useState(null);
  const [useAmount, setUseAmount] = useState('');

  // BULLETPROOF FALLBACK
  const fallbackSupplies = [
    { id: 1, name: 'Industrial Bleach', category: 'Chemicals', count: 15, threshold: 20, unit: 'Gallons' },
    { id: 2, name: 'Heavy Duty Mop', category: 'Equipment', count: 3, threshold: 5, unit: 'Pieces' },
    { id: 3, name: 'Trash Bags (XL)', category: 'Disposables', count: 50, threshold: 20, unit: 'Rolls' },
    { id: 4, name: 'Hand Soap Refill', category: 'Hygiene', count: 8, threshold: 10, unit: 'Bottles' },
    { id: 5, name: 'Latex Gloves', category: 'PPE', count: 2, threshold: 10, unit: 'Boxes' },
    { id: 6, name: 'Glass Cleaner', category: 'Chemicals', count: 22, threshold: 10, unit: 'Bottles' },
  ];

  useEffect(() => {
    setLocalSupplies(supplies?.length > 0 ? supplies : fallbackSupplies);
  }, [supplies]);

  const categories = ['All', 'Chemicals', 'Equipment', 'Disposables', 'Hygiene', 'PPE'];

  const filteredSupplies = localSupplies.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // INSTANT OPTIMISTIC UPDATE: Add 1 (Admin Only)
  const handleAdminAdd = (item) => {
    const newCount = item.count + 1;
    setLocalSupplies(prev => prev.map(s => s.id === item.id ? { ...s, count: newCount } : s));
    supabase.from('supplies').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', item.id);
  };

  // INSTANT OPTIMISTIC UPDATE: Deduct custom amount (Admin & Staff)
  const confirmDeduction = (e) => {
    e.preventDefault();
    const amountToDeduct = parseInt(useAmount);
    if (!amountToDeduct || amountToDeduct <= 0) return;

    const newCount = Math.max(0, deductModal.count - amountToDeduct);
    
    // Update screen instantly
    setLocalSupplies(prev => prev.map(s => s.id === deductModal.id ? { ...s, count: newCount } : s));
    
    // Update DB in background
    supabase.from('supplies').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', deductModal.id);
    
    setDeductModal(null);
    setUseAmount('');
  };

  const handleDeleteSupply = async (supplyId) => {
    if (!window.confirm('Permanently delete this supply item?')) return;
    setLocalSupplies(prev => prev.filter(s => s.id !== supplyId));
    await supabase.from('supplies').delete().eq('id', supplyId);
  };

  const exportToExcel = () => {
    const headers = ['Item Name', 'Category', 'Current Stock', 'Threshold Limit', 'Unit', 'Status'];
    const rows = localSupplies.map(s => [
      `"${s.name}"`, `"${s.category}"`, s.count, s.threshold, `"${s.unit}"`, 
      s.count <= s.threshold ? '"Low Stock"' : '"Healthy"'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `SJC_Dimasalang_Supplies.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Stockroom Items</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">{localSupplies.length} Registered Inventory Items</p>
        </div>
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all" />
          </div>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#176e57] border border-emerald-200 rounded-2xl text-sm font-bold transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button key={category} onClick={() => setActiveCategory(category)} className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeCategory === category ? 'bg-[#176e57] text-white shadow-lg shadow-emerald-900/20' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'}`}>
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSupplies.map((item) => {
          const isLowStock = item.count <= item.threshold;
          return (
            <div key={item.id} className={`bg-white p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${isLowStock ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/80'}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2.5 py-1 bg-slate-100 rounded-lg">{item.category}</span>
                    {isLowStock && <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg"><AlertTriangle className="w-3 h-3" /> Low Stock</span>}
                  </div>
                  <h3 className="font-black text-slate-800 text-base leading-tight">{item.name}</h3>
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDeleteSupply(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-sm">
                  <span className="text-slate-400 font-medium">Alert at: </span>
                  <span className="font-bold text-slate-700">{item.threshold} {item.unit}</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  
                  {/* REDUCED ACCESS: Staff/Janitors can only see and click the minus button */}
                  <button disabled={item.count === 0} onClick={() => { setDeductModal(item); setUseAmount(''); }} className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40 border border-slate-200">
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="px-3 text-center min-w-[50px]">
                    <span className={`font-black text-lg ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>{item.count}</span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-1 uppercase">{item.unit}</span>
                  </div>
                  
                  {/* FULL ACCESS: Admins get the Plus button */}
                  {user?.role === 'admin' && (
                    <button onClick={() => handleAdminAdd(item)} className="w-10 h-10 rounded-xl bg-[#176e57] text-white hover:bg-[#125744] flex items-center justify-center shadow-sm active:scale-95 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deduction Prompt Modal */}
      {deductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-sm w-full shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Package className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Record Usage</h3>
                  <p className="text-xs text-slate-500 font-medium">Update stock for {deductModal.name}</p>
                </div>
              </div>
              <button onClick={() => setDeductModal(null)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={confirmDeduction} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">How many {deductModal.unit.toLowerCase()} did you use?</label>
                <input 
                  type="number" 
                  min="1" 
                  max={deductModal.count}
                  required
                  autoFocus
                  value={useAmount}
                  onChange={(e) => setUseAmount(e.target.value)}
                  className="w-full text-center text-3xl font-black text-[#176e57] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#176e57]"
                  placeholder="0"
                />
                <p className="text-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  Current Stock: {deductModal.count} {deductModal.unit}
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setDeductModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-[#176e57] text-white rounded-xl font-bold hover:bg-[#125744] flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all">
                  <CheckCircle2 className="w-5 h-5" /> Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}