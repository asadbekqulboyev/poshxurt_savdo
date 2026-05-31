import React from 'react';
import { ShoppingBag, TruckIcon, ChevronRight } from 'lucide-react';
import { User, ViewState } from '../types';

interface HomeScreenProps {
  user: User;
  setView: (v: ViewState) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Salomlashuv */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 pt-10 pb-12 px-6 rounded-b-[2.5rem] shadow-lg shadow-blue-900/10">
        <p className="text-blue-100 font-medium text-sm">Assalomu alaykum,</p>
        <h1 className="text-white text-2xl font-black tracking-tight">{user.name} 👋</h1>
        <p className="text-blue-100/80 text-sm mt-1">Poshxurt qishlog'i platformasi</p>
      </div>

      {/* Ikki katta tanlov */}
      <div className="flex-1 px-5 -mt-6 space-y-4">
        {/* BOZOR */}
        <button
          onClick={() => setView('market')}
          className="w-full group bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex items-center text-left active:scale-[0.98] hover:shadow-lg transition-all"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mr-5 flex-shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingBag size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900 mb-1">Bozor</h2>
            <p className="text-slate-500 text-sm leading-snug">Mol, mahsulot, texnika sotish va sotib olish</p>
          </div>
          <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors ml-2 flex-shrink-0" size={24} />
        </button>

        {/* TAKSI */}
        <button
          onClick={() => setView('taxi-choice')}
          className="w-full group bg-yellow-400 rounded-3xl p-6 shadow-md flex items-center text-left active:scale-[0.98] hover:shadow-lg transition-all relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center text-black mr-5 flex-shrink-0 group-hover:scale-110 transition-transform relative z-10">
            <TruckIcon size={32} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <h2 className="text-xl font-black text-black mb-1">Taksi</h2>
            <p className="text-black/70 text-sm leading-snug">Qishloq ichida va shaharga qatnash</p>
          </div>
          <ChevronRight className="text-black/30 group-hover:text-black transition-colors ml-2 flex-shrink-0 relative z-10" size={24} />
        </button>
      </div>

      {/* Pastki tugma: Kabinet */}
      <div className="px-5 pb-8 pt-2">
        <button
          onClick={() => setView('profile')}
          className="w-full bg-white rounded-2xl py-4 shadow-sm border border-slate-100 text-slate-600 font-bold text-sm active:scale-[0.98] hover:bg-slate-50 transition-all"
        >
          Mening sahifam
        </button>
      </div>
    </div>
  );
};
