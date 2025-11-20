// ============================================================
//  ELYSIANGO BAITULLAH — AI Mutawwif Basic + Pro API
//  Version: FaithTech Pioneer 2025 (JWT + MongoDB + OpenAI)
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 4000;

// -------------------------------------------------------------
// Middleware
// -------------------------------------------------------------
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

// Simple in-memory rate limit for Basic
const basicUsageStore = new Map();

// -------------------------------------------------------------
// MongoDB Connection
// -------------------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "elysiango_mutawwif",
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Pro User Schema
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

// -------------------------------------------------------------
// OpenAI Setup
// -------------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -------------------------------------------------------------
// LANGUAGE MAP (FINAL 25 LANGUAGES)
// -------------------------------------------------------------
const LANGUAGE_NAME_MAP = {
  id: "Indonesia", // 🇮🇩
  en: "English", // 🇬🇧
  ms: "Melayu", // 🇲🇾
  sg: "SG English", // 🇸🇬
  ar: "العربية", // 🇸🇦
  tr: "Türkçe", // 🇹🇷
  fr: "Français", // 🇫🇷
  es: "Español", // 🇪🇸
  pt: "Português", // 🇵🇹
  br: "Português BR", // 🇧🇷
  de: "Deutsch", // 🇩🇪
  ru: "Русский", // 🇷🇺
  hi: "हिन्दी", // 🇮🇳
  bn: "বাংলা", // 🇧🇩
  ur: "اردو", // 🇵🇰
  cn: "简体中文", // 🇨🇳
  tw: "繁體中文", // 🇹🇼
  ja: "日本語", // 🇯🇵
  kr: "한국어", // 🇰🇷
  th: "ไทย", // 🇹🇭
  vi: "Tiếng Việt", // 🇻🇳
  ph: "Filipino", // 🇵🇭
  sw: "Kiswahili", // 🇰🇪
  it: "Italiano", // 🇮🇹
  nl: "Nederlands", // 🇳🇱
};

function getLanguageName(code) {
  return LANGUAGE_NAME_MAP[code] || "English";
}

// -------------------------------------------------------------
// Rate Limit for BASIC
// -------------------------------------------------------------
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
  basicUsageStore.set(ip, record);
  return true;
}

// -------------------------------------------------------------
// JWT Middleware for PRO Users
// -------------------------------------------------------------
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

    if (user.proExpiresAt && user.proExpiresAt < new Date())
      return res.status(403).json({ error: "Pro subscription expired" });

    req.proUser = user;
    next();
  } catch (err) {
    console.error("JWT verify error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// -------------------------------------------------------------
// PROMPT CONFIGURATION
// -------------------------------------------------------------
const baseSystemPrompt = `
You are AI Mutawwif ElysianGo — a multilingual guidance companion for Umrah and Hajj.
Provide clear, compassionate, balanced guidance with a short relevant dua at the end of each answer.
Avoid medical or legal topics; advise user to follow local scholars and official regulations if unsure.
Always stay within Sunni mainstream understanding and respect different madhhab opinions.
`;

const basicExtraPrompt = `
Mode: BASIC.
Keep answers short and practical (max 3 short paragraphs).
Avoid deep fiqh debates. If a question is complex, briefly explain and kindly suggest upgrading to Mutawwif Pro
for detailed madhhab comparisons, multi-step guidance, and advanced scenarios.
`;

const proExtraPrompt = `
Mode: PRO.
Provide deep explanations, mention different scholarly views when relevant,
give step-by-step rituals, practical preparation tips, crowd navigation, adab and duas.
Structure answers clearly with headings or bullet points when helpful.
`;

// -------------------------------------------------------------
// STATIC RITUAL GUIDES (BASIC JSON, BISA DIKEMBANGKAN NANTI)
// -------------------------------------------------------------
const ritualGuides = {
  tawaf: {
    key: "tawaf",
    title: "Tawaf al-Qudum / Tawaf al-Ifadah / Tawaf Wada'",
    summary:
      "Mengelilingi Ka'bah sebanyak 7 putaran, dimulai dari Hajar Aswad dan berlawanan arah jarum jam.",
    steps: [
      "Niat tawaf dalam hati sesuai jenis tawaf (qudum, ifadah, wada').",
      "Mulai dari sejajar Hajar Aswad, angkat tangan seperti takbiratul ihram dan ucapkan takbir.",
      "Lakukan 7 putaran berlawanan arah jarum jam, menjaga adab dan kekhusyukan.",
      "Usahakan mendekat ke Multazam jika memungkinkan tanpa menyakiti orang lain.",
      "Setelah selesai, shalat sunnah 2 rakaat di belakang Maqam Ibrahim jika memungkinkan.",
    ],
    recommendedDuas: {
      generalArabic:
        "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      transliteration:
        "Rabbanaa aatina fi-d-dunyaa hasanah wa fi-l-aakhirati hasanah wa qinaa ‘adhaab an-naar.",
      meaningId:
        "Ya Rabb kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.",
    },
  },
  sai: {
    key: "sai",
    title: "Sa'i antara Shafa dan Marwah",
    summary:
      "Berjalan dan berlari kecil antara bukit Shafa dan Marwah sebanyak 7 kali sebagai mengenang perjuangan Hajar.",
    steps: [
      "Mulai dari Shafa, menghadap Ka'bah, angkat tangan dan berdoa.",
      "Turun menuju Marwah, berjalan dengan tenang dan penuh kekhusyukan.",
      "Lakukan lari kecil (raml) di area hijau bagi laki-laki jika mampu.",
      "Setiap sampai di Shafa atau Marwah, berdoa dan berdzikir.",
      "Lengkapi 7 kali putaran (Shafa → Marwah dihitung 1).",
    ],
  },
};

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "ElysianGo Mutawwif API",
    languages: Object.keys(LANGUAGE_NAME_MAP).length,
    time: new Date().toISOString(),
  });
});

