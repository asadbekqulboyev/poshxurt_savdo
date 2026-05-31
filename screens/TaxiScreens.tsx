import React, { useState, useEffect } from 'react';
import { TruckIcon, ChevronLeft, Navigation, ChevronRight, Megaphone, MapPin, ArrowRight, Bell, Clock, Phone } from 'lucide-react';
import { ViewState, PassengerRequest, User } from '../types';
import { BottomNav } from '../components/BottomNav';
import { productService } from '../services/supabaseService';


// --- Taxi Choice Screen ---
export const TaxiChoiceScreen = ({ view, setView, onSellClick }: { view: ViewState, setView: (v: ViewState) => void, onSellClick: () => void }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col relative pb-24 md:justify-center">
    <div className="w-full max-w-4xl mx-auto md:bg-white md:rounded-[3rem] md:shadow-2xl md:overflow-hidden md:min-h-[600px] md:flex md:flex-row">
        <div className="bg-yellow-400 pt-6 pb-7 px-5 rounded-b-[2rem] md:rounded-none md:w-5/12 shadow-xl relative overflow-hidden md:flex md:flex-col md:justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50 -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <button onClick={() => setView('home')} className="bg-black/10 p-2 rounded-full text-black/70 active:bg-black/20 transition-colors mb-3 inline-flex">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <TruckIcon size={30} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-black tracking-tight leading-none">TAKSI</h1>
                        <p className="text-black/70 font-medium text-sm mt-1">Qatnash uchun qulay xizmat</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex-1 px-4 py-6 flex flex-col gap-4 justify-center bg-white md:p-12">
            <button
                onClick={() => setView('passenger-request')}
                className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 active:scale-[0.98] transition-all flex items-center"
            >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-yellow-500 mr-4 flex-shrink-0">
                    <Navigation size={26} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <h2 className="text-lg font-black text-slate-800 mb-0.5">Yo'lovchiman 🙋</h2>
                    <p className="text-slate-500 text-sm leading-snug">Manzilni ayting, taksi chaqiring</p>
                </div>
                <ChevronRight className="text-slate-300 ml-2 flex-shrink-0" />
            </button>
            <button
                onClick={() => setView('driver-feed')}
                className="bg-slate-900 text-white rounded-3xl p-5 active:scale-[0.98] transition-all shadow-lg flex items-center"
            >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center relative mr-4 flex-shrink-0">
                    <TruckIcon size={26} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <h2 className="text-lg font-black text-white mb-0.5">Haydovchiman 🚖</h2>
                    <p className="text-slate-400 text-sm leading-snug">Buyurtmalarni ko'rish</p>
                </div>
                <ChevronRight className="text-slate-600 ml-2 flex-shrink-0" />
            </button>
        </div>
    </div>
    <BottomNav view={view} setView={setView} onSellClick={onSellClick} />
  </div>
);

// --- Passenger Request Screen ---
export const PassengerRequestScreen = ({ view, setView, user, showToast, onSellClick }: { view: ViewState, setView: (v: ViewState) => void, user: User, showToast: any, onSellClick: () => void }) => {
    const [req, setReq] = useState({ from: '', to: '', price: '', phone: user.phone });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await productService.createPassengerRequest(req);
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
            setView('market');
            showToast("So'rov haydovchilarga yuborildi! ✅", 'success');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 md:justify-center">
            <div className="w-full max-w-lg mx-auto bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden md:border border-slate-100 h-full md:h-auto flex flex-col">
                <div className="bg-white px-5 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-slate-50">
                    <button onClick={() => setView('taxi-choice')} className="mr-3 bg-slate-100 p-2 rounded-xl active:bg-slate-200 transition-colors">
                        <ChevronLeft size={24} className="text-black" />
                    </button>
                    <h1 className="font-bold text-xl text-black">Taxi chaqirish</h1>
                </div>
                <div className="p-6 flex-1 overflow-y-auto safe-bottom">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start">
                        <Megaphone className="text-yellow-600 mr-3 flex-shrink-0 mt-1" size={20} />
                        <p className="text-yellow-800 text-sm font-medium leading-relaxed">Ushbu so'rov barcha taxi haydovchilariga <b>bildirishnoma</b> sifatida yuboriladi.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Qayerdan</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-blue-500 bg-blue-50 p-1 rounded-lg"><MapPin size={18} /></div>
                                    <input type="text" value={req.from} onChange={e => setReq({...req, from: e.target.value})} placeholder="Masalan: Poshxurt Markaz" className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all shadow-sm" required />
                                </div>
                            </div>
                            <div className="flex justify-center -my-3 relative z-10">
                                <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-sm"><ArrowRight className="text-slate-300 rotate-90" size={16} /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Qayerga</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-green-500 bg-green-50 p-1 rounded-lg"><Navigation size={18} /></div>
                                    <input type="text" value={req.to} onChange={e => setReq({...req, to: e.target.value})} placeholder="Masalan: Termiz" className="w-full pl-14 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all shadow-sm" required />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Taklif narx (So'm) - <span className="text-slate-400 font-normal">Ixtiyoriy</span></label>
                                <input type="number" value={req.price} onChange={e => setReq({...req, price: e.target.value})} placeholder="Kelishilgan" className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Telefon raqam</label>
                                <input type="tel" value={req.phone} onChange={e => setReq({...req, phone: e.target.value})} className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all shadow-sm" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-300 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center">
                            {isLoading ? 'Yuborilmoqda...' : 'HAYDOVCHILARGA YUBORISH'}
                        </button>
                    </form>
                </div>
            </div>
            <div className="hidden md:block"><BottomNav view={view} setView={setView} onSellClick={onSellClick} /></div>
        </div>
    );
};

