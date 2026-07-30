# 🛠️ Fixora — AI-Powered Hyperlocal Problem Solver

<p align="center">
  <a href="https://fixora725.vercel.app/" target="_blank">
    <img src="https://raw.githubusercontent.com/VishnudevButla/Fixora/main/public/favicon.svg" alt="Fixora Logo" width="120">
  </a>
</p>

<p align="center">
An AI-powered civic engagement platform that enables citizens to report, verify, and track local infrastructure issues in real time.
</p>

<p align="center">

Built for the **Google × Coding Ninjas Vibe2Ship Hackathon** under the **Community Hero** problem statement.

</p>

---

# 🌐 Live Demo

**🔗 Website:** https://fixora725.vercel.app/

---

# 📌 Overview

Every day, communities face problems such as potholes, overflowing garbage bins, broken streetlights, damaged roads, and water leakages. Unfortunately, reporting these issues is often fragmented, lacks transparency, and rarely provides updates.

**Fixora** bridges this gap by providing an AI-powered platform where citizens can report civic issues with just a single photograph.

Using **Google Gemini AI**, the uploaded image is automatically analyzed to determine:

* Issue Category
* Severity Level
* Description

The issue is then geo-tagged, publicly visible on the community map, and remains trackable until it is resolved.

This creates a transparent ecosystem connecting citizens and authorities while encouraging community participation through gamification.

---

# ✨ Features

### 📸 AI Issue Detection

Upload a photo and let **Google Gemini AI** automatically identify:

* Issue category
* Severity
* Description

---

### 🗺️ Interactive Community Map

* View all nearby issues
* Geo-tagged reports
* Live location pins
* Filter by issue category

---

### ✅ Community Verification

Instead of creating duplicate reports, nearby users can verify existing issues to increase their visibility and priority.

---

### 📊 Analytics Dashboard

Visualize community insights including:

* Total reports
* Resolution rate
* Category distribution
* Reporting trends
* Community impact

---

### 🏆 Leaderboard & Gamification

Citizens earn points for:

* Reporting issues
* Verifying reports
* Contributing consistently

Top contributors appear on the community leaderboard.

---

### 🔐 Secure Authentication

Firebase Authentication provides secure login and account management.

---

### 👤 User Profiles

Every user has a profile containing:

* Report history
* Contribution score
* Earned points
* Verified reports

---

### ⚡ Real-Time Updates

Issue status updates instantly across every connected client using Firebase Firestore.

Status Flow:

```
Reported
     │
     ▼
In Progress
     │
     ▼
Resolved
```

---

# 🛠 Tech Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| Frontend       | React + Vite            |
| Styling        | Tailwind CSS + CSS      |
| Backend        | Firebase                |
| Database       | Firestore               |
| Authentication | Firebase Authentication |
| AI             | Google Gemini API       |
| Maps           | React Leaflet           |
| Routing        | React Router            |
| Deployment     | Vercel                  |

---

# 📂 Project Structure

```
Fixora
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── package.json
├── vite.config.js
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js (v18+)
* npm or yarn
* Firebase Project
* Google Gemini API Key

---

## Installation

Clone the repository

```bash
git clone https://github.com/VishnudevButla/Fixora.git
```

Move into the project

```bash
cd Fixora
```

Install dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```env
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_MESSAGING_SENDER_ID=

VITE_FIREBASE_APP_ID=

VITE_GEMINI_API_KEY=
```

---

## Run Development Server

```bash
npm run dev
```

Application runs on

```
http://localhost:5173
```

---

## Production Build

```bash
npm run build
```

---

# ☁️ Deployment

Deploy easily using **Vercel**.

Remember to configure all environment variables inside

```
Project Settings
      ↓
Environment Variables
```

After saving, redeploy the application.

---

# 🔄 Workflow

```text
Citizen
   │
   ▼
Upload Image
   │
   ▼
Gemini AI Analysis
   │
   ▼
Category + Severity + Description
   │
   ▼
Review Report
   │
   ▼
Save to Firestore
   │
   ▼
Live Community Map
   │
   ▼
Community Verification
   │
   ▼
Authority Resolution
   │
   ▼
Status Updated
```

---

# 🎯 Why Fixora?

✔ AI-assisted reporting

✔ One-click issue submission

✔ Transparent issue tracking

✔ Real-time updates

✔ Community participation

✔ Gamification

✔ Data-driven civic insights

---

# 📈 Future Roadmap

* Municipal Authority Dashboard
* AI Duplicate Detection
* Predictive Hotspot Detection
* WhatsApp Reporting
* SMS Reporting
* Multi-language Support
* Push Notifications
* Offline Report Submission
* AI Priority Recommendation
* Public API for Municipal Corporations

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a new feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is released for educational, research, and demonstration purposes.

---

# 🙏 Acknowledgements

* Google Gemini AI
* Firebase
* React
* Vite
* React Leaflet
* Google × Coding Ninjas Vibe2Ship Hackathon

---

<p align="center">

Made with ❤️ to build smarter communities.

</p>
