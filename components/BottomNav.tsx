import React from 'react';
import { Home, ShoppingBag, TruckIcon, PlusCircle, User as UserIcon } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  onSellClick: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent: 'blue' | 'yellow';
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, setView, onSellClick }) => {
  const items: NavItem[] = [
    { key: 'home', label: 'Asosiy', icon: <Home size={26} strokeWidth={2.4} />, active: view === 'home', onClick: () => setView('home'), accent: 'blue' },
    { key: 'market', label: 'Bozor', icon: <ShoppingBag size={26} strokeWidth={2.4} />, active: view === 'market', onClick: () => setView('market'), accent: 'blue' },
    { key: 'create', label: 'Sotish', icon: <PlusCircle size={28} strokeWidth={2.4} />, active: view === 'create', onClick: onSellClick, accent: 'blue' },
    { key: 'taxi', label: 'Taksi', icon: <TruckIcon size={26} strokeWidth={2.4} />, active: ['taxi-choice', 'passenger-request', 'driver-feed'].includes(view), onClick: () => setView('taxi-choice'), accent: 'yellow' },
    { key: 'profile', label: 'Kabinet', icon: <UserIcon size={26} strokeWidth={2.4} />, active: view === 'profile', onClick: () => setView('profile'), accent: 'blue' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 safe-bottom z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:w-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl md:shadow-2xl md:border md:border-slate-200">
      <div className="flex items-stretch justify-around md:gap-2 md:px-3 px-1 py-1.5">
        {items.map((item) => {
          const activeColor = item.accent === 'yellow' ? 'text-yellow-600' : 'text-blue-600';
          const activeBg = item.accent === 'yellow' ? 'bg-yellow-50' : 'bg-blue-50';
          return (
            <button
              key={item.key}
              onClick={item.onClick}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-2xl min-w-0 active:scale-95 transition-all ${item.active ? activeColor : 'text-slate-400'}`}
            >
              <div className={`px-4 py-1 rounded-2xl transition-colors ${item.active ? activeBg : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <span className="text-[11px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
