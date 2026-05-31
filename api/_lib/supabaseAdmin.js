import { createClient } from '@supabase/supabase-js';

// Server tomonida ishlaydigan Supabase client (service_role kalit bilan).
// DIQQAT: bu kalit faqat serverda (Vercel funksiyalarida) ishlatiladi,
// hech qachon frontendga chiqmaydi.
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Env yo'q bo'lsa — tushunarli xato (oq 500 o'rniga)
if (!supabaseUrl || !serviceKey) {
  console.error(
    'MUHIM: SUPABASE_URL yoki SUPABASE_SERVICE_KEY yo`q! Vercel Environment Variables`ga qo`shing va Redeploy qiling.'
  );
}

export const supabaseAdmin = createClient(supabaseUrl || '', serviceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Env yetishmasa true — endpointlar buni tekshirib tushunarli javob beradi
export const envMissing = !supabaseUrl || !serviceKey;

export const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter(Boolean);
