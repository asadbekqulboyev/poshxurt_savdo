import { useState, useEffect } from 'react';
import { User, Product, ViewState } from './types';
import { authService } from './services/supabaseService';
import { Toast } from './components/Toast';
import { HomeScreen } from './screens/HomeScreen';
import { MarketScreen } from './screens/MarketScreen';
import { TaxiChoiceScreen, PassengerRequestScreen, DriverFeedScreen } from './screens/TaxiScreens';
import { CreateAdScreen } from './screens/CreateAdScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ShoppingBag } from 'lucide-react';

declare global {
  interface Window {
    Telegram: any;
  }
}

type AuthStatus = 'loading' | 'authed' | 'no-telegram';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [view, setView] = useState<ViewState>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createAdCategory, setCreateAdCategory] = useState<string>('others');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

  // --- TELEGRAM WEB APP INIT ---
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      try { tg.expand(); } catch (e) {}
      if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
        try { tg.setHeaderColor('#2563eb'); tg.setBackgroundColor('#f8fafc'); } catch (e) {}
      }
    }
  }, []);

  // --- TELEGRAM ID ORQALI AVTOMATIK KIRISH (cache-first) ---
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const tg = window.Telegram?.WebApp;
    try { tg?.ready(); } catch (e) {}

    // 1) DARHOL: oldin kirgan bo'lsa, cache'dan tezkor kiritamiz (kutmasdan)
    const cached = authService.getCurrentUser();
    if (cached) {
      setUser(cached);
      setAuthStatus('authed');
    }

    // 2) FONDA: Telegram'dan yangi ma'lumotni olib, cache'ni yangilaymiz
    const resolveTelegram = async () => {
      // initData ba'zan kech keladi — 12 marta (~6 soniya) urinib ko'ramiz
      for (let attempt = 0; attempt < 12; attempt++) {
        if (cancelled) return;
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (tgUser?.id) {
          const found = await authService.getUserByTelegramId(tgUser.id);
          if (cancelled) return;
          if (found) {
            setUser(found);
            setAuthStatus('authed');
          } else if (!cached) {
            setDebugInfo(`Telegram ID: ${tgUser.id} — bazada topilmadi. Botda /start bosing.`);
            setAuthStatus('no-telegram');
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // Telegram ma'lumoti umuman kelmadi
      if (cancelled) return;
      if (!cached) {
        const t = window.Telegram?.WebApp;
        setDebugInfo(`initData uzunligi: ${t?.initData?.length ?? 0}, platforma: ${t?.platform ?? 'yoq'}`);
        setAuthStatus('no-telegram');
      }
      // cached bo'lsa — allaqachon ichkaridamiz, hech narsa qilmaymiz
    };

    resolveTelegram();
    return () => { cancelled = true; };
  }, []);

  // --- BACK BUTTON ---
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const handleBack = () => {
      if (view === 'product-detail') setView('market');
      else if (view === 'create') setView(createAdCategory === 'taxi' ? 'driver-feed' : 'market');
      else if (view === 'passenger-request') setView('taxi-choice');
      else if (view === 'driver-feed') setView('taxi-choice');
      else if (view === 'taxi-choice') setView('home');
      else if (view === 'market') setView('home');
      else if (view === 'profile') setView('home');
    };

    if (view !== 'home') {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    } else {
      tg.BackButton.hide();
    }
    return () => { tg.BackButton.offClick(handleBack); };
  }, [view, createAdCategory]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthStatus('no-telegram');
    setView('home');
  };

  const handleSellClick = () => {
    setCreateAdCategory('others');
    setView('create');
  };

  const handleTaxiAdCreate = () => {
    setCreateAdCategory('taxi');
    setView('create');
  };

  // --- YUKLANMOQDA ---
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-sm">Yuklanmoqda...</p>
      </div>
    );
  }

  // --- TELEGRAM/BOT ORQALI KIRISH KERAK ---
  if (authStatus === 'no-telegram' || !user) {
    const tg = window.Telegram?.WebApp;
    const insideTelegram = !!tg && (tg.platform ?? 'unknown') !== 'unknown';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
          <ShoppingBag size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Poshxurt Bozor</h1>

        {insideTelegram ? (
          <>
            <p className="text-slate-500 font-medium mb-6 max-w-xs leading-relaxed">
              Ma'lumotlaringizni o'qib bo'lmadi. Iltimos, ilovani <b>pastdagi menyu tugmasi</b> orqali oching
              yoki Telegramni telefoningizda ishlatib ko'ring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all mb-3"
            >
              Qayta urinish
            </button>
            <a
              href="https://t.me/poshxurt_savdo_bot?startapp=open"
              className="text-blue-600 font-bold text-sm hover:underline"
            >
              Botni qayta ochish
            </a>
          </>
        ) : (
          <>
            <p className="text-slate-500 font-medium mb-6 max-w-xs leading-relaxed">
              Ilovaga kirish uchun Telegram botimizni oching va <b>"Boshlash"</b> tugmasini bosing.
            </p>
            <a
              href="https://t.me/poshxurt_savdo_bot"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              Botni ochish
            </a>
          </>
        )}

        {debugInfo && (
          <p className="mt-6 text-[11px] text-slate-400 font-mono max-w-xs break-words">{debugInfo}</p>
        )}
      </div>
    );
  }

  // --- ASOSIY ILOVA ---
  return (
    <>
      <Toast message={toast?.message || ''} type={toast?.type || 'success'} isVisible={!!toast?.isVisible} />

      {view === 'home' && (
        <HomeScreen user={user} setView={setView} />
      )}

      {view === 'market' && (
        <MarketScreen view={view} setView={setView} user={user} onProductClick={(p) => { setSelectedProduct(p); setView('product-detail'); }} onSellClick={handleSellClick} showToast={showToast} />
      )}

      {view === 'taxi-choice' && (
        <TaxiChoiceScreen view={view} setView={setView} onSellClick={handleSellClick} />
      )}

      {view === 'passenger-request' && (
        <PassengerRequestScreen view={view} setView={setView} user={user} showToast={showToast} onSellClick={handleSellClick} />
      )}

      {view === 'driver-feed' && (
        <DriverFeedScreen view={view} setView={setView} onSellClick={handleSellClick} onTaxiAdCreate={handleTaxiAdCreate} />
      )}

      {view === 'create' && (
        <CreateAdScreen view={view} setView={setView} user={user} initialCategory={createAdCategory} showToast={showToast} onSellClick={handleSellClick} />
      )}

      {view === 'product-detail' && selectedProduct && (
        <ProductDetailScreen product={selectedProduct} view={view} setView={setView} onSellClick={handleSellClick} />
      )}

      {view === 'profile' && (
        <ProfileScreen user={user} view={view} setView={setView} onLogout={handleLogout} showToast={showToast} onSellClick={handleSellClick} />
      )}
    </>
  );
}
