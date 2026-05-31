import React from 'react';
import { ShoppingBag, TruckIcon, ChevronRight, User as UserIcon } from 'lucide-react';
import { User, ViewState } from '../types';

interface HomeScreenProps {
  user: User;
  setView: (v: ViewState) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Salomlashuv */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 pt-8 pb-14 px-5 rounded-b-[2rem] shadow-lg shadow-blue-900/10">
        <p className="text-blue-100 font-medium text-base">Assalomu alaykum,</p>
        <h1 className="text-white text-3xl font-black tracking-tight">{user.name} 👋</h1>
        <p className="text-blue-100/80 text-sm mt-1">Poshxurt qishlog'i platformasi</p>
      </div>

      {/* Ikki katta tanlov */}
      <div className="flex-1 px-4 -mt-8 space-y-4">
        {/* BOZOR */}
        <button
          onClick={() => setView('market')}
          className="w-full bg-white rounded-3xl p-5 shadow-md border border-slate-100 flex items-center text-left active:scale-[0.98] transition-all"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
            <ShoppingBag size={34} strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-900 mb-0.5">Bozor</h2>
            <p className="text-slate-500 text-sm leading-snug">Mol, mahsulot, texnika oldi-sotdi</p>
          </div>
          <ChevronRight className="text-slate-300 ml-2 flex-shrink-0" size={26} />
        </button>

        {/* TAKSI */}
        <button
          onClick={() => setView('taxi-choice')}
          className="w-full bg-yellow-400 rounded-3xl p-5 shadow-md flex items-center text-left active:scale-[0.98] transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center text-black mr-4 flex-shrink-0 relative z-10">
            <TruckIcon size={34} strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <h2 className="text-2xl font-black text-black mb-0.5">Taksi</h2>
            <p className="text-black/70 text-sm leading-snug">Qishloq ichida va shaharga qatnash</p>
          </div>
          <ChevronRight className="text-black/40 ml-2 flex-shrink-0 relative z-10" size={26} />
        </button>

        {/* Kabinet */}
        <button
          onClick={() => setView('profile')}
          className="w-full bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center text-left active:scale-[0.98] transition-all"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mr-4 flex-shrink-0">
            <UserIcon size={32} strokeWidth={2.4} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-900 mb-0.5">Mening sahifam</h2>
            <p className="text-slate-500 text-sm leading-snug">E'lonlarim va sozlamalar</p>
          </div>
          <ChevronRight className="text-slate-300 ml-2 flex-shrink-0" size={26} />
        </button>
      </div>
    </div>
  );
};
