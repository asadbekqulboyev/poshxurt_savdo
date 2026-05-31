import React from 'react';
import { ChevronLeft, TruckIcon, Crown, Phone } from 'lucide-react';
import { Product, ViewState } from '../types';
import { BottomNav } from '../components/BottomNav';
import { CATEGORIES } from '../constants';

interface ProductDetailScreenProps {
  product: Product;
  view: ViewState;
  setView: (v: ViewState) => void;
  onSellClick: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product, view, setView, onSellClick }) => {
  const isTaxi = product.category === 'taxi';
  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-20 md:pb-0 md:bg-slate-50">
      <div className="max-w-6xl mx-auto w-full md:mt-8 md:mb-20 md:grid md:grid-cols-2 md:gap-8 md:px-6">
        <div className="relative h-80 md:h-[500px] bg-slate-900 group md:rounded-3xl md:overflow-hidden md:shadow-xl">
          <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full no-scrollbar">
            {product.images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                {img === 'default-taxi' ? (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center"><TruckIcon size={80} className="text-slate-400" strokeWidth={1.5} /></div>
                ) : (
                    <img src={img} alt={`${product.title} - ${idx + 1}`} className="w-full h-full object-contain md:object-cover bg-black" />
                )}
              </div>
            ))}
          </div>
          {product.images.length > 1 && <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">{product.images.length} ta rasm</div>}
          <button onClick={() => setView('market')} className="fixed top-4 left-4 z-50 bg-white/60 backdrop-blur-md p-2.5 rounded-full text-black shadow-lg active:scale-90 transition-transform border border-white/40 md:absolute md:top-4 md:left-4 hover:bg-white"><ChevronLeft size={24} /></button>
          {product.isTop && <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-black px-3 py-1.5 rounded-full font-black flex items-center shadow-xl border border-white/50 text-xs"><Crown size={16} className="mr-1 fill-black" /> TOP</div>}
        </div>
        <div className="flex-1 p-5 bg-white rounded-t-[2rem] -mt-6 relative z-10 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] md:mt-0 md:rounded-3xl md:shadow-xl md:p-8 md:flex md:flex-col">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
          <div className="mb-3">
            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold uppercase text-xs mb-3 inline-block tracking-wide">
              {CATEGORIES.find(c => c.id === product.category)?.icon} {CATEGORIES.find(c => c.id === product.category)?.name}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug">{product.title}</h1>
          </div>
          <p className="text-3xl md:text-4xl font-black text-blue-600 mb-6">{new Intl.NumberFormat('uz-UZ').format(product.price)} <span className="text-base text-slate-400 font-medium">so'm {isTaxi ? "(kishi boshiga)" : ""}</span></p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center shadow-sm">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-200 to-sky-300 rounded-xl flex items-center justify-center text-blue-900 font-bold text-xl md:text-2xl mr-4 shadow-inner">{product.sellerName.charAt(0)}</div>
            <div>
                <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5">{isTaxi ? "Haydovchi" : "Sotuvchi"}</p>
                <p className="font-bold text-lg md:text-xl text-slate-900 leading-tight">{product.sellerName}</p>
                <p className="text-slate-500 text-xs md:text-sm mt-0.5 flex items-center"><span className="mr-1">📍</span> {product.location}</p>
            </div>
          </div>
          <div className="mb-8 flex-grow">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Ma'lumot:</h3>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
          <div className="hidden md:block mt-auto">
            <a href={`tel:${product.sellerPhone.replace(/\s/g, '')}`} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]">
              <Phone className="mr-2" size={24} fill="currentColor" />{isTaxi ? "HAYDOVCHIGA BOG'LANISH" : "TELEFON QILISH"}
            </a>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-20 safe-bottom md:hidden">
        <a href={`tel:${product.sellerPhone.replace(/\s/g, '')}`} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-xl flex items-center justify-center hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]">
          <Phone className="mr-2" size={24} fill="currentColor" />{isTaxi ? "HAYDOVCHIGA BOG'LANISH" : "TELEFON QILISH"}
        </a>
      </div>
      <div className="hidden md:block"><BottomNav view={view} setView={setView} onSellClick={onSellClick} /></div>
    </div>
  );
};
