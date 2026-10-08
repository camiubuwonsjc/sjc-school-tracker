import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Grid, Package, ShieldCheck } from 'lucide-react';

export default function Navbar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'rooms', label: 'Rooms', path: '/rooms', icon: Grid },
    { id: 'supplies', label: 'Supplies', path: '/supplies', icon: Package },
  ];

  if (role === 'admin') {
    tabs.push({ id: 'admin', label: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  const activeIndex = tabs.findIndex((tab) => tab.path === location.pathname);
  const currentTab = tabs[activeIndex >= 0 ? activeIndex : 0];
  const isAdminTab = currentTab?.id === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="relative flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {/* Floating Active Indicator Bar */}
        <div
          className={`absolute top-0 h-1 rounded-full transition-all duration-300 ${
            isAdminTab ? 'bg-amber-600' : 'bg-[#176e57]'
          }`}
          style={{
            width: `${100 / tabs.length - 8}%`,
            left: `calc(${(activeIndex >= 0 ? activeIndex : 0) * (100 / tabs.length)}% + 4%)`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-colors relative ${
                isActive
                  ? tab.id === 'admin'
                    ? 'text-amber-600 font-bold'
                    : 'text-[#176e57] font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}