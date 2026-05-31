-- ============================================================
--  POSHXURT BOZOR — Supabase jadvallar va xavfsizlik sozlamalari
--  Supabase Dashboard -> SQL Editor -> shu kodni qo'yib "Run" bosing
-- ============================================================

-- ---------- 1. USERS (foydalanuvchilar) ----------
create table if not exists public.users (
  id             uuid primary key default gen_random_uuid(),
  telegram_id    bigint unique not null,          -- Telegram ID — asosiy identifikator
  name           text not null,
  phone          text,
  username       text,                            -- Telegram @username
  is_premium     boolean default false,
  premium_expiry bigint,
  referral_count integer default 0,
  referral_link  text,
  avatar         text,
  created_at     timestamptz default now()
);

-- ---------- 2. PRODUCTS (e'lonlar) ----------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid references public.users(id) on delete cascade,
  seller_name  text not null,
  seller_phone text,
  title        text not null,
  price        numeric default 0,
  description  text,
  images       jsonb default '[]'::jsonb,         -- rasm URL/base64 massivi
  category     text not null,
  location     text,
  is_top       boolean default false,
  status       text default 'active',
  created_at   timestamptz default now()
);

-- ---------- 3. TAXI_REQUESTS (yo'lovchi so'rovlari) ----------
create table if not exists public.taxi_requests (
  id            uuid primary key default gen_random_uuid(),
  from_location text not null,
  to_location   text not null,
  price         text,
  phone         text not null,
  created_at    timestamptz default now()
);

-- Tezroq saralash uchun indekslar
create index if not exists idx_products_created on public.products (created_at desc);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_taxi_created on public.taxi_requests (created_at desc);
create index if not exists idx_users_telegram on public.users (telegram_id);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
--  Anon kalit bilan o'qish/yozish uchun policy'lar.
--  Eslatma: hozir MVP uchun ochiq. Keyinroq qattiqlashtiramiz.
-- ============================================================

alter table public.users          enable row level security;
alter table public.products       enable row level security;
alter table public.taxi_requests  enable row level security;

-- USERS: hamma o'qiy oladi, hamma yoza/yangilay oladi (bot va app uchun)
drop policy if exists "users_select" on public.users;
drop policy if exists "users_insert" on public.users;
drop policy if exists "users_update" on public.users;
create policy "users_select" on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (true);
create policy "users_update" on public.users for update using (true);

-- PRODUCTS: hamma o'qiy oladi, hamma e'lon qo'sha oladi
drop policy if exists "products_select" on public.products;
drop policy if exists "products_insert" on public.products;
create policy "products_select" on public.products for select using (true);
create policy "products_insert" on public.products for insert with check (true);

-- TAXI_REQUESTS: hamma o'qiy oladi, hamma so'rov qo'sha oladi
drop policy if exists "taxi_select" on public.taxi_requests;
drop policy if exists "taxi_insert" on public.taxi_requests;
create policy "taxi_select" on public.taxi_requests for select using (true);
create policy "taxi_insert" on public.taxi_requests for insert with check (true);
