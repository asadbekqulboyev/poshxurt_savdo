import React from 'react';
import { Product } from '../types';
import { MapPin, Star, TruckIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price);

  const isTaxi = product.category === 'taxi';
  const hasDefaultImage = !product.images[0] || product.images[0] === 'default-taxi';

  return (
    <div
      onClick={() => onClick(product)}
      className="group bg-white rounded-2xl shadow-sm active:scale-[0.98] border border-slate-100 overflow-hidden cursor-pointer flex flex-col h-full transition-all"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {hasDefaultImage ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <TruckIcon size={44} className="text-slate-400" />
          </div>
        ) : (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {product.isTop && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-lg flex items-center shadow-sm z-10">
            <Star size={12} className="mr-1 fill-black" />
            TOP
          </div>
        )}

        {isTaxi && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-lg flex items-center shadow-sm z-10">
            <TruckIcon size={13} className="mr-1" />
            Taksi
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-slate-800 font-bold text-[15px] leading-tight line-clamp-2 mb-2">{product.title}</h3>

        <p className="text-blue-600 font-black text-lg leading-none mt-auto">
          {formatPrice(product.price)}
          <span className="text-xs font-semibold text-slate-400 ml-1">{isTaxi ? "so'm/kishi" : "so'm"}</span>
        </p>

        {product.location && (
          <div className="flex items-center text-slate-400 text-xs font-medium mt-2 pt-2 border-t border-slate-100">
            <MapPin size={13} className="mr-1 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
