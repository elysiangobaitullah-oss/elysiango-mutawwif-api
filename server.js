// ======================================================================
//  ELYSIANGO MUTAWWIF API — FINAL PRODUCTION VERSION 2025
//  Basic + Pro + Translate + Ritual Guide + Admin Pro Token
//  Stack: Node 18/20, Express, MongoDB, OpenAI, JWT
// ======================================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3020;

// ======================================================================
// 1) MIDDLEWARE
// ======================================================================
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

// ======================================================================
// 2) BASIC MODE RATE LIMIT (In-memory)
// ======================================================================
const basicUsageStore = new Map();

function checkBasicLimit(req) {
  const limit = parseInt(process.env.BASIC_DAILY_LIMIT || "50", 10);
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const today = new Date().toISOString().slice(0, 10);

  const record = basicUsageStore.get(ip);

  if (!record || record.date !== today) {
    basicUsageStore.set(ip, { date: today, count: 1 });
    return true;
  }

  if (record.count >= limit) return false;

  record.count += 1;
  return true;
}

// ======================================================================
// 3) MONGODB CONNECTION
// ======================================================================
mongoose
  .connect(process.env.MONGODB_URI, { dbName: "elysiango_mutawwif" })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ======================================================================
// 4) PRO USER MODEL
// ======================================================================
const proUserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date },
  },
  { timestamps: true }
);

const ProUser = mongoose.model("ProUser", proUserSchema);

// ======================================================================
// 5) OPENAI INIT
// ======================================================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======================================================================
// 6) LANGUAGE MAP — 25 LANGUAGES
// ======================================================================
const LANGUAGE_NAME_MAP = {
  id: "Indonesia",
  en: "English",
  ms: "Melayu",
  sg: "SG English",
  ar: "العربية",
  tr: "Türkçe",
  fr: "Français",
  es: "Español",
  pt: "Português",
  br: "Português BR",
  de: "Deutsch",
  ru: "Русский",
  hi: "हिन्दी",
  bn: "বাংলা",
  ur: "اردو",
  cn: "简体中文",
  tw: "繁體中文",
  ja: "日本語",
  kr: "한국어",
  th: "ไทย",
  vi: "Tiếng Việt",
  ph: "Filipino",
  sw: "Kiswahili",
  it: "Italiano",
  nl: "Nederlands",
};

function getLanguageName(code) {
  return LANGUAGE_NAME_MAP[code] || "English";
}

// ======================================================================
// 7) SYSTEM PROMPTS
// ======================================================================
const baseSystemPrompt = `
You are AI Mutawwif ElysianGo — a multilingual guidance companion for Umrah and Hajj.
Provide clear, compassionate, balanced guidance with a short dua at the end.
Avoid medical/legal rulings; suggest referring to local scholars when needed.
Respect all Sunni madhhab viewpoints.
`;

const basicExtraPrompt = `
Mode: BASIC.
Keep answers short (max 3 short paragraphs).
Avoid deep fiqh debates. Suggest upgrading to Mutawwif Pro for advanced detail.
`;

const proExtraPrompt = `
Mode: PRO.
Give deep, detailed, structured explanations.
Mention different scholarly views when helpful.
Provide step-by-step rituals, modern travel tips, crowd navigation, and adab.
`;

// ======================================================================
// 8) RITUAL GUIDE (STATIC JSON)
// ======================================================================
const ritualGuides = {
  tawaf: {
    key: "tawaf",
    title: "Tawaf",
    summary: "Mengelilingi Ka'bah sebanyak 7 putaran.",
    steps: [
      "Niat dalam hati.",
      "Mulai dari Hajar Aswad.",
      "7 putaran berlawanan arah jarum jam.",
      "Shalat 2 rakaat di belakang Maqam Ibrahim.",
    ],
  },
  sai: {
    key: "sai",
    title: "Sa'i",
    summary: "Perjalanan antara Shafa dan Marwah 7 kali.",
    steps: ["Mulai dari Shafa", "Berjalan ke Marwah", "7 kali perjalanan"],
  },
};

// ======================================================================
// 9) JWT MIDDLEWARE (PRO USERS)
// ======================================================================
const JWT_SECRET = process.env.JWT_SECRET || "elysiango_secret";

