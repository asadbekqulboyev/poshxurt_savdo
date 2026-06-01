-- ============================================================
--  POSHXURT BOZOR — XAVFSIZLIKNI QATTIQLASHTIRISH
--  Endi hamma amal server (API) orqali service_role bilan bajariladi.
--  Anon kalit (frontendда ochiq) hech narsa qila olmaydi.
--  Supabase -> SQL Editor -> Run
-- ============================================================

-- RLS yoqilganligini kafolatlaymiz
alter table public.users          enable row level security;
alter table public.products       enable row level security;
alter table public.taxi_requests  enable row level security;

-- ---------- USERS: anon UMUMAN kira olmaydi ----------
-- (telefon raqamlar himoyalandi! faqat server o'qiydi/yozadi)
drop policy if exists "users_select" on public.users;
drop policy if exists "users_insert" on public.users;
drop policy if exists "users_update" on public.users;
-- Hech qanday anon policy yaratmaymiz => anon hech narsa qila olmaydi.
-- service_role RLS'ни chetlab o'tadi, shuning uchun bot/API ishlayveradi.

-- ---------- PRODUCTS: anon faqat O'QIY oladi (bozorni ko'rish) ----------
-- Yozish/o'chirish faqat server orqali (service_role).
drop policy if exists "products_select" on public.products;
drop policy if exists "products_insert" on public.products;
drop policy if exists "products_delete" on public.products;
create policy "products_public_read" on public.products
  for select using (true);
-- insert/delete uchun anon policy YO'Q => faqat server.

-- ---------- TAXI_REQUESTS: anon faqat O'QIY oladi ----------
drop policy if exists "taxi_select" on public.taxi_requests;
drop policy if exists "taxi_insert" on public.taxi_requests;
create policy "taxi_public_read" on public.taxi_requests
  for select using (true);
-- insert uchun anon policy YO'Q => faqat server.

-- ---------- STORAGE: rasm o'qish ochiq, yuklash/o'chirish faqat server ----------
drop policy if exists "product_images_read" on storage.objects;
drop policy if exists "product_images_insert" on storage.objects;
drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
-- insert/delete uchun anon policy YO'Q => faqat server (API /upload).

-- ============================================================
--  NATIJA:
--  - users: anon o'qiy OLMAYDI (telefon raqamlar xavfsiz) ✅
--  - products: anon o'qiydi (bozor ochiq), lekin yoza/o'chira olmaydi ✅
--  - taxi_requests: anon o'qiydi, yoza olmaydi ✅
--  - storage: rasm ko'rinadi, lekin anon yuklay/o'chira olmaydi ✅
--  Barcha yozuv/o'chirish endi API orqali (initData imzosi bilan) ✅
-- ============================================================