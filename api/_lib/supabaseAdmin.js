import { createClient } from '@supabase/supabase-js';

// Server tomonida ishlaydigan Supabase client (service_role kalit bilan).
// DIQQAT: bu kalit faqat serverda (Vercel funksiyalarida) ishlatiladi,
// hech qachon frontendga chiqmaydi.
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter(Boolean);
