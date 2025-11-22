# 🕋 ElysianGo Mutawwif API  
### 🌍 The World’s First 25-Language FaithTech AI Engine for Umrah & Hajj  
Built by **ElysianGo Baitullah – FaithTech Superapp Pioneer 2025**

---

## 📌 Overview
**ElysianGo Mutawwif API adalah mesin AI multilingual pertama di dunia yang memberikan panduan real-time untuk Umrah & Haji dalam 25 bahasa, menggunakan:

Model OpenAI GPT-4.1 & GPT-4.1-mini

Whisper STT

GPT-4o TTS

MongoDB Pro Session

Shopify Subscription Engine

Mesin ini mendukung:

🔹 Doa & dzikir 25 bahasa
🔹 Panduan fiqh 4 mazhab
🔹 Penjelasan rukun, wajib, sunnah
🔹 Guidance perjalanan Haramain
🔹 Mode Gratis (Basic) dan Pro (Berlangganan)
🔹 Voice input + Voice output (Pro Mode)

ElysianGo menjadi Superapp FaithTech pertama di dunia, memadukan AI + spiritual guidance + travel ecosystem.
---

## 🌐 Supported Languages (25)
Indonesia, English, Melayu, Singapore English, العربية, Türkçe, Français, Español, Português, Português BR,
Deutsch, Русский, हिन्दी, বাংলা, اردو, 简体中文, 繁體中文, 日本語, 한국어, ไทย,
Tiếng Việt, Filipino, Kiswahili, Italiano, Nederlands.

---

## ✨ Features
### 🟩 Basic Mode (Free)

- 7 pertanyaan / hari

- Jawaban cepat & ringkas

- Model: gpt-4.1-mini

- Multi-bahasa otomatis

- Tidak ada voice

### 🟨 Pro Mode (Premium)

- Jawaban panjang & mendalam

- Fiqh 4 mazhab + dalil

- Model: gpt-4.1

- Unlimited / kuota besar

- Multi-device login

- Voice Input (STT)

- Voice Output (TTS MP3)

- Aktivasi otomatis via Shopify

### 🟦 Pro Voice Mode

- Kirim audio → Whisper STT → GPT-4.1 → TTS MP3

- Output audio langsung dapat diputar di browser

- Ideal untuk jamaah lansia, penyandang disabilitas, atau pengguna yang lebih nyaman interaksi suara 

---

## 🏗️ Architecture
```mermaid
graph TD;
    A[User Device] -->|Basic Mode| B[/api/mutawwif/basic/];
    A -->|Pro Mode (JWT)| C[/api/mutawwif/pro/];
    A -->|Pro Voice Mode| D[/api/mutawwif/voice/];

    B --> E[OpenAI GPT-4.1 Mini];
    C --> F[OpenAI GPT-4.1];
    D --> G[Whisper STT + GPT-4o TTS];

    C --> H[(MongoDB - Pro Users Database)];

    I[Shopify Subscription] --> J[/Webhook /api/shopify/webhook/pro/];
    J --> H;

    style A fill:#fefefe,stroke:#0f0,stroke-width:2px;
    style B fill:#eef,stroke:#06f;
    style C fill:#efe,stroke:#0a0;
    style D fill:#ffe,stroke:#cc0;
    style H fill:#fff,stroke:#333,stroke-width:2px;44
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/elysiangobaitullah-oss/elysiango-mutawwif-api.git
cd elysiango-mutawwif-api
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Tambahkan File `.env template
Buat file:

```
PORT=3020
OPENAI_API_KEY=your_key
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
PRO_DEFAULT_DAYS=30
BASIC_DAILY_LIMIT=7
BASIC_MAX_TOKENS=400
PRO_MAX_TOKENS=2000
B2_KEY_ID=your_key
B2_APPLICATION_KEY=your_key
B2_BUCKET_NAME=elysiango-storage
B2_BUCKET_REGION=us-west-004
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
SHOPIFY_WEBHOOK_SECRET=your_shopify_secret
```

---

## ▶️ Running the Server

### Development
```bash
node server.js
```

### Production
```bash
pm2 start pm2.config.js
pm2 save
pm2 startup
```

Server berjalan pada:
```
[http://localhost:3020
]```

---

## 📡 API Endpoints

### 🔹 1. Health Check
```sql
GET /
```

Response:
```json
{
  "status": "ok",
  "service": "ElysianGo Mutawwif API",
  "languages": ["id","en","ar",...]
}
```

---

### 🟩 2. Basic Mode (Free)
``` bash
POST /api/mutawwif/basic
```
#### Example 
``` json
{
  "message": "Apa doa masuk Masjidil Haram?",
  "language": "id",
  "deviceID": "hashed-device-id"
}
```

### 🟨 3. Pro Mode (JWT Required)
``` bash
POST /api/mutawwif/basic
```

#### Header:
``` makefile
Header:
```

#### Example Request
```json
{
  "message": "Apa doa ketika melihat Ka'bah?",
  "language": "id"
}
```
---

### 🟦 4. Pro Voice Mode
``` bash
POST /api/mutawwif/Voice
```

### Example Client
```js
{
const fd = new FormData();
fd.append("audio", blob, "voice.webm");
fd.append("lang", "id");

fetch("/api/mutawwif/voice", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
  },
  body: fd
});
```

#### 🔑 Output

#### Endpoint
``` json
{
  "reply": "...",
  "audio": "data:audio/mpeg;base64,..."
}
```
### 🛒 5. Shopify Webhook (Activate Pro Access)
``` swift
POST/api/shopify/webhook/pro
```

#### Shopify payload
```
{
  "customer": {
    "email": "user@example.com",
    "first_name": "Ali",
    "last_name": "Hassan"
  }
```
Server updates Pro access automatically.

### 🔑 6. Check Pro Access
```
{
POST /api/mutawwif/check-pro
 }
```
Body
```
{ "email": "user@example.com" }
```

### 🗄 B2 Storage Endpoints
#### Upload File
```bash
{
POST /api/upload
 }
```
#### Delete File
```sql
{
DELETE /api/delete
}
```

### 🔐 Security
- JWT Authentication untuk Pro users  
- Rate limit berbasis IP untuk Basic
- Validasi Shopify HMAC 
- Sanitasi input  
- Validasi Shopify HMAC 
- MongoDB Atlas secure cluster
- B2 signed requests

---

### 🤝 Contributing

Kontribusi dari komunitas global sangat diterima.
Fork repo ini dan ajukan PR untuk pengembangan lebih lanjut.
---

### 📜 License
MIT License  
© 2025 ElysianGo Baitullah – The 3FaithTech Superapp Initiative

---
