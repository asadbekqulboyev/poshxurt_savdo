import React from 'react';
import { Product } from '../types';
import { MapPin, Star, Heart, TruckIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const isTaxi = product.category === 'taxi';
  const hasDefaultImage = product.images[0] === 'default-taxi';

  return (
    <div 
      onClick={() => onClick(product)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 overflow-hidden cursor-pointer flex flex-col h-full transform transition-all duration-300 hover:scale-99"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {hasDefaultImage ? (
           <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <TruckIcon size={40} className="text-slate-400" />
           </div>
        ) : (
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}
        
        {product.isTop && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm z-10 border border-white/50">
            <Star size={10} className="mr-1 fill-black" />
            TOP
          </div>
        )}
        
        {isTaxi && (
          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center shadow-sm z-10 border border-white/20">
            <TruckIcon size={12} className="mr-1" />
            TAXI
          </div>
        )}

        <button className="absolute top-2 right-2 p-1.5 bg-white/50 backdrop-blur-sm rounded-full text-slate-700 hover:bg-white transition-colors opacity-0 group-hover:opacity-100 md:opacity-100">
            <Heart size={16} />
        </button>
        
        {!isTaxi && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 via-black/20 to-transparent p-2 pt-8 opacity-100">
             <div className="text-white/95 text-[10px] md:text-xs flex items-center font-medium truncate">
               <MapPin size={10} className="mr-1 flex-shrink-0" />
               <span className="truncate">{product.location}</span>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-slate-800 font-bold text-sm md:text-base line-clamp-2 leading-snug mb-auto">{product.title}</h3>
        <div className="mt-2">
          <p className="text-blue-600 font-black text-base md:text-lg">{formatPrice(product.price)} <span className="text-xs font-medium text-blue-600/70">{isTaxi ? "so'm/odam" : "so'm"}</span></p>
          
          <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-50">
             <span className="text-[10px] md:text-xs text-slate-400 font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
             {isTaxi && <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">Hozir aktiv</span>}
          </div>
        </div>
      </div>
    </div>
  );
};