import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingBag, Search, Trash2, X, Loader2, CheckSquare, Square } from 'lucide-react';
import { Product, ViewState, User } from '../types';
import { productService, PAGE_SIZE } from '../services/supabaseService';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { BottomNav } from '../components/BottomNav';

interface MarketScreenProps {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: User;
  onProductClick: (p: Product) => void;
  onSellClick: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const MarketScreen: React.FC<MarketScreenProps> = ({ view, setView, user, onProductClick, onSellClick, showToast }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Admin tozalash rejimi
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Kategoriya yoki ilk yuklash o'zgarganda qaytadan yuklaymiz
  const loadFirst = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const data = await productService.getProducts(0, category);
      setProducts(data);
      setPage(0);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      showToast("E'lonlarni yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFirst(activeCategory);
  }, [activeCategory, loadFirst]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const data = await productService.getProducts(next, activeCategory);
      setProducts(prev => [...prev, ...data]);
      setPage(next);
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      showToast("Yuklashda xatolik", 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [products, search]);

  // 3 kundan eski e'lonlar (admin tozalash uchun)
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const oldProducts = useMemo(
    () => products.filter(p => Date.now() - p.createdAt > THREE_DAYS),
    [products]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllOld = () => {
    setSelectedIds(new Set(oldProducts.map(p => p.id)));
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredProducts.map(p => p.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const toDelete = products.filter(p => selectedIds.has(p.id));
    setDeleting(true);
    try {
      await productService.deleteProducts(toDelete);
      setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
      showToast(`${toDelete.length} ta e'lon o'chirildi`, 'success');
      clearSelection();
      setSelectMode(false);
    } catch (e) {
      showToast("O'chirishda xatolik", 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <div className="bg-gradient-to-b from-blue-600 to-blue-500 sticky top-0 z-30 pt-3 pb-3 shadow-lg shadow-blue-900/10 rounded-b-[16px] md:rounded-none">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4 px-4">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wide drop-shadow-sm flex items-center gap-2">
              <ShoppingBag size={24} strokeWidth={2.5} /> POSHXURT BOZOR
            </h1>
            <div className="flex items-center gap-2">
              {user.isAdmin && (
                <button
                  onClick={() => { setSelectMode(s => !s); clearSelection(); }}
                  className={`p-2.5 rounded-xl transition-colors ${selectMode ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  title="Tozalash rejimi"
                >
                  {selectMode ? <X size={22} /> : <Trash2 size={22} />}
                </button>
              )}
              <button
                onClick={() => setShowSearch(s => !s)}
                className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <Search size={22} className="text-white" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="px-4 mb-3">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Qidirish: mol, un, taksi..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/95 outline-none font-medium text-slate-800 placeholder-slate-400 shadow-sm"
              />
            </div>
          )}

          {/* Statik, siljimaydigan kategoriya tugmalari */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center px-4 py-2.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${activeCategory === cat.id ? 'bg-white text-blue-700 font-bold shadow-md' : 'bg-blue-500/40 text-white font-medium'}`}
              >
                <span className="text-lg mr-1.5">{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admin tozalash paneli */}
      {selectMode && user.isAdmin && (
        <div className="sticky top-[64px] z-20 bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
            <span className="text-red-700 font-bold text-sm mr-auto">
              {selectedIds.size} ta tanlandi
            </span>
            <button onClick={selectAllOld} className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
              3+ kunlik ({oldProducts.length})
            </button>
            <button onClick={selectAllVisible} className="text-xs font-bold bg-white text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
              Barchasi
            </button>
            {selectedIds.size > 0 && (
              <button onClick={clearSelection} className="text-xs font-bold text-slate-500 px-2 py-1.5">
                Bekor
              </button>
            )}
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0 || deleting}
              className="text-xs font-bold bg-red-500 text-white px-4 py-1.5 rounded-lg disabled:opacity-40 hover:bg-red-600 transition-colors flex items-center gap-1.5"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              O'chirish
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-4 max-w-7xl mx-auto w-full">
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="relative">
                  {selectMode && user.isAdmin && (
                    <button
                      onClick={() => toggleSelect(product.id)}
                      className="absolute top-2 left-2 z-20 bg-white rounded-md shadow-md p-0.5"
                    >
                      {selectedIds.has(product.id)
                        ? <CheckSquare size={22} className="text-red-500" />
                        : <Square size={22} className="text-slate-400" />}
                    </button>
                  )}
                  <div className={selectMode && selectedIds.has(product.id) ? 'ring-2 ring-red-500 rounded-2xl' : ''}>
                    <ProductCard
                      product={product}
                      onClick={() => selectMode ? toggleSelect(product.id) : onProductClick(product)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Ko'proq yuklash */}
            {!search && hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-white text-blue-600 font-bold px-6 py-3 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Yuklanmoqda...</> : "Ko'proq ko'rsatish"}
                </button>
              </div>
            )}
          </>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-400" />
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
    </div>
  );
};
