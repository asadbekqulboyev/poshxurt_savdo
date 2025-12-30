import React, { useState, useEffect } from 'react';
import { LogOut, Share2, TruckIcon } from 'lucide-react';
import { User, ViewState, Product } from '../types';
import { BottomNav } from '../components/BottomNav';
import { authService, productService } from '../services/supabaseService';


interface ProfileScreenProps {
  user: User;
  view: ViewState;
  setView: (v: ViewState) => void;
  onLogout: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onSellClick: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, view, setView, onLogout, showToast, onSellClick }) => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    productService.getProducts().then(all => {
        setMyProducts(all.filter(p => p.sellerId === user.id));
    });
  }, [user.id]);

  const handleShareReferral = async () => {
    const shareData = {
        title: 'Poshxurt Bozor',
        text: `Assalomu alaykum! Poshxurtliklar uchun yangi bozor va taksi ilovasi. Kiring va ko'ring!`,
        url: currentUser.referralLink || 'https://t.me/poshxurt_bot'
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            const updated = await authService.incrementReferral(currentUser.id);
            if (updated) setCurrentUser(updated);
        } else {
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            showToast("Havola nusxalandi! Telegramda ulashing.", 'success');
        }
    } catch (error) { console.log('Share dismissed', error); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto md:mt-10 md:mb-20">
        <div className="bg-gradient-to-b from-blue-600 to-blue-500 pt-6 pb-10 px-6 rounded-b-[2rem] shadow-lg shadow-blue-900/10 md:rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-white font-bold text-xl">Mening Sahifam</h1>
            <button onClick={onLogout} className="bg-white/20 p-2.5 rounded-xl text-white backdrop-blur-md hover:bg-white/30 transition-colors"><LogOut size={20} /></button>
          </div>
          <div className="flex items-center bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-lg">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold border-2 border-blue-100 shadow-sm">{currentUser.name.charAt(0)}</div>
            <div className="ml-4 text-white">
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <p className="text-blue-100 font-mono text-base tracking-wide opacity-90">{currentUser.phone}</p>
            </div>
          </div>
        </div>
        <div className="px-4 -mt-6 space-y-4 md:mt-4">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Premium Holati</h3>
              {currentUser.isPremium ? <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-[10px] border border-blue-200 tracking-wide">✅ YOQILGAN</span> : <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold text-[10px] tracking-wide">❌ O'CHIQ</span>}
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                <div className="flex justify-between font-bold mb-2 text-xs">
                <span className="text-blue-700">{currentUser.referralCount} ta odam qo'shildi</span>
                <span className="text-slate-400">3 ta kerak</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((currentUser.referralCount / 3) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">Yana {Math.max(0, 3 - currentUser.referralCount)} ta do'stingizni taklif qiling va <b>1 hafta tekin Premium</b> oling!</p>
            </div>
            <button onClick={handleShareReferral} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-base hover:bg-black shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"><Share2 size={20} /> DO'STLARGA YUBORISH</button>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-900 mb-4">Mening e'lonlarim</h3>
            {myProducts.length > 0 ? (
              <div className="space-y-3">
                {myProducts.map(p => (
                    <div key={p.id} className="flex bg-white border border-slate-100 rounded-xl p-2 gap-3 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    {p.images[0] === 'default-taxi' ? <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center"><TruckIcon size={24} className="text-slate-400" /></div> : <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />}
                    <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-base text-slate-900 truncate mb-0.5">{p.title}</h4>
                        <p className="text-blue-600 font-bold text-base">{new Intl.NumberFormat('uz-UZ').format(p.price)}</p>
                    </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold mb-3 text-sm">Sizda hali e'lonlar yo'q</p>
                <button onClick={onSellClick} className="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold border border-blue-100 shadow-sm hover:shadow-md transition-all text-sm">E'lon berish</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:block"><BottomNav view={view} setView={setView} onSellClick={onSellClick} /></div>
    </div>
  );
};
