import { Category, Product, ProductStatus } from './types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Barchasi', icon: '✨' },
  { id: 'taxi', name: 'Taxi Xizmati', icon: '🚖' },
  { id: 'livestock', name: 'Chorva mollari', icon: '🐄' }, 
  { id: 'agriculture', name: 'Dehqonchilik', icon: '🌾' },
  { id: 'vehicles', name: 'Mashina va Texnika', icon: '🚜' },
  { id: 'home', name: 'Uy va Ro\'zg\'or', icon: '🏡' },
  { id: 'others', name: 'Boshqa narsalar', icon: '📦' },
];

// Mock Initial Data simulating MongoDB data
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sellerId: 'user_2',
    sellerName: 'Alisher Rais',
    sellerPhone: '+998901234567',
    title: 'Sog\'lom Sigir sotiladi',
    price: 8500000,
    description: '3 yoshli sigir, sut berishi yaxshi. Poshxurt markazida.',
    images: [
      'https://picsum.photos/400/300?random=1',
      'https://picsum.photos/400/300?random=11'
    ],
    category: 'livestock',
    isTop: true,
    createdAt: Date.now(),
    status: ProductStatus.ACTIVE,
    location: 'Poshxurt, Markaz'
  },
  {
    id: 'taxi_1',
    sellerId: 'user_taxi_1',
    sellerName: 'Sherzod Taxi',
    sellerPhone: '+998991112233',
    title: 'Poshxurt ↔️ Termiz',
    price: 50000,
    description: 'Har kuni ertalab soat 07:00 da Termizga yuraman. Moshina Cobalt. Konditsioner bor. Yukxona bo\'sh.',
    images: ['https://picsum.photos/400/300?random=taxi1'],
    category: 'taxi',
    isTop: true,
    createdAt: Date.now() - 2000000,
    status: ProductStatus.ACTIVE,
    location: 'Poshxurt Markaz'
  },
  {
    id: 'taxi_2',
    sellerId: 'user_taxi_2',
    sellerName: 'Bekzod Aka',
    sellerPhone: '+998977777777',
    title: 'Poshxurt ↔️ Sherobod',
    price: 30000,
    description: 'Sherobod bozoriga qatnayman. Abedda qaytaman. Moshina Damas.',
    images: ['https://picsum.photos/400/300?random=taxi2'],
    category: 'taxi',
    isTop: false,
    createdAt: Date.now() - 100000,
    status: ProductStatus.ACTIVE,
    location: 'Yuqori Mahalla'
  },
  {
    id: 'taxi_3',
    sellerId: 'user_taxi_3',
    sellerName: 'Umidjon',
    sellerPhone: '+998933334455',
    title: 'Qishloq ichida (Dostavka)',
    price: 10000,
    description: 'Qishloq ichida yuraman. Yuk bo\'lsa ham olaman. Maktab bolalarini ham tashiyman.',
    images: ['https://picsum.photos/400/300?random=taxi3'],
    category: 'taxi',
    isTop: false,
    createdAt: Date.now() - 500000,
    status: ProductStatus.ACTIVE,
    location: 'Markaz'
  },
  {
    id: '2',
    sellerId: 'user_3',
    sellerName: 'Jamshid',
    sellerPhone: '+998919876543',
    title: 'Pretsip (Tirkama)',
    price: 3000000,
    description: 'Yengil moshina uchun tirkama. Holati yangi.',
    images: ['https://picsum.photos/400/300?random=2'],
    category: 'vehicles',
    isTop: false,
    createdAt: Date.now() - 10000000,
    status: ProductStatus.ACTIVE,
    location: 'Qo\'rg\'oncha'
  },
  {
    id: '3',
    sellerId: 'user_4',
    sellerName: 'Oysara Xola',
    sellerPhone: '+998935554433',
    title: 'Quritilgan o\'rik (Turshak)',
    price: 45000,
    description: 'Tabiiy, dori sepilmagan tog\' o\'rigi. Narxi 1kg uchun.',
    images: [
      'https://picsum.photos/400/300?random=3', 
      'https://picsum.photos/400/300?random=33',
      'https://picsum.photos/400/300?random=34'
    ],
    category: 'agriculture',
    isTop: true,
    createdAt: Date.now() - 5000000,
    status: ProductStatus.ACTIVE,
    location: 'Yuqori mahalla'
  }
];