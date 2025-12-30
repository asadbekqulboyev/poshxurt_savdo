import React, { useState } from 'react';
import { User, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/supabaseService';
import { User as UserType } from '../types';
interface LandingScreenProps {
  onLoginSuccess: (user: UserType) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onLoginSuccess, showToast }) => {
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = rawValue.replace(/[^a-zA-Z\u0400-\u04FF\u02BB\u02BC\s\'\`]/g, '');
    setLoginName(sanitizedValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 9) return;
    let formattedValue = rawValue;
    if (rawValue.length > 2) formattedValue = rawValue.slice(0, 2) + ' ' + rawValue.slice(2);
    if (rawValue.length > 5) formattedValue = rawValue.slice(0, 2) + ' ' + rawValue.slice(2, 5) + ' ' + rawValue.slice(5);
    if (rawValue.length > 7) formattedValue = rawValue.slice(0, 2) + ' ' + rawValue.slice(2, 5) + ' ' + rawValue.slice(5, 7) + ' ' + rawValue.slice(7);
    setLoginPhone(formattedValue);
    if (phoneError) setPhoneError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    if (!loginName.trim()) return;
    const rawPhone = loginPhone.replace(/\s/g, '');
    if (rawPhone.length !== 9) {
      setPhoneError("Telefon raqamingizni to'liq yozing (9 ta raqam)");
      return;
    }
    setIsLoading(true);
    try {
      const fullPhone = `+998${rawPhone}`;
      const u = await authService.login(loginName.trim(), fullPhone);
      onLoginSuccess(u);
      showToast(`Xush kelibsiz, ${u.name}!`, 'success');
    } catch (e) {
        showToast("Kirishda xatolik yuz berdi", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-20%] w-[400px] h-[400px] bg-sky-100 rounded-full blur-3xl -z-10 opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-blue-100 rounded-full blur-3xl -z-10 opacity-70"></div>

      <div className="w-full max-w-sm mx-auto relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center mb-4 shadow-sm border border-sky-100">
            <ShoppingBag size={36} className="text-blue-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight mb-1">Xush kelibsiz!</h1>
          <p className="text-slate-400 font-medium text-center text-sm">Poshxurt bozoriga kirish</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-4">Ismingiz</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <User size={20} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                value={loginName}
                onChange={handleNameChange}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-800 placeholder-slate-300 text-base shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                placeholder="Ismingizni yozing"
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-4">Telefon raqam</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none group-focus-within:text-blue-600 transition-colors pb-0.5">+998</span>
              <input 
                type="tel" 
                value={loginPhone}
                onChange={handlePhoneChange}
                className={`w-full pl-16 pr-4 py-3.5 rounded-2xl bg-slate-50 border focus:bg-white focus:ring-4 outline-none transition-all font-bold text-lg tracking-wide placeholder-slate-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${phoneError ? 'border-red-200 focus:border-red-300 focus:ring-red-50 text-red-600' : 'border-transparent focus:border-blue-300 focus:ring-blue-50 text-slate-800'}`}
                placeholder="90 123 45 67"
                inputMode="numeric"
                maxLength={12} 
              />
              {loginPhone.replace(/\s/g, '').length === 9 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-in zoom-in duration-300">
                    <CheckCircle2 size={20} strokeWidth={3} />
                </div>
              )}
            </div>
            {phoneError && <p className="text-red-500 text-xs font-bold ml-4 animate-pulse">{phoneError}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full group bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200/50 active:scale-[0.98] transition-all flex items-center justify-center mt-6"
          >
            {isLoading ? 'Kirilmoqda...' : (
                <>Boshlash <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} /></>
            )}
          </button>
        </form>
        
        <div className="absolute bottom-[-80px] left-0 w-full flex items-center justify-center">
          <p className="text-slate-300 text-[10px]">Poshxurt 2024</p>
        </div>
      </div>
    </div>
  );
};
