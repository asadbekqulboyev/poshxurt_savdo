import { supabase } from './supabaseClient';
import { User, Product, PassengerRequest } from '../types';

// Supabase 'users' jadvalidagi qatorni ilovadagi User tipiga aylantiradi
const mapUser = (row: any): User => ({
  id: row.id,
  telegramId: row.telegram_id,
  name: row.name,
  phone: row.phone,
  username: row.username || undefined,
  isPremium: row.is_premium ?? false,
  premiumExpiry: row.premium_expiry ?? undefined,
  referralCount: row.referral_count ?? 0,
  referralLink: row.referral_link ?? `https://t.me/poshxurt_bot?start=ref_${row.telegram_id}`,
  avatar: row.avatar ?? undefined,
});

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

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapProduct);
  },

  async createProduct(product: any, user: User): Promise<void> {
    const newProduct = {
      title: product.title,
      price: Number(product.price),
      description: product.description,
      category: product.category,
      location: product.location,
      images: product.images,
      is_top: user.isPremium ?? false,
      seller_id: user.id,
      seller_name: user.name,
      seller_phone: user.phone,
    };

    const { error } = await supabase.from('products').insert([newProduct]);
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
