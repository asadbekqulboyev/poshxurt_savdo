import React, { useState, useEffect } from 'react';
import { TruckIcon, ChevronLeft, Navigation, ChevronRight, MapPin, Bell, Clock, Phone } from 'lucide-react';
import { ViewState, PassengerRequest, User } from '../types';
import { BottomNav } from '../components/BottomNav';
import { MapPicker } from '../components/MapPicker';
import { productService } from '../services/supabaseService';
import { mapsLink } from '../services/location';


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
    const [destination, setDestination] = useState('');
    const [price, setPrice] = useState('');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords) {
            showToast("Xaritada turgan joyingizni belgilang", 'error');
            return;
        }
        setIsLoading(true);
        try {
            await productService.createPassengerRequest({
                from: '📍 Joylashuv (xaritada)',
                to: destination.trim() || 'Belgilanmagan',
                price,
                fromLat: coords.lat,
                fromLng: coords.lng,
            });
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
            setView('market');
            showToast("Taksi chaqirildi! Haydovchilar ko'radi ✅", 'success');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
            <div className="w-full max-w-lg mx-auto flex flex-col">
                <div className="bg-white px-4 py-4 flex items-center shadow-sm sticky top-0 z-20 border-b border-slate-100">
                    <button onClick={() => setView('taxi-choice')} className="mr-3 bg-slate-100 p-2 rounded-xl active:bg-slate-200 transition-colors">
                        <ChevronLeft size={24} className="text-slate-800" />
                    </button>
                    <h1 className="font-black text-xl text-slate-900">Taksi chaqirish</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* 1. XARITA (Yandex uslubi: markaz = turgan joy) */}
                    <MapPicker onChange={setCoords} />

                    {/* 2. Qayerga */}
                    <div>
                        <label className="block text-base font-bold text-slate-900 mb-2">🎯 Qayerga borasiz?</label>
                        <input
                            type="text"
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="Masalan: Termiz, bozor"
                            className="w-full px-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none text-lg transition-all"
                        />
                    </div>

                    {/* 3. Narx (ixtiyoriy) */}
                    <div className="relative">
                        <input type="number" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value)} placeholder="Narx taklifi (ixtiyoriy)" className="w-full px-4 py-4 pr-16 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none text-lg font-bold transition-all" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">so'm</span>
                    </div>

                    {/* Telefon avtomatik */}
                    <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <span className="text-lg">📞</span>
                        <p className="text-sm text-slate-600 font-medium">Raqamingiz: <b>{user.phone}</b></p>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-60">
                        {isLoading ? 'Yuborilmoqda...' : '🚕 TAKSI CHAQIRISH'}
                    </button>
                </form>
            </div>
            <BottomNav view={view} setView={setView} onSellClick={onSellClick} />
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
        <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
            <div className="max-w-2xl mx-auto w-full">
                <div className="bg-yellow-400 px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                    <div className="flex items-center">
                        <button onClick={() => setView('taxi-choice')} className="mr-3 bg-black/10 p-2 rounded-xl active:bg-black/20 text-black transition-colors"><ChevronLeft size={24} /></button>
                        <h1 className="font-black text-xl text-black">Buyurtmalar</h1>
                    </div>
                    <button onClick={onTaxiAdCreate} className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all">+ E'lon</button>
                </div>
                <div className="p-4 space-y-4">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm p-10">
                            <div className="bg-slate-50 p-4 rounded-full mb-4"><Bell size={40} className="text-slate-300" /></div>
                            <p className="font-bold text-lg">Hozircha buyurtma yo'q</p>
                            <p className="text-sm text-slate-400 mt-1">Yangi so'rovlar shu yerda ko'rinadi</p>
                        </div>
                    ) : (
                        requests.map(req => (
                            <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                    <div className="flex items-center text-red-500 bg-red-50 px-3 py-1.5 rounded-lg"><Bell size={14} className="fill-red-500 mr-1.5" /><span className="text-xs font-bold">Yangi</span></div>
                                    <div className="flex items-center text-slate-400 text-sm font-medium"><Clock size={14} className="mr-1" />{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>

                                {/* Yo'lovchi xabari */}
                                {req.to && req.to !== '—' && (
                                    <div className="flex items-start gap-2 mb-4">
                                        <span className="text-xl flex-shrink-0">💬</span>
                                        <p className="text-slate-900 font-bold text-lg leading-snug">{req.to}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-100">
                                    <span className="text-slate-500 text-sm font-bold">Narx:</span>
                                    <span className="text-blue-600 font-black text-xl">{req.price ? new Intl.NumberFormat('uz-UZ').format(Number(req.price)) + " so'm" : "Kelishilgan"}</span>
                                </div>
                                {req.fromLat && req.fromLng && (
                                    <a href={mapsLink(req.fromLat, req.fromLng)} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-50 text-blue-700 py-4 rounded-2xl font-bold text-base flex items-center justify-center mb-2 active:scale-[0.98] transition-all border-2 border-blue-200">
                                        <MapPin size={20} className="mr-2" />📍 Yo'lovchi joylashuvi (xaritada)
                                    </a>
                                )}
                                <a href={`tel:${req.phone.replace(/\s/g, '')}`} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center active:scale-[0.98] transition-all shadow-lg shadow-green-200">
                                    <Phone size={22} className="mr-2 fill-white" />Qo'ng'iroq qilish
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <BottomNav view={view} setView={setView} onSellClick={onSellClick} />
        </div>
    );
};
