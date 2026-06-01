export interface User {
  id: string;
  telegramId: number;        // Telegram user id — asosiy identifikator
  name: string;
  phone: string;
  username?: string;         // Telegram @username (ixtiyoriy)
  isAdmin: boolean;          // Admin — barcha imkoniyatlar
  isPremium: boolean;
  premiumExpiry?: number; // timestamp
  referralCount: number;
  referralLink?: string;
  avatar?: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  title: string;
  price: number;
  description: string;
  images: string[]; // Changed from single image string to array
  category: string;
  isTop: boolean; // "Topda turish" feature
  createdAt: number;
  status: ProductStatus;
  location: string;
}

export interface PassengerRequest {
  id: string;
  from: string;
  to: string;
  price: string;
  phone: string;
  fromLat?: number;
  fromLng?: number;
  createdAt: number;
}

export type ViewState = 'home' | 'market' | 'create' | 'profile' | 'product-detail' | 'taxi-choice' | 'passenger-request' | 'driver-feed';

export interface Category {
  id: string;
  name: string;
  icon: string;
}