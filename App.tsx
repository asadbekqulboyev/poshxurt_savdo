import React, { useState, useEffect } from 'react';
import { User, Product, ViewState } from './types';
import { authService } from './services/supabaseService';
import { Toast } from './components/Toast';
import { LandingScreen } from './screens/LandingScreen';
import { MarketScreen } from './screens/MarketScreen';
import { TaxiChoiceScreen, PassengerRequestScreen, DriverFeedScreen } from './screens/TaxiScreens';
import { CreateAdScreen } from './screens/CreateAdScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('landing'); 
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createAdCategory, setCreateAdCategory] = useState<string>('others');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean } | null>(null);

  // --- TELEGRAM WEB APP INIT & BACK BUTTON ---
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        try { tg.expand(); } catch (e) {}
        if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
            try { tg.setHeaderColor('#ffffff'); tg.setBackgroundColor('#f8fafc'); } catch (e) {}
        }
    }
  }, []);

  // Handle Back Button Logic
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleBack = () => {
        if (view === 'product-detail') setView('market');
        else if (view === 'create') setView(createAdCategory === 'taxi' ? 'driver-feed' : 'market');
        else if (view === 'passenger-request') setView('taxi-choice');
        else if (view === 'driver-feed') setView('taxi-choice');
        else if (view === 'taxi-choice') setView('market');
        else if (view === 'profile') setView('market');
    };

    if (view !== 'market' && view !== 'landing') {
        tg.BackButton.show();
        tg.BackButton.onClick(handleBack);
    } else {
        tg.BackButton.hide();
    }
    return () => { tg.BackButton.offClick(handleBack); };
  }, [view, createAdCategory]);

  // Auth Check
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('market');
    } else {
      setView('landing');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => prev ? { ...prev, isVisible: false } : null), 3000);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView('landing');
  };

  const handleSellClick = () => {
      setCreateAdCategory('others');
      setView('create');
  };

  const handleTaxiAdCreate = () => {
      setCreateAdCategory('taxi');
      setView('create');
  };

  // Render Logic
  if (!user || view === 'landing') {
      return (
        <>
            <Toast message={toast?.message || ''} type={toast?.type || 'success'} isVisible={!!toast?.isVisible} />
            <LandingScreen onLoginSuccess={(u) => { setUser(u); setView('market'); }} showToast={showToast} />
        </>
      );
  }

  return (
    <>
      <Toast message={toast?.message || ''} type={toast?.type || 'success'} isVisible={!!toast?.isVisible} />
      
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