# 🗺️ Fleet Management System - Project Map

**Last Updated:** January 9, 2026

---

## 📁 Complete Directory Structure

```
fleet-management-system/
│
├── 📄 Root Configuration Files
│   ├── package.json                 # Monorepo workspace definition & npm scripts
│   ├── tsconfig.json               # TypeScript root config
│   ├── tsconfig.app.json           # App TypeScript config
│   ├── tsconfig.node.json          # Node TypeScript config
│   ├── vite.config.ts              # Vite build configuration
│   ├── eslint.config.js            # ESLint configuration
│   ├── postcss.config.js           # PostCSS config (Tailwind)
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── next.config.js              # Next.js config (unused for now)
│   ├── .env.example                # Environment variables template
│   ├── .env.local                  # Local environment (git ignored)
│   ├── .gitignore                  # Git ignore rules
│   └── preload.js                  # Electron preload script
│
├── 📂 .github/
│   ├── copilot-instructions.md     # AI agent instructions (CRITICAL)
│   └── PROJECT_MAP.md              # This file
│
├── 📂 backend/                     # Node.js/Express REST API
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json               # Backend TypeScript config
│   ├── login-server.mjs            # ⭐ LOGIN PAGE SERVER (port 3000)
│   │
│   ├── 📂 src/
│   │   ├── index.ts                # Express app entry point (stubs - not in use)
│   │   │
│   │   ├── 📂 db/
│   │   │   └── connection.ts       # PostgreSQL pool & schema creation
│   │   │
│   │   ├── 📂 middleware/
│   │   │   └── errorHandler.ts     # Error handling & asyncHandler utility
│   │   │
│   │   ├── 📂 models/              # Empty - for future database models
│   │   │   └── (to be implemented)
│   │   │
│   │   └── 📂 routes/              # 🔴 API ROUTE STUBS (TODO: wire up)
│   │       ├── auth.ts             # Auth endpoints (register, login, refresh)
│   │       ├── vehicles.ts         # Vehicle CRUD & status management
│   │       ├── drivers.ts          # Driver management
│   │       ├── fuel.ts             # Fuel logging
│   │       ├── maintenance.ts      # Maintenance tracking
│   │       ├── insurance.ts        # Insurance management
│   │       └── reports.ts          # Report generation
│   │
│   └── 📂 dist/                    # Compiled JavaScript (generated)
│
├── 📂 web/                         # Next.js Dashboard (Web App)
│   ├── package.json                # Web dependencies
│   ├── tailwind.config.ts          # Tailwind config for web
│   │
│   └── 📂 app/                     # Next.js App Router structure
│       ├── page.tsx                # Home/dashboard page
│       ├── layout.tsx              # Root layout wrapper
│       ├── globals.css             # Global styles & Tailwind
│       │
│       ├── 📂 dashboard/           # Dashboard section
│       │   └── (pages to be created)
│       │
│       ├── 📂 vehicles/            # Vehicle management
│       │   └── (pages to be created)
│       │
│       ├── 📂 drivers/             # Driver management
│       │   └── (pages to be created)
│       │
│       ├── 📂 reports/             # Reports & analytics
│       │   └── (pages to be created)
│       │
│       ├── 📂 components/          # Reusable React components
│       │   └── (to be created)
│       │
│       └── 📂 lib/                 # Utility functions & API helpers
│           └── (to be created)
│
├── 📂 mobile/                      # React Native/Expo Driver App
│   ├── package.json                # Mobile dependencies
│   ├── app.json                    # Expo configuration
│   │
│   └── 📂 src/
│       ├── 📂 screens/             # Driver app screens
│       │   └── (to be created)
│       │
│       ├── 📂 navigation/          # React Navigation setup
│       │   └── (to be created)
│       │
│       ├── 📂 store/               # Zustand state management
│       │   └── (to be created)
│       │
│       ├── 📂 components/          # React Native components
│       │   └── (to be created)
│       │
│       └── 📂 utils/               # Helper functions
│           └── (to be created)
│
├── 📂 src/                         # Vite/React UI (for Electron)
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root React component
│   ├── index.css                   # Global styles
│   ├── vite-env.d.ts               # Vite type definitions
│   │
│   ├── 📂 assets/
│   │   └── 📂 images/              # Image assets
│   │
│   └── 📂 components/              # React components
│
├── 📂 public/                      # Static assets
│   └── 📂 assets/
│       └── 📂 images/              # Public images
│
├── 📂 docs/                        # Project documentation
│
├── main.js                         # Electron main process entry point
├── index.html                      # Electron app HTML template
├── eslint.config.js                # ESLint config
├── README.md                       # Project README (300+ lines)
├── QUICKSTART.md                   # 5-minute setup guide
├── TRANSFORMATION_SUMMARY.md       # Project transformation history
└── PROJECT_PLAN.md                 # Detailed project plan & phases

```

---

## 🔑 Key Files by Purpose

### 🌐 **Frontend Entry Points**
- **Electron:** `main.js` → `src/main.tsx` → `App.tsx`
- **Vite Dev Server:** `src/main.tsx` (port 5173)
- **Login Page:** `backend/login-server.mjs` (port 3000) ⭐

### 🔌 **Backend Entry Points**
- **Login Server:** `backend/login-server.mjs` ⭐ (currently active)
- **Express API:** `backend/src/index.ts` (stubs - not wired yet)
- **Database:** `backend/src/db/connection.ts` (auto-creates tables on startup)

### 📦 **Configuration Files**
| File | Purpose |
|------|---------|
| `package.json` | Monorepo workspaces & npm scripts |
| `backend/package.json` | Backend dependencies (Express, PostgreSQL, JWT) |
| `web/package.json` | Web dependencies (Next.js, Tailwind, Axios) |
| `mobile/package.json` | Mobile dependencies (Expo, React Native, Zustand) |
| `.env.example` | Environment template for all services |
| `vite.config.ts` | Vite bundler for Electron UI |
| `tsconfig.json` | TypeScript configuration |

