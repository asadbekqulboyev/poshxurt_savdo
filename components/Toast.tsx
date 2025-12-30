import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in slide-in-from-top-5 ${
      type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
    }`}>
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-500 text-white' : 'bg-white text-red-500'}`}>
          {type === 'success' ? <Check size={16} strokeWidth={4} /> : <AlertCircle size={16} strokeWidth={3} />}
        </div>
        <span className="font-bold text-sm md:text-base">{message}</span>
    </div>
  );
};
