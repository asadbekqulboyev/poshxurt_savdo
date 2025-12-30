import React, { useState } from 'react';
import { ChevronLeft, X, ImageIcon, Camera } from 'lucide-react';
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
  const [newAd, setNewAd] = useState({
    title: '',
    price: '',
    description: '',
    category: initialCategory,
    location: '',
    images: [] as string[]
  });

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
        const base64Images = await Promise.all(files.map(file => resizeImage(file as File)));
        setNewAd(prev => ({ ...prev, images: [...prev.images, ...base64Images] }));
      } catch (error) { showToast("Rasmni yuklashda xatolik", 'error'); } 
      finally { setIsLoading(false); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isTaxi = newAd.category === 'taxi';
    if (!isTaxi && newAd.images.length === 0) { showToast("Iltimos, kamida bitta rasm yuklang!", 'error'); return; }
    const finalImages = (isTaxi && newAd.images.length === 0) ? ['default-taxi'] : newAd.images;

    setIsLoading(true);
    try {
      await productService.createProduct({
        title: newAd.title,
        price: Number(newAd.price),
        description: newAd.description,
        category: newAd.category,
        location: newAd.location,
        images: finalImages,
        isTop: false
      }, user);
      setView('market');
      showToast("E'lon muvaffaqiyatli joylandi!", 'success');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:justify-center md:pb-0 pb-20">
      <div className="w-full max-w-lg mx-auto bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border border-slate-100 h-full md:h-auto flex flex-col md:max-h-[85vh]">
        <div className="bg-white px-5 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-slate-50 flex-shrink-0">
          <button onClick={() => setView(newAd.category === 'taxi' ? 'driver-feed' : 'market')} className="mr-3 bg-slate-100 p-2 rounded-xl active:bg-slate-200 transition-colors">
            <ChevronLeft size={24} className="text-black" />
          </button>
          <h1 className="font-bold text-xl text-black">{newAd.category === 'taxi' ? 'Taxi Xizmati' : 'Narsa sotish'}</h1>
        </div>
        <div className="p-6 flex-1 overflow-y-auto safe-bottom">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-900 mb-3 ml-1 flex justify-between items-center">
                {newAd.category === 'taxi' ? 'Mashina Rasmi (Ixtiyoriy)' : 'Rasmlar'}
                <span className="text-slate-400 text-xs font-normal">{newAd.images.length} ta yuklandi</span>
              </label>
              {newAd.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-2">
                  {newAd.images.map((img, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                      <img src={img} className="w-full h-full object-cover" alt={`preview ${idx}`} />
                      <button type="button" onClick={() => setNewAd(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 shadow-md active:scale-90 transition-all backdrop-blur-sm"><X size={12} strokeWidth={3} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex flex-col items-center justify-center h-32 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 hover:bg-blue-100 active:bg-blue-100 cursor-pointer transition-colors group">
                    <div className="bg-white p-3 rounded-full mb-2 shadow-sm group-hover:scale-110 transition-transform"><ImageIcon size={24} className="text-blue-600" /></div>
                    <span className="text-xs font-bold text-blue-700">Galereya</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                </label>
                <label className="relative flex flex-col items-center justify-center h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-slate-100 active:bg-slate-100 cursor-pointer transition-colors group">
                    <div className="bg-white p-3 rounded-full mb-2 shadow-sm group-hover:scale-110 transition-transform"><Camera size={24} className="text-slate-600" /></div>
                    <span className="text-xs font-bold text-slate-700">Kamera</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
                </label>
              </div>
            </div>
            <div className="space-y-5">
              {newAd.category !== 'taxi' && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">Bo'limni tanlang</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'taxi').map(c => (
                      <button key={c.id} type="button" onClick={() => setNewAd({...newAd, category: c.id})} className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center px-1 transition-all duration-200 ${newAd.category === c.id ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-md ring-2 ring-blue-100 ring-offset-1' : 'bg-white border-slate-100 shadow-sm text-slate-500 hover:border-slate-300'}`}>
                        <span className="text-2xl mb-1">{c.icon}</span>
                        <span className="font-bold text-xs">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">{newAd.category === 'taxi' ? 'Yo\'nalish (Qayerdan - Qayerga)' : 'Nima sotyapsiz?'}</label>
                {newAd.category === 'taxi' && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Poshxurt ↔️ Termiz', 'Poshxurt ↔️ Sherobod', 'Poshxurt ↔️ Angor', 'Qishloq ichida', 'Termiz ↔️ Poshxurt'].map(tag => (
                      <button key={tag} type="button" onClick={() => setNewAd({...newAd, title: tag})} className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm">{tag}</button>
                    ))}
                  </div>
                )}
                <input type="text" value={newAd.title} onChange={e => setNewAd({...newAd, title: e.target.value})} placeholder={newAd.category === 'taxi' ? "Masalan: Poshxurt - Termiz" : "Masalan: 1 qop un"} className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none shadow-sm transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">{newAd.category === 'taxi' ? 'Yo\'l kira (so\'mda - 1 kishi uchun)' : 'Narxi qancha? (So\'m)'}</label>
                <input type="number" value={newAd.price} onChange={e => setNewAd({...newAd, price: e.target.value})} placeholder={newAd.category === 'taxi' ? "Masalan: 50000" : "Narxni yozing"} className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none shadow-sm transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">{newAd.category === 'taxi' ? 'Hozir qayerdasiz?' : 'Manzil (Qayerdasiz?)'}</label>
                <input type="text" value={newAd.location} onChange={e => setNewAd({...newAd, location: e.target.value})} placeholder="Masalan: Poshxurt markazi" className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none shadow-sm transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2 ml-1">{newAd.category === 'taxi' ? 'Qo\'shimcha ma\'lumot (Soat nechida? Moshina?)' : 'Batafsil ma\'lumot'}</label>
                <textarea rows={3} value={newAd.description} onChange={e => setNewAd({...newAd, description: e.target.value})} placeholder={newAd.category === 'taxi' ? "Soat 07:00 da chiqaman. Moshina Cobalt. Yukxona bo'sh." : "Mahsulot haqida to'liqroq yozing..."} className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none resize-none shadow-sm transition-all" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black shadow-xl active:scale-95 transition-all mb-4">
              {isLoading ? 'Joylanmoqda...' : (newAd.category === 'taxi' ? 'TAXI E\'LONINI JOYLASHTIRISH' : 'E\'LONNI JOYLASH')}
            </button>
          </form>
        </div>
      </div>
      <div className="hidden md:block"><BottomNav view={view} setView={setView} onSellClick={onSellClick} /></div>
    </div>
  );
};
