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

  // --- TELEGRAM ID ORQALI AVTOMATIK KIRISH ---
  useEffect(() => {
    const init = async () => {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;

      if (!tgUser?.id) {
        // Brauzerda yoki botsiz ochilgan — avval lokal sessiyaga qaraymiz
        const cached = authService.getCurrentUser();
        if (cached) {
          setUser(cached);
          setAuthStatus('authed');
        } else {
          setAuthStatus('no-telegram');
        }
        return;
      }

      // Telegram'dan kelgan id bo'yicha bazadan foydalanuvchini topamiz
      const found = await authService.getUserByTelegramId(tgUser.id);
      if (found) {
        setUser(found);
        setAuthStatus('authed');
      } else {
        // Bazada yo'q — demak botda /start bosib raqam ulashilmagan
        setAuthStatus('no-telegram');
      }
    };
    init();
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
          <ShoppingBag size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Poshxurt Bozor</h1>
        <p className="text-slate-500 font-medium mb-6 max-w-xs leading-relaxed">
          Ilovaga kirish uchun Telegram botimizni oching va <b>"Boshlash"</b> tugmasini bosing.
        </p>
        <a
          href="https://t.me/poshxurt_bot"
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          Botni ochish
        </a>
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
        <MarketScreen view={view} setView={setView} onProductClick={(p) => { setSelectedProduct(p); setView('product-detail'); }} onSellClick={handleSellClick} />
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