async function verifyProJwt(req, res, next) {
  try {
    const auth = req.headers["authorization"] || "";
    const token = auth.startsWith("Bearer ") ? auth.substring(7) : null;

    if (!token) return res.status(401).json({ error: "Missing Pro token" });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await ProUser.findById(payload.sub);

    if (!user || !user.isPro)
      return res.status(403).json({ error: "Pro subscription inactive" });

    if (user.proExpiresAt < new Date())
      return res.status(403).json({ error: "Pro subscription expired" });

    req.proUser = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ======================================================================
// 10) ROUTES — HEALTH CHECK
// ======================================================================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ElysianGo Mutawwif API",
    languages: Object.keys(LANGUAGE_NAME_MAP).length,
    time: new Date().toISOString(),
  });
});

// ======================================================================
// 11) ROUTES — LIST LANGUAGES
// ======================================================================
app.get("/api/languages", (req, res) => {
  const languages = Object.entries(LANGUAGE_NAME_MAP).map(([code, name]) => ({
    code,
    name,
  }));
  res.json({ languages });
});

// ======================================================================
// 12) BASIC MODE
// ======================================================================
app.post("/api/mutawwif/basic", async (req, res) => {
  try {
    if (!checkBasicLimit(req)) {
      return res.status(429).json({
        error: "Free daily limit reached. Please upgrade to Mutawwif Pro.",
      });
    }

    const { message, language = "en", history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const languageName = getLanguageName(language);

    const messages = [
      {
        role: "system",
        content: `${baseSystemPrompt}\n${basicExtraPrompt}\nPrimary language: ${languageName}`,
      },
      ...(history || []).slice(-5),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: 800,
      temperature: 0.3,
    });

    res.json({
      reply: completion.choices?.[0]?.message?.content?.trim(),
      language: languageName,
      mode: "basic",
    });
  } catch (err) {
    res.status(500).json({ error: "Basic mode error" });
  }
});

// ======================================================================
// 13) PRO MODE
// ======================================================================
app.post("/api/mutawwif/pro", verifyProJwt, async (req, res) => {
  try {
    const { message, language = "en", history = [] } = req.body;

    const languageName = getLanguageName(language);

    const messages = [
      {
        role: "system",
        content: `${baseSystemPrompt}\n${proExtraPrompt}\nPrimary language: ${languageName}`,
      },
      {
        role: "system",
        content: `User email: ${req.proUser.email}. Handle professionally.`,
      },
      ...(history || []).slice(-12),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    });

    res.json({
      reply: completion.choices[0].message.content.trim(),
      language: languageName,
      mode: "pro",
    });
  } catch (err) {
    res.status(500).json({ error: "Pro mode error" });
  }
});

// ======================================================================
// 14) TRANSLATE 25 LANGUAGES
// ======================================================================
app.post("/api/mutawwif/translate", async (req, res) => {
  try {
    const { text, targetLanguage = "en" } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const languageName = getLanguageName(targetLanguage);

    const messages = [
      {
        role: "system",
        content: `Translate text into ${languageName}. Keep Qur'an in Arabic.`,
      },
      { role: "user", content: text },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.2,
    });

    res.json({
      translated: completion.choices[0].message.content.trim(),
      language: languageName,
    });
  } catch (err) {
    res.status(500).json({ error: "Translate error" });
  }
});

// ======================================================================
// 15) RITUAL GUIDES
// ======================================================================
app.get("/api/mutawwif/guide/:key", (req, res) => {
  const g = ritualGuides[req.params.key?.toLowerCase()];
  if (!g) return res.status(404).json({ error: "Guide not found" });
  res.json({ guide: g });
});

// ======================================================================
// 16) ADMIN — ISSUE PRO TOKEN
// ======================================================================
app.post("/api/admin/issue-pro-token", async (req, res) => {
  try {
    const { email, name, proDays = 30 } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    let user = await ProUser.findOne({ email });
    if (!user) user = new ProUser({ email, name });

    user.isPro = true;
    user.proExpiresAt = new Date(Date.now() + proDays * 86400000);
    await user.save();

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: `${proDays}d` }
    );

    res.json({ email, token, expires: user.proExpiresAt });
  } catch (err) {
    res.status(500).json({ error: "Issue token error" });
  }
});

// ======================================================================
// 17) START SERVER
// ======================================================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 Mutawwif API running on port ${PORT}`);
});
