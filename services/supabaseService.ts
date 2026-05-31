import { supabase } from './supabaseClient';
import { User, Product, PassengerRequest } from '../types';
import { ADMIN_TELEGRAM_IDS } from '../constants';

// Supabase 'users' jadvalidagi qatorni ilovadagi User tipiga aylantiradi
const mapUser = (row: any): User => {
  const isAdmin = ADMIN_TELEGRAM_IDS.includes(Number(row.telegram_id));
  return {
    id: row.id,
    telegramId: row.telegram_id,
    name: row.name,
    phone: row.phone,
    username: row.username || undefined,
    isAdmin,
    // Admin doim premium; aks holda bazadagi qiymat
    isPremium: isAdmin ? true : (row.is_premium ?? false),
    premiumExpiry: row.premium_expiry ?? undefined,
    referralCount: row.referral_count ?? 0,
    referralLink: row.referral_link ?? `https://t.me/poshxurt_savdo_bot?start=ref_${row.telegram_id}`,
    avatar: row.avatar ?? undefined,
  };
};

export const authService = {
  // Telegram Mini App ochilganda telegram_id bo'yicha foydalanuvchini topadi
  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) {
      console.error('getUserByTelegramId xatosi:', error.message);
      return null;
    }
    if (!data) return null;

    const user = mapUser(data);
    localStorage.setItem('poshxurt_user', JSON.stringify(user));
    return user;
  },

  // Sessiyani localStorage'dan tezkor o'qish (Telegram tasdig'igacha placeholder)
  getCurrentUser(): User | null {
    const u = localStorage.getItem('poshxurt_user');
    return u ? (JSON.parse(u) as User) : null;
  },

  logout() {
    localStorage.removeItem('poshxurt_user');
  },

  async incrementReferral(userId: string): Promise<User | null> {
    const { data: current } = await supabase
      .from('users')
      .select('referral_count')
      .eq('id', userId)
      .single();

    if (!current) return null;

    const { data: updated } = await supabase
      .from('users')
      .update({ referral_count: (current.referral_count || 0) + 1 })
      .eq('id', userId)
      .select()
      .single();

    if (updated) {
      const user = mapUser(updated);
      localStorage.setItem('poshxurt_user', JSON.stringify(user));
      return user;
    }
    return null;
  },
};

const mapProduct = (row: any): Product => ({
  id: row.id,
  sellerId: row.seller_id,
  sellerName: row.seller_name,
  sellerPhone: row.seller_phone,
  title: row.title,
  price: row.price,
  description: row.description,
  images: row.images ?? [],
  category: row.category,
  isTop: row.is_top ?? false,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  status: row.status ?? ('active' as any),
  location: row.location,
});

// Bir sahifada nechta e'lon yuklanadi (pagination)
export const PAGE_SIZE = 20;

const BUCKET = 'product-images';

// dataURL (base64) ni Blob ga aylantirish (Storage'ga yuklash uchun)
function dataURLtoBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = head.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binary = atob(body);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export const storageService = {
  // base64 rasmni Storage'ga yuklab, ochiq URL qaytaradi.
  // 'default-taxi' yoki allaqachon URL bo'lsa — o'zini qaytaradi.
  async uploadImage(image: string, userId: string): Promise<string> {
    if (!image || image === 'default-taxi' || image.startsWith('http')) {
      return image;
    }
    if (!image.startsWith('data:')) return image;

    const blob = dataURLtoBlob(image);
    const ext = blob.type.split('/')[1] || 'jpg';
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  // Storage URL'idan ichki path'ni ajratib olish
  pathFromUrl(url: string): string | null {
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  },

  // Bir nechta rasmni Storage'dan o'chirish
  async removeImages(urls: string[]): Promise<void> {
    const paths = urls
      .map((u) => this.pathFromUrl(u))
      .filter((p): p is string => !!p);
    if (paths.length === 0) return;
    await supabase.storage.from(BUCKET).remove(paths);
  },
};

export const productService = {
  // Sahifalab yuklash. page 0 dan boshlanadi.
  async getProducts(page = 0, category?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('is_top', { ascending: false })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  // Bitta foydalanuvchining e'lonlari (profil uchun)
  async getMyProducts(sellerId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  async createProduct(product: any, user: User): Promise<void> {
    // Rasmlarni avval Storage'ga yuklab, URL'larga aylantiramiz
    const imageUrls = await Promise.all(
      (product.images || []).map((img: string) => storageService.uploadImage(img, user.id))
    );

    const newProduct = {
      title: product.title,
      price: Number(product.price),
      description: product.description,
      category: product.category,
      location: product.location,
      images: imageUrls,
      is_top: user.isPremium ?? false,
      seller_id: user.id,
      seller_name: user.name,
      seller_phone: user.phone,
    };

    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) throw error;
  },

  // E'lonlarni o'chirish (rasmni Storage'dan ham o'chiradi)
  async deleteProducts(products: Product[]): Promise<void> {
    if (products.length === 0) return;

    // 1) Rasmlarni Storage'dan o'chiramiz
    const allUrls = products.flatMap((p) => p.images).filter((u) => u && u.startsWith('http'));
    if (allUrls.length > 0) {
      await storageService.removeImages(allUrls);
    }

    // 2) Yozuvlarni bazadan o'chiramiz
    const ids = products.map((p) => p.id);
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw error;
  },

  async createPassengerRequest(req: any): Promise<void> {
    const { error } = await supabase.from('taxi_requests').insert([{
      from_location: req.from,
      to_location: req.to,
      price: req.price,
      phone: req.phone,
    }]);
    if (error) throw error;
  },

  async getPassengerRequests(): Promise<PassengerRequest[]> {
    const { data, error } = await supabase
      .from('taxi_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((row: any): PassengerRequest => ({
      id: row.id,
      from: row.from_location,
      to: row.to_location,
      price: row.price,
      phone: row.phone,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));
  },
};
