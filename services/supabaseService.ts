import { supabase } from './supabaseClient';
import { User, Product, PassengerRequest } from '../types';

export const authService = {
  async login(name: string, phone: string): Promise<User> {
    // 1. Foydalanuvchini bazadan qidiramiz
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    // 2. Agar topilmasa, yangi foydalanuvchi yaratamiz (INSERT)
    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name, phone, isPremium: false, referralCount: 0 }])
        .select()
        .single();
      
      if (error) throw error;
      user = newUser;
    }
    
    // 3. LocalStorage ga saqlaymiz (sessiya uchun)
    localStorage.setItem('poshxurt_user', JSON.stringify(user));
    return user as User;
  },

  getCurrentUser(): User | null {
    const u = localStorage.getItem('poshxurt_user');
    return u ? JSON.parse(u) : null;
  },

  logout() {
    localStorage.removeItem('poshxurt_user');
  },

  async incrementReferral(userId: string): Promise<User | null> {
    const { data: user } = await supabase.from('users').select('referralCount').eq('id', userId).single();
    if (user) {
       const { data: updated } = await supabase
          .from('users')
          .update({ referralCount: (user.referralCount || 0) + 1 })
          .eq('id', userId)
          .select()
          .single();
       if (updated) {
           localStorage.setItem('poshxurt_user', JSON.stringify(updated));
           return updated as User;
       }
    }
    return null;
  }
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data as Product[];
  },

  async createProduct(product: any, user: User): Promise<void> {
    const newProduct = {
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      location: product.location,
      images: product.images,
      isTop: false,
      sellerId: user.id,
      sellerName: user.name,
      sellerPhone: user.phone
    };
    
    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) throw error;
  },

  async createPassengerRequest(req: any): Promise<void> {
    const { error } = await supabase.from('taxi_requests').insert([req]);
    if (error) throw error;
  },

  async getPassengerRequests(): Promise<PassengerRequest[]> {
    const { data, error } = await supabase
      .from('taxi_requests')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data as PassengerRequest[];
  }
};
