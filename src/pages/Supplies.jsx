import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Search, Plus, Minus, Trash2, AlertTriangle, Download, X, CheckCircle2, Users, Activity, TrendingUp } from 'lucide-react';

export default function Supplies({ supplies, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [localSupplies, setLocalSupplies] = useState([]);
  const [deductModal, setDeductModal] = useState(null);
  const [useAmount, setUseAmount] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  // Fallback stock list
  const fallbackSupplies = [
    { id: 1, name: 'Floor Bleach & Disinfectant', category: 'Chemicals', count: 15, threshold: 3, unit: 'Gals' },
    { id: 2, name: 'Commercial Mop Heads', category: 'Equipment', count: 3, threshold: 4, unit: 'Pcs' },
    { id: 3, name: 'Antibacterial Hand Soap Refill', category: 'Hygiene', count: 8, threshold: 6, unit: 'Liters' },
    { id: 4, name: 'Microfiber Cleaning Cloths', category: 'Equipment', count: 0, threshold: 10, unit: 'Pcs' },
    { id: 5, name: 'A4 Bond Paper', category: 'Paper & Printing', count: 6, threshold: 5, unit: 'Box' },
    { id: 6, name: 'Microfiber Mop Heads', category: 'Equipment', count: 8, threshold: 3, unit: 'Pcs' },
    { id: 7, name: 'Bleach Disinfectant 1L', category: 'Chemicals', count: 12, threshold: 5, unit: 'Bottles' },
    { id: 8, name: 'Liquid Hand Soap 500ml', category: 'Hygiene', count: 24, threshold: 10, unit: 'Bottles' },
    { id: 9, name: 'Heavy-Duty Latex Gloves', category: 'PPE', count: 0, threshold: 5, unit: 'Pairs' },
    { id: 10, name: 'Copy Paper (A4 Ream)', category: 'Paper & Printing', count: 0, threshold: 5, unit: 'Reams' },
    { id: 11, name: 'Heavy-Duty Trash Bags (XL)', category: 'Disposables', count: 0, threshold: 10, unit: 'Rolls' },
    { id: 12, name: 'Toilet Acid Cleaner', category: 'Chemicals', count: 0, threshold: 4, unit: 'Bottles' },
  ];

  // Assigned staff per category for Canva-style profile bubbles
  const assignedStaffByCat = {
    Chemicals: [
      { name: 'Kuya Bert', role: 'Custodial #001', bg: 'bg-[#176e57]', initials: 'KB' },
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
      { name: 'Custodial #003', role: 'Floor 5', bg: 'bg-amber-600', initials: '03' },
    ],
    Equipment: [
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
      { name: 'Custodial #004', role: 'Floor 6', bg: 'bg-purple-600', initials: '04' },
      { name: 'Custodial #005', role: 'Floor 7', bg: 'bg-rose-600', initials: '05' },
    ],
    Disposables: [
      { name: 'Kuya Bert', role: 'Custodial #001', bg: 'bg-[#176e57]', initials: 'KB' },
      { name: 'Custodial #005', role: 'Floor 7', bg: 'bg-rose-600', initials: '05' },
    ],
    Hygiene: [
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
      { name: 'Custodial #003', role: 'Floor 5', bg: 'bg-amber-600', initials: '03' },
      { name: 'Custodial #004', role: 'Floor 6', bg: 'bg-purple-600', initials: '04' },
    ],
    PPE: [
      { name: 'Supervisor', role: 'Admin Panel', bg: 'bg-slate-800', initials: 'AD' },
      { name: 'Kuya Bert', role: 'Custodial #001', bg: 'bg-[#176e57]', initials: 'KB' },
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
    ],
    'Paper & Printing': [
      { name: 'Supervisor', role: 'Office Admin', bg: 'bg-slate-800', initials: 'AD' },
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
    ],
  };

  useEffect(() => {
    setLocalSupplies(supplies?.length > 0 ? supplies : fallbackSupplies);
  }, [supplies]);

  const categories = ['All', 'Chemicals', 'Equipment', 'Disposables', 'Hygiene', 'PPE'];

  const filteredSupplies = localSupplies.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 100% Product-Only Images
  const getItemImage = (item) => {
    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();

    if (name.includes('paper') || name.includes('ream') || name.includes('bond') || cat.includes('paper')) {
      return 'https://images.unsplash.com/photo-1516409590654-e8d51fc2d25c?q=80&w=1126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }
    if (name.includes('cloth') || name.includes('towel') || name.includes('rag') || name.includes('microfiber cleaning')) {
      return 'https://media.istockphoto.com/id/511656384/photo/microfiber-cleaning-cloth.webp?a=1&b=1&s=612x612&w=0&k=20&c=wiNYD5vm0bs5exISKl-M5Y67Kd8woLJR2qvpSA3yTfg=';
    }
    if (name.includes('mop')) {
      if (name.includes('microfiber')) {
        return 'https://plus.unsplash.com/premium_photo-1675937428940-6f0ddd4ce5c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
      }
      return 'https://images.unsplash.com/photo-1581791654986-fc536a4bbdbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }
    if (name.includes('glove') || name.includes('latex') || name.includes('rubber') || cat.includes('ppe')) {
      return 'https://plus.unsplash.com/premium_photo-1664372899150-f1cc68364af7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }
    if (name.includes('trash') || name.includes('bag') || name.includes('garbage')) {
      return 'https://plus.unsplash.com/premium_photo-1671031352715-805ff4f3d20d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }
    if (name.includes('soap') || name.includes('sanitizer') || cat.includes('hygiene')) {
      return 'https://images.unsplash.com/photo-1617394391198-9c22947fc920?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }
    if (name.includes('toilet') || name.includes('acid')) {
      return 'https://media.istockphoto.com/id/1455329796/photo/cleaning-products.webp?a=1&b=1&s=612x612&w=0&k=20&c=Qx0iH4b9_k-k_W5nwrxMeuuMUJAa8ntSy1R31cKAGMA=';
    }
    if (name.includes('bleach') || name.includes('disinfectant') || cat.includes('chemical')) {
      return 'https://media.istockphoto.com/id/486621069/photo/pouring-blue-liquid.webp?a=1&b=1&s=612x612&w=0&k=20&c=NfBhE7hA5tdcP64rZM4PaK_YpI4uHRgpVpZrC0PHaco=';
    }
    if (name.includes('glass') || name.includes('window')) {
      return 'https://plus.unsplash.com/premium_photo-1676810457640-77cea17fb530?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
    }

    return 'https://plus.unsplash.com/premium_photo-1677234146599-38239d211394?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D';
  };

  const getAssignedStaff = (item) => {
    return assignedStaffByCat[item.category] || [
      { name: 'Kuya Bert', role: 'Custodial #001', bg: 'bg-[#176e57]', initials: 'KB' },
      { name: 'Cami', role: 'Custodial #002', bg: 'bg-blue-600', initials: 'CM' },
    ];
  };

  const getUsageStats = (item) => {
    const totalUsed = item.total_used || (item.count * 2 + ((item.id * 7) % 25) + 12);
    const peopleCount = item.people_count || ((item.id % 4) + 2);
    const maxCapacity = Math.max(item.count + totalUsed, item.threshold * 4, 30);
    const percentage = Math.min(100, Math.round((totalUsed / maxCapacity) * 100));

    return { totalUsed, peopleCount, percentage, maxCapacity };
  };

  const handleAdminAdd = (item) => {
    const newCount = item.count + 1;
    setLocalSupplies(prev => prev.map(s => s.id === item.id ? { ...s, count: newCount } : s));
    supabase.from('supplies').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', item.id);
  };

  const confirmDeduction = (e) => {
    e.preventDefault();
    const amountToDeduct = parseInt(useAmount);
    if (!amountToDeduct || amountToDeduct <= 0) return;

    const newCount = Math.max(0, deductModal.count - amountToDeduct);
    
    setLocalSupplies(prev => prev.map(s => s.id === deductModal.id ? { ...s, count: newCount } : s));
    supabase.from('supplies').update({ count: newCount, updated_at: new Date().toISOString() }).eq('id', deductModal.id);
    
    if (expandedItem && expandedItem.id === deductModal.id) {
      setExpandedItem(prev => ({ ...prev, count: newCount }));
    }

    setDeductModal(null);
    setUseAmount('');
  };

  const handleDeleteSupply = async (supplyId) => {
    if (!window.confirm('Permanently delete this supply item?')) return;
    setLocalSupplies(prev => prev.filter(s => s.id !== supplyId));
    if (expandedItem && expandedItem.id === supplyId) setExpandedItem(null);
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
    <div className="space-y-5 p-4 sm:p-6 pb-24 md:pb-6 relative">
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
          const imageUrl = getItemImage(item);
          const assignedStaff = getAssignedStaff(item);

          return (
            <div 
              key={item.id} 
              onClick={() => setExpandedItem(item)}
              className={`bg-white p-5 rounded-3xl border shadow-sm cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between ${
                isLowStock ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/80'
              }`}
            >
              
              {/* Header with 75% Text & 25% Top-Right Image Box */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2.5 py-1 bg-slate-100 rounded-lg">{item.category}</span>
                    {isLowStock && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-800 text-base leading-tight break-words">{item.name}</h3>
                  
                  {/* UNEXPANDED CANVA-STYLE OVERLAPPING STAFF PROFILE BUBBLES */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2 overflow-hidden">
                      {assignedStaff.map((staff, idx) => (
                        <div 
                          key={idx} 
                          title={`${staff.name} — ${staff.role}`}
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white ${staff.bg} text-white font-black text-[9px] shadow-sm transition-transform hover:scale-125 hover:z-10`}
                        >
                          {staff.initials}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">Assigned</span>
                  </div>
                </div>

                {/* 25% Width Product-Only Image Box */}
                <div className="w-[25%] shrink-0 relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-inner group/img">
                  <img 
                    src={imageUrl} 
                    alt={item.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=400';
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110" 
                  />
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSupply(item.id); }} 
                      className="absolute top-1 right-1 p-1.5 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors shadow-sm"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Footer Actions & Counters */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-sm">
                  <span className="text-slate-400 font-medium">Alert at: </span>
                  <span className="font-bold text-slate-700">{item.threshold} {item.unit}</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <button 
                    disabled={item.count === 0} 
                    onClick={(e) => { e.stopPropagation(); setDeductModal(item); setUseAmount(''); }} 
                    className="w-10 h-10 rounded-xl bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-40 border border-slate-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="px-3 text-center min-w-[50px]">
                    <span className={`font-black text-lg ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>{item.count}</span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-1 uppercase">{item.unit}</span>
                  </div>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAdminAdd(item); }} 
                      className="w-10 h-10 rounded-xl bg-[#176e57] text-white hover:bg-[#125744] flex items-center justify-center shadow-sm active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* EXPANDED 30% SCREEN POP MODAL */}
      {expandedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full md:w-[35%] lg:w-[30%] min-w-[340px] max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-90 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                  {expandedItem.category}
                </span>
                <h3 className="font-black text-slate-800 text-lg md:text-xl mt-1 leading-snug">
                  {expandedItem.name}
                </h3>
              </div>

              {/* Stacked Staff Bubbles in Modal */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {getAssignedStaff(expandedItem).map((staff, idx) => (
                    <div 
                      key={idx} 
                      title={`${staff.name} — ${staff.role}`}
                      className={`inline-flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-white ${staff.bg} text-white font-black text-xs shadow-md transition-transform hover:scale-110 hover:z-10`}
                    >
                      {staff.initials}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setExpandedItem(null)} 
                  className="p-2 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Product Image & Main Stock Stats */}
              <div className="flex items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
                  <img 
                    src={getItemImage(expandedItem)} 
                    alt={expandedItem.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{expandedItem.count}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">{expandedItem.unit}</span>
                  </div>
                  <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Reorder Alert at {expandedItem.threshold} {expandedItem.unit}
                  </p>
                </div>
              </div>

              {/* USAGE METER SECTION */}
              <div className="space-y-3 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#176e57]">
                    <Activity className="w-5 h-5" />
                    <h4 className="font-bold text-slate-800 text-sm">Consumption Usage Meter</h4>
                  </div>
                  <span className="text-xs font-black text-[#176e57] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {getUsageStats(expandedItem).percentage}% Consumed
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-[#176e57] h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${getUsageStats(expandedItem).percentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100/80">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-[#176e57]" /> Staff Active
                    </div>
                    <p className="text-lg font-black text-slate-800 mt-0.5">
                      {getUsageStats(expandedItem).peopleCount} Custodians
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-100/80">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-[#176e57]" /> Total Used
                    </div>
                    <p className="text-lg font-black text-slate-800 mt-0.5">
                      {getUsageStats(expandedItem).totalUsed} {expandedItem.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Staff List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" /> Assigned Custodial Staff
                </h4>
                <div className="space-y-2">
                  {getAssignedStaff(expandedItem).map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${st.bg} text-white font-black text-xs flex items-center justify-center shadow-sm`}>
                          {st.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{st.name}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{st.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                        Active Assignment
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => { setDeductModal(expandedItem); setUseAmount(''); }}
                  className="flex-1 py-3 bg-[#176e57] text-white font-bold text-xs rounded-xl hover:bg-[#125744] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" /> Record Usage
                </button>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => handleAdminAdd(expandedItem)}
                    className="flex-1 py-3 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Restock Item
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DEDUCT USAGE MODAL */}
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