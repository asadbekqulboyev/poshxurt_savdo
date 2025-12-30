import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { Product, ViewState } from '../types';
import { productService } from '../services/supabaseService';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { BottomNav } from '../components/BottomNav';

interface MarketScreenProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  onProductClick: (p: Product) => void;
  onSellClick: () => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({ view, setView, onProductClick, onSellClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [categoryUsage, setCategoryUsage] = useState<{[key: string]: number}>({});

  useEffect(() => {
    productService.getProducts().then(setProducts);
    const storedUsage = localStorage.getItem('poshxurt_category_usage');
    if (storedUsage) setCategoryUsage(JSON.parse(storedUsage));
  }, []);

  const sortedCategories = useMemo(() => {
    return [...CATEGORIES].sort((a, b) => {
      if (a.id === 'all') return -1;
      if (b.id === 'all') return 1;
      const usageA = categoryUsage[a.id] || 0;
      const usageB = categoryUsage[b.id] || 0;
      return usageB - usageA;
    });
  }, [categoryUsage]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const newUsage = { ...categoryUsage, [categoryId]: (categoryUsage[categoryId] || 0) + 1 };
    setCategoryUsage(newUsage);
    localStorage.setItem('poshxurt_category_usage', JSON.stringify(newUsage));
  };

  const filteredProducts = products.filter(p => 
    activeCategory === 'all' ? true : p.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 sticky top-0 z-30 pt-3 pb-3 px-0 shadow-lg shadow-blue-900/10 rounded-b-[16px] md:rounded-none">
        <div className="max-w-xxl mx-auto w-full">
          <div className="flex items-center justify-between mb-4 px-4">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide drop-shadow-sm flex items-center gap-2">
                  <ShoppingBag size={24} strokeWidth={2.5} /> POSHXURT BOZOR
              </h1>
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm active:bg-white/30 transition-colors cursor-pointer hover:bg-white/30">
                  <Search size={22} className="text-white" />
              </div>
          </div>
          <div className="relative w-full overflow-hidden pb-1">
              <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-blue-600 to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-blue-600 to-transparent pointer-events-none"></div>
              <div className="flex w-max animate-scroll gap-3 hover:pause active:pause" style={{ '--animation-duration': '35s' } as React.CSSProperties}>
              {sortedCategories.map(cat => (
                  <button key={cat.id} onClick={() => handleCategoryClick(cat.id)} className={`flex items-center px-5 py-2.5 rounded-full whitespace-nowrap transition-all border shadow-sm flex-shrink-0 cursor-pointer ${activeCategory === cat.id ? 'bg-blue-800 border-blue-400 text-white shadow-md font-bold scale-105' : 'bg-white/95 border-transparent text-slate-700 font-medium hover:bg-white hover:opacity-0.4 hover:scale-90'}`}>
                  <span className="text-xl mr-2">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                  </button>
              ))}
              {sortedCategories.map(cat => (
                  <button key={`${cat.id}-dup`} onClick={() => handleCategoryClick(cat.id)} className={`flex items-center px-5 py-2.5 rounded-full whitespace-nowrap transition-all border shadow-sm flex-shrink-0 cursor-pointer ${activeCategory === cat.id ? 'bg-blue-800 border-blue-400 text-white shadow-md font-bold scale-105' : 'bg-white/95 border-transparent text-slate-700 font-medium hover:bg-white hover:scale-105'}`}>
                  <span className="text-xl mr-2">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                  </button>
              ))}
              </div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-4 max-w-7xl mx-auto w-full">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <span className="text-6xl mb-4 grayscale opacity-50">📦</span>
              <p className="text-slate-500 font-bold text-lg">Hozircha e'lonlar yo'q</p>
              <button onClick={onSellClick} className="mt-4 text-blue-600 font-bold hover:underline">Birinchi bo'lib e'lon bering</button>
          </div>
        )}
      </div>
      <BottomNav view={view} setView={setView} onSellClick={onSellClick} />
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll var(--animation-duration) linear infinite; }
        .hover\:pause:hover, .active\:pause:active { animation-play-state: paused; }
      `}</style>
    </div>
  );
};