// --- Driver Feed Screen ---
export const DriverFeedScreen = ({ view, setView, onSellClick, onTaxiAdCreate }: { view: ViewState, setView: (v: ViewState) => void, onSellClick: () => void, onTaxiAdCreate: () => void }) => {
    const [requests, setRequests] = useState<PassengerRequest[]>([]);

    useEffect(() => {
        productService.getPassengerRequests().then(setRequests);
    }, []);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-0">
            <div className="max-w-2xl mx-auto w-full md:mt-6 md:mb-20">
                <div className="bg-yellow-400 px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-20 md:rounded-2xl md:mx-4">
                    <div className="flex items-center">
                        <button onClick={() => setView('taxi-choice')} className="mr-3 bg-white/20 p-2 rounded-xl active:bg-white/30 text-black hover:bg-white/40 transition-colors"><ChevronLeft size={24} /></button>
                        <h1 className="font-black text-xl text-black">Buyurtmalar</h1>
                    </div>
                    <button onClick={onTaxiAdCreate} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all">E'lon berish</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto safe-bottom space-y-4">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm mx-auto p-10">
                            <div className="bg-slate-50 p-4 rounded-full mb-4"><Bell size={40} className="text-slate-300" /></div>
                            <p className="font-bold text-lg">Hozircha buyurtmalar yo'q</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-200 relative overflow-hidden animate-in slide-in-from-bottom-2 duration-300 group">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
                                    <div className="flex items-center text-red-500 bg-red-50 px-2.5 py-1 rounded-lg"><Bell size={14} className="fill-red-500 mr-2 animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-wide">Yangi Buyurtma</span></div>
                                    <div className="flex items-center text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-lg"><Clock size={12} className="mr-1" />{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                                <div className="grid grid-cols-[auto_1fr] gap-4 mb-5 px-1">
                                    <div className="flex flex-col items-center justify-center space-y-1 pt-1.5">
                                        <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                        <div className="w-0.5 h-10 bg-slate-200 border-l-2 border-dashed border-slate-300"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Qayerdan</p><p className="text-slate-900 font-bold text-lg leading-tight">{req.from}</p></div>
                                        <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Qayerga</p><p className="text-slate-900 font-bold text-lg leading-tight">{req.to}</p></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                                    <span className="text-slate-500 text-xs font-bold">Narx taklifi:</span>
                                    <span className="text-blue-600 font-black text-xl">{req.price ? new Intl.NumberFormat('uz-UZ').format(Number(req.price)) + " so'm" : "Kelishilgan"}</span>
                                </div>
                                <a href={`tel:${req.phone.replace(/\s/g, '')}`} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-green-600 active:scale-[0.98] transition-all shadow-lg shadow-green-200 group-hover:translate-y-[-2px]">
                                    <Phone size={20} className="mr-2 fill-white" />Qabul Qilish
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="hidden md:block"><BottomNav view={view} setView={setView} onSellClick={onSellClick} /></div>
        </div>
    );
};
