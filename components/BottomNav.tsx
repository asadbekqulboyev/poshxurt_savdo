import React from 'react';
import { Home, TruckIcon, PlusCircle, User as UserIcon } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  onSellClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, setView, onSellClick }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 safe-bottom py-2 z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.02)] md:w-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-2xl md:shadow-2xl md:border md:border-slate-200 md:px-6 md:py-3 transition-all duration-300">
    <div className="flex justify-between items-center md:gap-8">
      <button 
        onClick={() => setView('market')} 
        className={`flex-1 flex flex-col items-center justify-center transition-all py-1 md:w-16 ${view === 'market' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className={`p-1.5 rounded-xl ${view === 'market' ? 'bg-blue-50' : 'bg-transparent'}`}>
          <Home size={22} strokeWidth={2.5} />
        </div>
        <span className="text-[9px] font-bold mt-0.5">Bozor</span>
      </button>

      <button 
        onClick={() => setView('taxi-choice')} 
        className={`flex-1 flex flex-col items-center justify-center transition-all py-1 md:w-16 ${['taxi-choice', 'passenger-request', 'driver-feed'].includes(view) ? 'text-yellow-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className={`p-1.5 rounded-xl ${['taxi-choice', 'passenger-request', 'driver-feed'].includes(view) ? 'bg-yellow-50' : 'bg-transparent'}`}>
            <TruckIcon size={22} strokeWidth={2.5} />
        </div>
        <span className="text-[9px] font-bold mt-0.5">Taxi</span>
      </button>

      <button 
        onClick={onSellClick} 
        className={`flex-1 flex flex-col items-center justify-center transition-all py-1 md:w-16 ${view === 'create' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className={`p-1.5 rounded-xl ${view === 'create' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <PlusCircle size={22} strokeWidth={2.5} />
        </div>
        <span className="text-[9px] font-bold mt-0.5">Sotish</span>
      </button>

      <button 
        onClick={() => setView('profile')} 
        className={`flex-1 flex flex-col items-center justify-center transition-all py-1 md:w-16 ${view === 'profile' ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className={`p-1.5 rounded-xl ${view === 'profile' ? 'bg-blue-50' : 'bg-transparent'}`}>
            <UserIcon size={22} strokeWidth={2.5} />
        </div>
        <span className="text-[9px] font-bold mt-0.5">Kabinet</span>
      </button>
    </div>
  </div>
);
