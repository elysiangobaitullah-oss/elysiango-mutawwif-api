# 🕋 ElysianGo Mutawwif API  
### 🌍 The World’s First 25-Language FaithTech AI Engine for Umrah & Hajj  
Built by **ElysianGo Baitullah – FaithTech Superapp Pioneer 2025**

---

## 📌 Overview
**ElysianGo Mutawwif API** adalah mesin AI multilingual yang memberikan panduan real-time untuk Umrah & Haji.

Engine ini melayani:
- Doa & dzikir 25 bahasa  
- Panduan rukun, wajib, sunnah  
- Navigasi kerumunan, keselamatan, adab & fiqh  
- Mode **Basic** (Gratis) & **Pro** (berbasis JWT)  
- Travel partners & global pilgrims  

ElysianGo membawa FaithTech ke level dunia — superapp pertama yang menggabungkan AI, ibadah, dan ekosistem travel halal global.

---

## 🌐 Supported Languages (25)
Indonesia, English, Melayu, SG English, العربية, Türkçe, Français, Español, Português, Português BR,  
Deutsch, Русский, हिन्दी, বাংলা, اردو, 简体中文, 繁體中文, 日本語, 한국어, ไทย,  
Tiếng Việt, Filipino, Kiswahili, Italiano, Nederlands.

---

## ✨ Features

### **Basic Mode (Free)**
- Jawaban cepat & ringkas  
- 5 riwayat percakapan  
- Rate limit harian  
- Bahasa otomatis  

### **Pro Mode**
- Penjelasan mendalam fiqh  
- Semua pendapat ulama  
- Step-by-step ritual  
- 12 riwayat percakapan  
- Token limit lebih besar  
- JWT authentication  
- Safety & navigation tips  

---

## 🏗️ Architecture
```mermaid
graph TD;
    User -->|Basic| API_Basic;
    User -->|Pro (JWT)| API_Pro;
    API_Basic --> OpenAI;
    API_Pro --> OpenAI;
    API_Pro --> MongoDB;
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

### 3️⃣ Tambahkan File `.env`
Buat file:

```
PORT=4000
OPENAI_API_KEY=YOUR_OPENAI_KEY
MONGODB_URI=YOUR_MONGODB_ATLAS_URL

JWT_SECRET=elysiango_super_secret_key
JWT_EXPIRES_IN=30d

BASIC_DAILY_LIMIT=50
BASIC_MAX_TOKENS=800
PRO_MAX_TOKENS=2000
```

---

## ▶️ Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server berjalan pada:
```
http://localhost:4000
```

---

## 📡 API Endpoints

### **Health Check**
```http
GET /
```

Response:
```json
{
  "status": "ok",
  "service": "ElysianGo Mutawwif API",
  "languages": 25,
  "time": "2025-01-01T00:00:00Z"
}
```

---

## 🟦 Basic Mode (Free)

### Endpoint
```
POST /api/mutawwif/basic
```

### Example Request
```json
{
  "message": "Apa doa ketika melihat Ka'bah?",
  "language": "id"
}
```

### Example Response
```json
{
  "reply": "Doa ketika melihat Ka'bah adalah..."
}
```

---

## 🟨 Pro Mode (JWT Required)

### Endpoint
```
POST /api/mutawwif/pro
```

### Headers
```
Authorization: Bearer <token>
```

### Example Request
```json
{
  "message": "Tolong berikan penjelasan fiqh tentang Tawaf Ifadah.",
  "language": "id"
}
```

---

## 🔑 Issue Pro Token (Admin Only)

### Endpoint
```
POST /api/admin/issue-pro-token
```

Request:
```json
{
  "email": "user@example.com",
  "name": "Ahmad"
}
```

---

## 🔐 Security
- JWT Authentication untuk Pro users  
- Rate limit berbasis IP untuk Basic  
- Sanitasi input  
- Semua koneksi melalui HTTPS  
- MongoDB Atlas dengan IP whitelist

---

## 🤝 Contributing
Pull-request sangat diterima!  
Silakan fork repo ini dan ajukan perubahan via PR.

---

## 📜 License
MIT License  
© 2025 ElysianGo Baitullah – FaithTech Superapp Initiative

---
