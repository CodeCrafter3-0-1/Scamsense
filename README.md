# TEAM HACKHERS (CC3H-173)

# 🛡️ **ScamSense**  
### *Detect Scams. Protect People.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

## 🚀 **Overview**

**ScamSense** is an **AI-powered fraud detection platform** designed to protect users from digital scams in India. It analyzes suspicious messages, UPI requests, URLs, and mobile applications in **real-time** to detect potential threats **before users take action**.

By combining **machine learning** with a **rule-based detection system**, ScamSense provides **fast, accurate, and explainable risk scores**, helping users avoid financial loss and make safer decisions online.

## ❗ **The Problem**

India faces a **massive rise in digital fraud**:

| Metric | Statistics |
|--------|------------|
| 📈 **Cybercrime Complaints** | 47+ lakh annually |
| 💸 **Financial Loss** | ₹1000+ crore every year |
| ⚠️ **Common Scams** | UPI fraud, phishing, fake loan apps, impersonation |

> **👉 Most users realize it's a scam *only after losing money*.**

## 💡 **Our Solution**

ScamSense acts as a **real-time fraud firewall**, detecting scams across:

- 📩 **Messages** (SMS / Chat apps)
- 💸 **UPI Payment Requests**
- 🔗 **URLs** (Phishing detection)
- 📱 **Mobile Apps** (Loan app risk analysis)
- 🎭 **Media Claims** (Fake authority / deepfake signals)

## 🔥 **Key Features**

| Feature | Description |
|---------|-------------|
| ⚡ **Real-Time Detection** | Instant analysis of inputs |
| 🧠 **AI + Rules Hybrid** | ML context + pattern detection |
| 📊 **Risk Scoring** | Percentage-based threat levels |
| 🏷️ **Scam Classification** | Specific scam type identification |
| ✅ **Actionable Advice** | Clear next steps for users |
| 🇮🇳 **India-Focused** | Tailored for local scam patterns |

## 🎯 **How It Works**
User submits input (message, URL, UPI request, etc.)
↓

AI models analyze context & intent
↓

Rule engine detects known scam patterns
↓

Returns: Risk Score + Scam Type + Action

## 🏗️ **Tech Stack**

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI (Python) |
| **AI/ML** | Hugging Face Transformers, NLP models |
| **APIs** | VirusTotal, URLScan.io |

## 🎯 **Impact**

ScamSense protects:
- 🎓 **Students** from scholarship scams
- 👴 **Elderly users** from impersonation
- 💳 **UPI users** from QR/phishing fraud
- 🏪 **Small businesses** from vendor scams

> **👉 Preventing even *one* scam saves real money and builds trust.**

## 🧠 **What Makes Us Unique**

**Hybrid Fraud Detection System:**
🤖 AI understands context & intent
📏 Rules catch known patterns
✅ Combined = Faster + Accurate + Explainable

## 🔮 **Future Roadmap**

| Phase | Features |
|-------|----------|
| **Q2 2026** | 🤖 WhatsApp Bot |
| **Q3 2026** | 📱 Android SMS Scanner |
| **Q4 2026** | 🏛️ Government NCRP Integration |
| **2027** | 📲 Full Mobile App |

## ⚙️ **Quick Setup**

### **Prerequisites**
- Python 3.8+
- Node.js 17+
- Git

### **1. Clone & Setup**
```bash
git clone https://github.com/your-username/scamsense.git
cd scamsense
```

### **2. Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Runs on: http://127.0.0.1:8000
```

### **3. Frontend**
```bash
cd ../frontend
npm install
npm run dev
# Runs on: http://localhost:5173
```

### **4. Environment**
Create `backend/.env`:
```env
VIRUSTOTAL_API_KEY=your_api_key
URLSCAN_API_KEY=your_api_key
```

## 📱 **Demo**
Visit [http://localhost:5173](http://localhost:5173) after setup!



## 🙏 **Team**
**TEAM HACKHERS (CC3H-173)**  
*Building safer digital India*

**⭐ Star us | 📢 Join community | 💬 Report issues**