### 📚 **Documentation**
| File | Content |
|------|---------|
| `README.md` | Complete project guide (300+ lines) |
| `QUICKSTART.md` | 5-minute setup instructions |
| `TRANSFORMATION_SUMMARY.md` | History of Jayflix → Fleet Management transition |
| `PROJECT_PLAN.md` | Detailed 9-phase roadmap |
| `.github/copilot-instructions.md` | AI agent instructions |
| `.github/PROJECT_MAP.md` | This file - project structure reference |

---

## 📋 **Active Services (Currently Running)**

| Service | Port | Status | Command |
|---------|------|--------|---------|
| **Login Server** | 3000 | ✅ Running | `cd backend && PORT=3000 node login-server.mjs` |
| **Vite Dev UI** | 5173 | ✅ Running | `npm run dev:ui` |
| **Electron App** | — | ✅ Running | `npm run dev:electron` |
| **Express API** | 3000 | ⏳ TODO | `npm run dev:backend` (needs ts-node) |
| **Next.js Web** | 3001 | ⏳ TODO | `npm run dev:web` |
| **Expo Mobile** | — | ⏳ TODO | `npm run dev:mobile` |

---

## 🗄️ **Database Schema (PostgreSQL)**

Auto-created on backend startup:
```
users
├── id (PRIMARY KEY)
├── username (UNIQUE)
├── password_hash
├── email (UNIQUE)
├── role (admin, fleet_manager, driver, auditor)
├── created_at, updated_at

drivers
├── id (PRIMARY KEY)
├── user_id (FOREIGN KEY → users)
├── license_number (UNIQUE)
├── license_expiry
├── retirement_date
├── assigned_vehicle_id
├── status (available, in-use, retired)
├── created_at, updated_at

vehicles
├── id (PRIMARY KEY)
├── registration_number (UNIQUE)
├── make, model, year
├── status (available, in-use, under-maintenance, out-of-service)
├── mileage
├── fuel_type
├── tank_capacity
├── created_at, updated_at

fuel_logs
├── id (PRIMARY KEY)
├── vehicle_id (FOREIGN KEY → vehicles)
├── driver_id (FOREIGN KEY → drivers)
├── liters, cost, odometer
├── receipt_photo_url
├── date, created_at

maintenance_logs
├── id (PRIMARY KEY)
├── vehicle_id (FOREIGN KEY → vehicles)
├── service_type, cost, date, notes
├── created_at

insurance
├── id (PRIMARY KEY)
├── vehicle_id (FOREIGN KEY → vehicles)
├── provider, policy_number
├── expiry_date, coverage_amount
├── created_at, updated_at
```

---

## 🚀 **NPM Scripts Reference**

```bash
# Install
npm install                    # Install root dependencies
npm run install-workspaces    # Install all workspace dependencies

# Development
npm run dev                    # Start all services (backend + web + mobile)
npm run dev:backend          # Start Express API (port 3000)
npm run dev:web              # Start Next.js (port 3001)
npm run dev:ui               # Start Vite (port 5173)
npm run dev:electron         # Start Electron app
npm run dev:desktop          # Start all: backend + Vite + Electron
npm run dev:mobile           # Start Expo (mobile)

# Build
npm run build                # Build all workspaces
npm run build:backend        # Build backend only
npm run build:web            # Build web only
npm run build:mobile         # Build mobile only

# Testing & Linting
npm test                     # Run all tests
npm run lint                 # Lint all workspaces
```

---

## 📍 **Where to Find Things**

### Need to modify the login page?
→ `backend/login-server.mjs` (line ~17: `const loginPage = ...`)

### Need to add a new API route?
→ `backend/src/routes/<feature>.ts` (then wire in `backend/src/index.ts`)

### Need to add a database query?
→ Create `backend/src/models/<feature>.ts` (use `pool` from `db/connection.ts`)

### Need to build a web page?
→ Create `.tsx` in `web/app/<feature>/page.tsx` (Next.js App Router)

### Need to add mobile screens?
→ Create component in `mobile/src/screens/<Screen>.tsx`

### Need to modify environment variables?
→ Edit `backend/.env` (copy from `.env.example` first)

### Need to check project structure in the future?
→ **This file:** `.github/PROJECT_MAP.md`

---

## 🔄 **Project Phase Status**

| Phase | Name | Status | ETA |
|-------|------|--------|-----|
| 1 | Requirements & Design | ✅ Complete | Dec 2025 |
| 2 | Database & Backend | 🔄 In Progress | Jan 2026 |
| 3 | Web Dashboard | ⏳ Pending | Feb 2026 |
| 4 | Mobile App | ⏳ Pending | Mar 2026 |
| 5 | Notifications & Alerts | ⏳ Pending | Apr 2026 |
| 6 | Reports & Analytics | ⏳ Pending | May 2026 |
| 7 | Weather Integration | ⏳ Pending | May 2026 |
| 8 | Testing & Deployment | ⏳ Pending | Jun 2026 |
| 9 | Future Enhancements | 📝 Planned | Q3+ 2026 |

---

## 💡 **Quick Reference**

**To access the running app:**
- Browser: http://localhost:3000 (login page)
- Browser: http://localhost:5173 (Vite UI)

**Default login credentials:**
- Username: `admin`
- Password: `password`

**Database connection:**
```bash
psql -U postgres -d fleet_management
```

---

**Created for:** Fast reference & AI agent memory
**Format:** Markdown
**Last Updated:** January 9, 2026
