import React, { useState } from 'react';
import { ChevronLeft, X, Camera, Plus, ChevronDown } from 'lucide-react';
import { ViewState, User } from '../types';
import { BottomNav } from '../components/BottomNav';
import { CATEGORIES } from '../constants';
import { productService } from '../services/supabaseService';

interface CreateAdScreenProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: User;
  initialCategory?: string;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onSellClick: () => void;
}

export const CreateAdScreen: React.FC<CreateAdScreenProps> = ({ view, setView, user, initialCategory = 'others', showToast, onSellClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    price: '',
    description: '',
    category: initialCategory,
    location: '',
    images: [] as string[],
  });

  const isTaxi = newAd.category === 'taxi';

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsLoading(true);
      try {
        const base64Images = await Promise.all(files.map((file) => resizeImage(file as File)));
        setNewAd((prev) => ({ ...prev, images: [...prev.images, ...base64Images] }));
      } catch (error) {
        showToast("Rasmni yuklashda xatolik", 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTaxi && newAd.images.length === 0) {
      showToast("Iltimos, mahsulot rasmini qo'shing", 'error');
      return;
    }
    if (!newAd.title.trim()) { showToast("Nima sotayotganingizni yozing", 'error'); return; }
    if (!newAd.price) { showToast("Narxini yozing", 'error'); return; }

    const finalImages = (isTaxi && newAd.images.length === 0) ? ['default-taxi'] : newAd.images;

    setIsLoading(true);
    try {
      await productService.createProduct({
        title: newAd.title,
        price: Number(newAd.price),
        description: newAd.description,
        category: newAd.category,
        location: newAd.location || 'Poshxurt',
        images: finalImages,
        isTop: false,
      }, user);
      setView('market');
      showToast("E'lon joylandi! ✅", 'success');
    } catch (err) {
      showToast("Xatolik yuz berdi, qayta urinib ko'ring", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Sarlavha */}
      <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-slate-100">
        <button onClick={() => setView(isTaxi ? 'driver-feed' : 'market')} className="mr-3 bg-slate-100 p-2 rounded-xl active:bg-slate-200 transition-colors">
          <ChevronLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="font-black text-xl text-slate-900">{isTaxi ? 'Taksi e\'loni' : 'Sotish'}</h1>
      </div>

      <div className="p-4 flex-1 max-w-lg mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. RASM — katta, oson */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              📷 Rasm {isTaxi && <span className="text-slate-400 text-sm font-medium">(ixtiyoriy)</span>}
            </label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {/* Yuklangan rasmlar */}
              {newAd.images.map((img, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-slate-200">
                  <img src={img} className="w-full h-full object-cover" alt={`rasm ${idx + 1}`} />
                  <button type="button" onClick={() => setNewAd((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow active:scale-90">
                    <X size={13} strokeWidth={3} />
                  </button>
                </div>
              ))}
              {/* Qo'shish tugmasi */}
              <label className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center bg-blue-50 rounded-2xl border-2 border-dashed border-blue-300 active:bg-blue-100 cursor-pointer">
                <Camera size={26} className="text-blue-600 mb-1" />
                <span className="text-xs font-bold text-blue-700">Rasm qo'shish</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
              </label>
            </div>
          </div>

          {/* 2. NIMA SOTYAPSIZ */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              {isTaxi ? '🚖 Yo\'nalish' : '✍️ Nima sotyapsiz?'}
            </label>
            {isTaxi && (
              <div className="flex flex-wrap gap-2 mb-2">
                {['Poshxurt → Termiz', 'Poshxurt → Sherobod', 'Qishloq ichida'].map((tag) => (
                  <button key={tag} type="button" onClick={() => setNewAd({ ...newAd, title: tag })} className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-2 rounded-xl active:bg-blue-100">{tag}</button>
                ))}
              </div>
            )}
            <input
              type="text"
              value={newAd.title}
              onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
              placeholder={isTaxi ? "Masalan: Poshxurt - Termiz" : "Masalan: Sigir sotiladi"}
              className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-slate-200 text-lg focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 3. NARX */}
          <div>
            <label className="block text-base font-bold text-slate-900 mb-2">
              💰 Narxi {isTaxi && <span className="text-slate-400 text-sm font-medium">(1 kishi)</span>}
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={newAd.price}
                onChange={(e) => setNewAd({ ...newAd, price: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-4 pr-16 rounded-2xl bg-white border-2 border-slate-200 text-lg font-bold focus:border-blue-500 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">so'm</span>
            </div>
          </div>

          {/* Telefon avtomatik — eslatma */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-lg">📞</span>
            <p className="text-sm text-green-800 font-medium">
              Telefon raqamingiz avtomatik qo'shiladi: <b>{user.phone}</b>
            </p>
          </div>

          {/* QO'SHIMCHA (ixtiyoriy) — yopiq turadi */}
          <button
            type="button"
            onClick={() => setShowExtra((s) => !s)}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3.5 active:bg-slate-50"
          >
            <span className="font-bold text-slate-700 flex items-center gap-2"><Plus size={18} /> Qo'shimcha (ixtiyoriy)</span>
            <ChevronDown size={20} className={`text-slate-400 transition-transform ${showExtra ? 'rotate-180' : ''}`} />
          </button>

          {showExtra && (
            <div className="space-y-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {/* Kategoriya — faqat oddiy sotuvda */}
              {!isTaxi && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Bo'lim</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'taxi').map((c) => (
                      <button key={c.id} type="button" onClick={() => setNewAd({ ...newAd, category: c.id })} className={`p-2.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${newAd.category === c.id ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                        <span className="text-xl">{c.icon}</span>
                        <span className="font-bold text-[11px] leading-tight text-center">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">{isTaxi ? 'Soat nechida? Qo\'shimcha' : 'Batafsil ma\'lumot'}</label>
                <textarea
                  rows={3}
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  placeholder={isTaxi ? "Masalan: Ertalab 07:00 da, Cobalt" : "Mahsulot haqida qo'shimcha"}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Manzil</label>
                <input
                  type="text"
                  value={newAd.location}
                  onChange={(e) => setNewAd({ ...newAd, location: e.target.value })}
                  placeholder="Masalan: Poshxurt markazi"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-60">
            {isLoading ? 'Joylanmoqda...' : "E'LONNI JOYLASH"}
          </button>
        </form>
      </div>

      <BottomNav view={view} setView={setView} onSellClick={onSellClick} />
    </div>
  );
};
