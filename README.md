# Fixora 🛠️ — Hyperlocal Problem Solver

> An AI-powered civic engagement platform that helps citizens report, verify, and track local infrastructure issues — turning silent complaints into visible, trackable action.

Built for the **Vibe2Ship Hackathon** by Google & Coding Ninjas, under the "Community Hero" problem statement.

---

## 📖 About

Communities frequently face issues like potholes, water leakages, damaged streetlights, and waste management problems — but reporting them is fragmented, hard to track, and lacks transparency. Fixora solves this by letting citizens report an issue with a single photo, using AI to automatically classify and route it, then tracking it publicly from report to resolution.

---

## ✨ Features

- 📸 **AI-Powered Issue Reporting** — Upload a photo of a civic issue; Gemini AI auto-detects the category, severity, and description
- 🗺️ **Interactive Map View** — See all reported issues geo-tagged on a live community map
- ✅ **Community Verification** — Citizens can confirm existing reports instead of creating duplicates
- 📊 **Impact Dashboard** — Visualize issue trends, category breakdowns, and resolution rates
- 🏆 **Leaderboard & Gamification** — Earn points for reporting and verifying issues; compete with other community members
- 🔐 **Authentication** — Secure login via Firebase Auth
- 👤 **User Profiles** — Track your own reported issues, points, and contribution history
- ⚡ **Real-Time Updates** — Issue status changes reflect instantly across the app via Firestore

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | CSS / Tailwind |
| Backend & Database | Firebase (Firestore, Authentication) |
| AI | Google Gemini API |
| Routing | React Router |
| Deployment | Vercel |

---

## 📁 Project Structure

```
fixora/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Images, logos, static assets
│   ├── components/
│   │   ├── common/          # Shared/reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── layout/          # Navbar, footer, page layout wrappers
│   │   ├── map/             # Map and pin-related components
│   │   └── report/          # Issue reporting form components
│   ├── context/
│   │   └── AuthContext.jsx  # Global authentication state
│   ├── hooks/                # Custom React hooks
│   ├── pages/
│   │   ├── Landing.jsx       # Public landing page
│   │   ├── Login.jsx         # Authentication page
│   │   ├── MapPage.jsx        # Interactive issue map
│   │   ├── ReportIssue.jsx    # AI-powered issue reporting form
│   │   ├── Dashboard.jsx      # Impact dashboard with stats/charts
│   │   ├── Leaderboard.jsx    # Community leaderboard
│   │   ├── Profile.jsx        # User profile and report history
│   │   └── NotFound.jsx       # 404 page
│   ├── services/
│   │   ├── firebase.js        # Firebase config & initialization
│   │   ├── gemini.js          # Gemini AI API integration
│   │   └── issueService.js    # Firestore CRUD operations for issues
│   ├── utils/                 # Helper functions
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env                       # Environment variables (not committed)
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project (Firestore + Authentication enabled)
- A Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VishnudevButla/Fixora.git
   cd fixora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory and add:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔑 Environment Variables on Vercel

When deploying, add the same variables listed above under **Project Settings → Environment Variables** in your Vercel dashboard, then redeploy.

---

## 🗺️ How It Works

1. A citizen opens the app and views the live issue map
2. They tap **Report Issue** and upload a photo of a problem (pothole, leak, etc.)
3. The photo is sent to **Gemini AI**, which returns a structured category, severity, and description
4. The form auto-fills; the user reviews and submits
5. The issue is geo-tagged and saved to **Firestore**, instantly appearing on the map
6. Other users can verify the issue, boosting its visibility
7. Status updates (Reported → In Progress → Resolved) sync in real time across all connected clients
8. Points are awarded and reflected on the **Leaderboard**

---

## 🛣️ Roadmap

- [ ] Municipal authority dashboard for issue assignment and resolution
- [ ] AI-based duplicate issue detection
- [ ] Predictive insights for emerging problem hotspots
- [ ] SMS/WhatsApp-based reporting for non-smartphone users
- [ ] Multi-language support

---

## 🤝 Contributing

This project was built for a hackathon. Contributions, suggestions, and forks are welcome — open an issue or submit a pull request.

---

## 📄 License

This project is open source and available for educational and demonstration purposes.

---

## 🙏 Acknowledgements

Built with React, Vite, Firebase, and Google Gemini for the **Vibe2Ship Hackathon** by Google & Coding Ninjas.

---

<details>
<summary><strong>⚙️ Vite Template Details</strong></summary>

### React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performance. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

</details>
