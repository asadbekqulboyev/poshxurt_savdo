-- ============================================================
--  TAXI_REQUESTS jadvaliga joylashuv (GPS koordinata) qo'shish
--  Supabase -> SQL Editor -> Run
-- ============================================================

alter table public.taxi_requests
  add column if not exists from_lat double precision,
  add column if not exists from_lng double precision;
