-- ============================================================
--  POSHXURT BOZOR — Rasmlar uchun Storage + tozalash
--  Supabase -> SQL Editor -> qo'yib "Run" bosing
-- ============================================================

-- ---------- 1. Rasm bucket (ochiq o'qish) ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ---------- 2. Storage policy'lari ----------
-- Hamma rasmni ko'ra oladi (public)
drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Hamma rasm yuklay oladi (MVP — keyinroq qattiqlashtiriladi)
drop policy if exists "product_images_insert" on storage.objects;
create policy "product_images_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images');

-- Hamma rasmni o'chira oladi (e'lon o'chganda rasm ham o'chadi)
drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images');

-- ============================================================
--  3. PRODUCTS uchun DELETE policy (admin tozalash uchun)
--  DIQQAT: hozir ochiq (anon kalit bilan o'chirish mumkin).
--  Admin tekshiruvi ilova tomonida (client-side) qilinadi.
--  Ko'lam oshganda RPC + service_role'ga o'tkazish tavsiya etiladi.
-- ============================================================
drop policy if exists "products_delete" on public.products;
create policy "products_delete"
  on public.products for delete
  using (true);

-- ============================================================
--  4. (IXTIYORIY) Avtomatik tozalash funksiyasi
--  N kundan oshган e'lonlarni o'chiradi. Faqat ESKI e'lonlarni
--  o'chirgani uchun suiiste'molga chidamli.
--  Eslatma: rasmlar Storage'da qoladi — to'liq tozalash uchun
--  ilovadagi "deleteProducts" ishlatiladi (rasmni ham o'chiradi).
-- ============================================================
create or replace function public.delete_old_products(days_old integer default 3)
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  with del as (
    delete from public.products
    where created_at < now() - (days_old || ' days')::interval
    returning 1
  )
  select count(*) into deleted_count from del;
  return deleted_count;
end;
$$;

-- pg_cron bilan har kuni avtomatik ishga tushirish (ixtiyoriy):
-- 1) Extensions bo'limidan "pg_cron" ni yoqing
-- 2) Quyidagini ishga tushiring (har kuni 03:00 da 3 kundan oshganlarni o'chiradi):
-- select cron.schedule('cleanup-old-ads', '0 3 * * *', $$ select public.delete_old_products(3); $$);
