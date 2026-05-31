import { authenticate, setCors } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } }, // base64 rasmlar uchun
};

// POST /api/upload — base64 rasmni Storage'ga yuklab, public URL qaytaradi.
// Faqat tasdiqlangан foydalanuvchi.
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const tgUser = authenticate(req);
  if (!tgUser) return res.status(401).json({ error: 'Telegram imzosi tasdiqlanmadi' });

  const { image } = req.body || {};
  if (!image || typeof image !== 'string' || !image.startsWith('data:')) {
    return res.status(400).json({ error: 'data:image base64 kerak' });
  }

  // data:image/jpeg;base64,xxxx  →  blob
  const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ error: 'noto`g`ri format' });
  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');

  // Hajm cheklovi (5MB)
  if (buffer.length > 5 * 1024 * 1024) return res.status(413).json({ error: 'rasm juda katta' });

  const ext = mime.split('/')[1] || 'jpg';
  const path = `${tgUser.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('product-images')
    .upload(path, buffer, { contentType: mime, upsert: false });
  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
  return res.status(200).json({ url: data.publicUrl });
}
