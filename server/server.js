import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

// Simple referral code generator
function generateReferral() {
  return Math.random().toString(36).slice(2, 10);
}

function extractReferralCode(ref) {
  if (!ref) return null;
  try {
    if (ref.includes('?start=')) return ref.split('?start=')[1];
    return ref;
  } catch (e) {
    return ref;
  }
}

// Base64 rasmlar katta bo'lishi mumkin, shuning uchun limitni oshiramiz (50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MONGODB CONNECTION ---
// Agar .env da xato bo'lsa, lokal bazaga ulanadi
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/poshxurt';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB ulandi ✅'))
  .catch(err => console.error('MongoDB xatosi ❌:', err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true, index: true },
  isPremium: { type: Boolean, default: false },
  referralCount: { type: Number, default: 0 },
  referralLink: { type: String, default: generateReferral, index: true },
  createdAt: { type: Date, default: Date.now }
}, { strict: true });
// Ensure indexes
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ referralLink: 1 });
const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
  sellerId: String,
  sellerName: String,
  sellerPhone: String,
  title: String,
  price: Number,
  description: String,
  images: [String], // Base64 stringlar shu yerda saqlanadi
  category: String,
  isTop: Boolean,
  location: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', ProductSchema);

const RequestSchema = new mongoose.Schema({
  from: String,
  to: String,
  price: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});
const Request = mongoose.model('Request', RequestSchema);

// --- ROUTES ---

// 1. Login
app.post('/api/auth/login', async (req, res) => {
  const { name, phone } = req.body;
  try {
    let user = await User.findOne({ phone });
    if (!user) {
      // create a referral code (stored as code, returned as full link to client)
      const code = generateReferral();
      user = new User({ 
        name, 
        phone, 
        referralLink: code
      });
      await user.save();
    }
    if (user.name !== name) {
        user.name = name;
        await user.save();
    }
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    // provide full referral link for clients
    userObj.referralLink = `https://t.me/poshxurt_bot?start=${user.referralLink}`;
    res.json(userObj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Get Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
    const formatted = products.map(p => {
      const obj = p.toObject();
      obj.id = p._id.toString();
      return obj;
    });
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Create Product (Base64 Direct Save)
app.post('/api/products', async (req, res) => {
  try {
    // Rasmlar endi to'g'ridan-to'g'ri body ichida keladi
    const { title, price, description, category, location, sellerId, sellerName, sellerPhone, isTop, images } = req.body;
    
    // Agar rasm kelmasa yoki bo'sh bo'lsa va bu taxi bo'lsa
    let finalImages = images || [];
    if (category === 'taxi' && finalImages.length === 0) {
        finalImages = ['default-taxi'];
    }

    const newProduct = new Product({
      sellerId,
      sellerName,
      sellerPhone,
      title,
      price,
      description,
      category,
      location,
      images: finalImages,
      isTop: isTop === true || isTop === 'true'
    });

    await newProduct.save();
    
    const obj = newProduct.toObject();
    obj.id = newProduct._id.toString();
    res.json(obj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 4. Requests (Taxi)
app.get('/api/requests', async (req, res) => {
  try {
    const reqs = await Request.find().sort({ createdAt: -1 }).limit(50);
    const formatted = reqs.map(r => {
      const obj = r.toObject();
      obj.id = r._id.toString();
      return obj;
    });
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const newReq = new Request(req.body);
    await newReq.save();
    const obj = newReq.toObject();
    obj.id = newReq._id.toString();
    res.json(obj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Increment referral count by referral link (accepts full URL or code)
app.post('/api/referrals/increment', async (req, res) => {
  const { referralLink } = req.body;
  const code = extractReferralCode(referralLink);
  if (!code) return res.status(400).json({ error: 'referralLink is required' });
  try {
    const user = await User.findOne({ referralLink: code });
    if (!user) return res.status(404).json({ error: 'referrer not found' });
    user.referralCount = (user.referralCount || 0) + 1;
    await user.save();
    return res.json({ referralCount: user.referralCount });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));