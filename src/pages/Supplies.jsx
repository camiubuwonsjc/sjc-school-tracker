import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Plus, Minus, Trash2, AlertTriangle, CheckCircle2, Box, Download } from 'lucide-react';

export default function Supplies({ supplies, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const categories = ['All', 'Chemicals', 'Equipment', 'Disposables', 'Hygiene', 'PPE'];
  const lowStockCount = supplies.filter((s) => s.count <= s.threshold).length;

  const filteredSupplies = supplies.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpdateQuantity = async (supplyId, currentCount, delta) => {
    const newCount = Math.max(0, currentCount + delta);
    setUpdatingId(supplyId);
    const { error } = await supabase.from('supplies').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', supplyId);
    if (error) console.error('Failed to update supply count:', error);
    setUpdatingId(null);
  };

  const handleDeleteSupply = async (supplyId) => {
    if (!window.confirm('Permanently delete this supply item?')) return;
    await supabase.from('supplies').delete().eq('id', supplyId);
  };

  // Export Inventory to CSV (Acts like Excel Export)
  const exportToExcel = () => {
    const headers = ['Item Name', 'Category', 'Current Stock', 'Threshold Limit', 'Unit', 'Status'];
    const rows = supplies.map(s => [
      `"${s.name}"`, 
      `"${s.category}"`, 
      s.count, 
      s.threshold, 
      `"${s.unit}"`, 
      s.count <= s.threshold ? '"Low Stock"' : '"Healthy"'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `SJC_Dimasalang_Supplies_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-8">
      
      {/* Header with Export Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Stockroom Items</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">{supplies.length} Registered Inventory Items</p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#176e57] transition-all"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#176e57] border border-emerald-200 rounded-2xl text-sm font-bold transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
              activeCategory === category
                ? 'bg-[#176e57] text-white shadow-lg shadow-emerald-900/20'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* PC Grid / Mobile List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSupplies.map((item) => {
          const isLowStock = item.count <= item.threshold;
          const isUpdating = updatingId === item.id;

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
                {user.role === 'admin' && (
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
                  <button disabled={isUpdating || item.count === 0} onClick={() => handleUpdateQuantity(item.id, item.count, -1)} className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40">
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-3 text-center min-w-[50px]">
                    <span className={`font-black text-lg ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>{item.count}</span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-1 uppercase">{item.unit}</span>
                  </div>
                  <button disabled={isUpdating} onClick={() => handleUpdateQuantity(item.id, item.count, 1)} className="w-10 h-10 rounded-xl bg-[#176e57] text-white hover:bg-[#125744] flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}