// LIST LANGUAGES (untuk dropdown di frontend)
app.get("/api/languages", (req, res) => {
  const languages = Object.entries(LANGUAGE_NAME_MAP).map(([code, name]) => ({
    code,
    name,
  }));
  res.json({ languages });
});

// BASIC ENDPOINT
app.post("/api/mutawwif/basic", async (req, res) => {
  try {
    if (!checkBasicLimit(req)) {
      return res.status(429).json({
        error: "Free daily limit reached. Upgrade to Mutawwif Pro.",
      });
    }

    const { message, language = "en", history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const languageName = getLanguageName(language);

    const messages = [
      {
        role: "system",
        content: `${baseSystemPrompt}
${basicExtraPrompt}
Primary language: ${languageName}.
You MUST respond ONLY in ${languageName}. If the user uses another language,
kindly switch to ${languageName} but keep Arabic for Qur'an and duas when needed.`,
      },
      ...(Array.isArray(history) ? history.slice(-5) : []),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: 800,
      temperature: 0.3,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty reply from OpenAI");

    res.json({ reply, language: languageName, mode: "basic" });
  } catch (err) {
    console.error("Basic mode error:", err);
    res.status(500).json({ error: "Basic mode error" });
  }
});

// PRO ENDPOINT
app.post("/api/mutawwif/pro", verifyProJwt, async (req, res) => {
  try {
    const { message, language = "en", history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const languageName = getLanguageName(language);

    const messages = [
      {
        role: "system",
        content: `${baseSystemPrompt}
${proExtraPrompt}
Primary language: ${languageName}.
You MUST respond ONLY in ${languageName}. Preserve Arabic for Qur'an verses and duas.
Mention practical, context-aware tips for modern pilgrims.`,
      },
      {
        role: "system",
        content: `User email: ${req.proUser.email}. Treat them as a valued Pro subscriber and keep tone respectful, concise, and expert.`,
      },
      ...(Array.isArray(history) ? history.slice(-12) : []),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      max_tokens: 2000,
      temperature: 0.3,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty reply from OpenAI");

    res.json({ reply, language: languageName, mode: "pro" });
  } catch (err) {
    console.error("Pro mode error:", err);
    res.status(500).json({ error: "Pro mode error" });
  }
});

// TRANSLATION ENDPOINT (untuk fitur translate 25 bahasa)
app.post("/api/mutawwif/translate", async (req, res) => {
  try {
    const { text, targetLanguage = "en" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    const languageName = getLanguageName(targetLanguage);

    const messages = [
      {
        role: "system",
        content: `You are a precise translation assistant for ElysianGo Mutawwif.
Translate the user's text into ${languageName}.
Keep dua and Qur'an in Arabic but may optionally add translation after.
Return ONLY the translated text, no explanations, no quotes.`,
      },
      { role: "user", content: text },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: 800,
      temperature: 0.2,
    });

    const translated = completion.choices?.[0]?.message?.content?.trim();
    if (!translated) throw new Error("Empty translation from OpenAI");

    res.json({ translated, language: languageName });
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: "Translate error" });
  }
});

// STATIC RITUAL GUIDE ENDPOINT
app.get("/api/mutawwif/guide/:ritualKey", (req, res) => {
  const { ritualKey } = req.params;
  const key = ritualKey?.toLowerCase();

  const guide = ritualGuides[key];
  if (!guide) {
    return res.status(404).json({ error: "Ritual guide not found" });
  }

  res.json({ guide });
});

// ADMIN — ISSUE PRO TOKEN
app.post("/api/admin/issue-pro-token", async (req, res) => {
  try {
    // Optional simple admin guard
    const adminKey = process.env.ADMIN_API_KEY;
    if (adminKey) {
      const provided = req.headers["x-admin-key"];
      if (!provided || provided !== adminKey) {
        return res.status(403).json({ error: "Invalid admin key" });
      }
    }

    const { email, name, proDays = 30 } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

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

    res.json({
      email: user.email,
      token,
      expires: user.proExpiresAt,
    });
  } catch (err) {
    console.error("Issue Pro token error:", err);
    res.status(500).json({ error: "Failed to issue Pro token" });
  }
});

// -------------------------------------------------------------
// START SERVER
// -------------------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Mutawwif API running on port ${port}`);
});
