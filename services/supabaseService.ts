import { User, Product, PassengerRequest } from '../types';
import { api } from './api';

export const PAGE_SIZE = 20;

export const authService = {
  // Telegram imzosi bilan tasdiqlangان foydalanuvchini serverдан oladi
  async getMe(): Promise<User | null> {
    try {
      const user = await api.get<User>('/me');
      localStorage.setItem('poshxurt_user', JSON.stringify(user));
      return user;
    } catch (e: any) {
      if (e?.status === 404 || e?.status === 401) return null; // ro'yxatdan o'tmagan
      throw e;
    }
  },

  getCurrentUser(): User | null {
    const u = localStorage.getItem('poshxurt_user');
    return u ? (JSON.parse(u) as User) : null;
  },

  logout() {
    localStorage.removeItem('poshxurt_user');
  },
};

export const storageService = {
  // base64 rasmni serverga yuborib, public URL oladi
  async uploadImage(image: string): Promise<string> {
    if (!image || image === 'default-taxi' || image.startsWith('http')) return image;
    if (!image.startsWith('data:')) return image;
    const { url } = await api.post<{ url: string }>('/upload', { image });
    return url;
  },
};

export const productService = {
  async getProducts(page = 0, category?: string): Promise<Product[]> {
    const params = new URLSearchParams({ page: String(page) });
    if (category && category !== 'all') params.set('category', category);
    return api.get<Product[]>(`/products?${params.toString()}`);
  },

  async getMyProducts(sellerId: string): Promise<Product[]> {
    return api.get<Product[]>(`/products?sellerId=${encodeURIComponent(sellerId)}`);
  },

  async createProduct(product: any, _user: User): Promise<void> {
    // Rasmlarni avval Storage'ga yuklab, URL'larга aylantiramiz
    const imageUrls = await Promise.all(
      (product.images || []).map((img: string) => storageService.uploadImage(img))
    );
    await api.post('/products', {
      title: product.title,
      price: Number(product.price),
      description: product.description,
      category: product.category,
      location: product.location,
      images: imageUrls,
    });
  },

  async deleteProducts(products: Product[]): Promise<void> {
    if (products.length === 0) return;
    const ids = products.map((p) => p.id);
    await api.del('/products', { ids });
  },

  async createPassengerRequest(req: any): Promise<void> {
    await api.post('/taxi-requests', {
      from: req.from,
      to: req.to,
      price: req.price,
      fromLat: req.fromLat,
      fromLng: req.fromLng,
    });
  },

  async getPassengerRequests(): Promise<PassengerRequest[]> {
    return api.get<PassengerRequest[]>('/taxi-requests');
  },
};
