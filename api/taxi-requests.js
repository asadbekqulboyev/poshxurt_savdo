import { authenticate, setCors } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

const mapReq = (row) => ({
  id: row.id,
  from: row.from_location,
  to: row.to_location,
  price: row.price,
  phone: row.phone,
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
});

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: so'rovlar ro'yxati (haydovchilar ko'radi)
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('taxi_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json((data ?? []).map(mapReq));
  }

  // POST: yangi so'rov (faqat tasdiqlangан foydalanuvchi)
  if (req.method === 'POST') {
    const tgUser = authenticate(req);
    if (!tgUser) return res.status(401).json({ error: 'Telegram imzosi tasdiqlanmadi' });

    const { data: dbUser } = await supabaseAdmin
      .from('users').select('phone').eq('telegram_id', tgUser.id).maybeSingle();
    if (!dbUser) return res.status(403).json({ error: 'not_registered' });

    const b = req.body || {};
    if (!b.from || !b.to) return res.status(400).json({ error: 'from va to shart' });

    const { error } = await supabaseAdmin.from('taxi_requests').insert([{
      from_location: String(b.from).slice(0, 200),
      to_location: String(b.to).slice(0, 200),
      price: b.price ? String(b.price).slice(0, 50) : '',
      // Telefon serverдан olinadi (client yubormайди — soxta raqam bo'lmasин)
      phone: dbUser.phone,
    }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
