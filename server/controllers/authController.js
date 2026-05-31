import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 6 xonali tasodifiy parol yaratish
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const register = async (req, res) => {
  const { name, phone, password } = req.body;

  try {
    // 1. Telefon raqam borligini tekshirish
    const userExist = await pool.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    if (userExist.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan." });
    }

    // 2. Parol generatsiya qilish va xeshlas
    const rawPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Bazaga yozish (Sizning jadvalingizga moslab)
    const newUser = await pool.query(
      'INSERT INTO users (name, phone, password) VALUES ($1, $2, $3) RETURNING id, name, phone, "isPremium", "createdAt"',
      [name, phone, hashedPassword]
    );

    // 4. Javob qaytarish (Parolni shu yerda ko'rsatamiz)
    res.status(201).json({
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xatosi" });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    // 1. Foydalanuvchini topish
    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Telefon raqam yoki parol noto'g'ri" });
    }

    const user = result.rows[0];

    // 2. Parolni tekshirish
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Telefon raqam yoki parol noto'g'ri" });
    }

    // 3. Token yaratish
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "maxfiy_kalit",
      { expiresIn: "24h" }
    );

    res.json({ message: "Xush kelibsiz", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xatosi" });
  }
};
export default { register, login };
