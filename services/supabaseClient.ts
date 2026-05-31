import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Kalitlar yo'q bo'lsa, tushunarli xato beramiz (oq ekran o'rniga)
  console.error(
    "Supabase sozlanmagan! .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY bo'lishi shart."
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');
