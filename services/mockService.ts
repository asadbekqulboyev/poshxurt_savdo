import { User, Product, PassengerRequest, ProductStatus } from '../types';
import { MOCK_PRODUCTS } from '../constants';

const API_URL = 'http://localhost:5000/api'; // Server manzili

// INTERNAL STATE FOR OFFLINE FALLBACK
// Agar server o'chiq bo'lsa, ma'lumotlar shu yerda saqlanadi (Refresh qilsa ketadi)
let fallbackProducts: Product[] = [...MOCK_PRODUCTS];
let fallbackRequests: PassengerRequest[] = [];

export const authService = {
  login: async (name: string, phone: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      if (!response.ok) throw new Error('Login failed');
      const user = await response.json();
      localStorage.setItem('poshxurt_user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.warn("Serverga ulanib bo'lmadi. Oftlayn rejimda kirilmoqda.", error);
      
      // Fallback (Offline) User yaratish
      const mockUser: User = {
        id: 'user_offline_' + Date.now(),
        name,
        phone,
        isPremium: false,
        referralCount: 0,
        referralLink: `https://t.me/poshxurt_bot?start=${phone}`
      };
      
      localStorage.setItem('poshxurt_user', JSON.stringify(mockUser));
      return mockUser;
    }
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem('poshxurt_user');
    return stored ? JSON.parse(stored) : null;
  },

  logout: () => {
    localStorage.removeItem('poshxurt_user');
  },

  incrementReferral: async (referralLink: string | null): Promise<any | null> => {
    if (!referralLink) return null;
    try {
      const response = await fetch(`${API_URL}/referrals/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralLink })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (err) {
      // Queue for later retry when back online
      try {
        const queue = JSON.parse(localStorage.getItem('referralQueue') || '[]');
        queue.push({ referralLink, ts: Date.now() });
        localStorage.setItem('referralQueue', JSON.stringify(queue));
      } catch (e) {
        console.warn('Failed to queue referral increment', e);
      }
      return null;
    }
  }
};

// Flush queued referral increments when back online
async function flushReferralQueue() {
  const queue = JSON.parse(localStorage.getItem('referralQueue') || '[]');
  if (!queue.length) return;
  const remaining: any[] = [];
  for (const item of queue) {
    try {
      const r = await fetch(`${API_URL}/referrals/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralLink: item.referralLink })
      });
      if (!r.ok) remaining.push(item);
    } catch (e) {
      remaining.push(item);
    }
  }
  localStorage.setItem('referralQueue', JSON.stringify(remaining));
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', flushReferralQueue);
  // attempt immediate flush
  flushReferralQueue();
}

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error("Server xatosi");
      const data = await response.json();
      // Server ishladi, lokal keshni yangilaymiz
      fallbackProducts = data;
      return data;
    } catch (error) {
      console.warn("Serverga ulanishda xatolik, lokal ma'lumotlar ko'rsatilmoqda.");
      return fallbackProducts;
    }
  },

  createProduct: async (productData: any, user: User): Promise<Product> => {
    try {
        // Prepare JSON payload
        const payload = {
            title: productData.title,
            price: Number(productData.price),
            description: productData.description,
            category: productData.category,
            location: productData.location,
            sellerId: user.id,
            sellerName: user.name,
            sellerPhone: user.phone,
            isTop: user.isPremium,
            images: productData.images // This contains Base64 strings or 'default-taxi'
        };

        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to create product');
        const newProduct = await response.json();
        
        // Lokal keshga ham qo'shamiz (tezkor ko'rinish uchun)
        fallbackProducts = [newProduct, ...fallbackProducts];
        return newProduct;

    } catch (error) {
        console.warn("Serversiz rejim: E'lon lokal saqlandi.");
        
        // Offline Product yaratish
        const newProduct: Product = {
            id: 'local_' + Date.now(),
            sellerId: user.id,
            sellerName: user.name,
            sellerPhone: user.phone,
            title: productData.title,
            price: Number(productData.price),
            description: productData.description,
            category: productData.category,
            location: productData.location,
            images: productData.images.length > 0 ? productData.images : (productData.category === 'taxi' ? ['default-taxi'] : []),
            isTop: user.isPremium,
            createdAt: Date.now(),
            status: ProductStatus.ACTIVE
        };

        // Lokal ro'yxatga qo'shish
        fallbackProducts = [newProduct, ...fallbackProducts];
        return newProduct;
    }
  },

  getPassengerRequests: async (): Promise<PassengerRequest[]> => {
    try {
      const response = await fetch(`${API_URL}/requests`);
      if(!response.ok) throw new Error();
      const data = await response.json();
      fallbackRequests = data;
      return data;
    } catch (error) {
      return fallbackRequests;
    }
  },

  createPassengerRequest: async (request: any): Promise<PassengerRequest> => {
    try {
        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        if(!response.ok) throw new Error();
        const newReq = await response.json();
        fallbackRequests = [newReq, ...fallbackRequests];
        return newReq;
    } catch (e) {
        console.warn("Serversiz rejim: So'rov lokal saqlandi.");
        const newReq: PassengerRequest = {
            id: 'req_' + Date.now(),
            from: request.from,
            to: request.to,
            price: request.price,
            phone: request.phone,
            createdAt: Date.now()
        };
        fallbackRequests = [newReq, ...fallbackRequests];
        return newReq;
    }
  }
};
