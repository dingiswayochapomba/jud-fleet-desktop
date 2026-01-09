# 🚗 Fleet Management System for Malawi Judiciary

A comprehensive **Web + Mobile** solution for managing the transportation fleet of the Malawi Judiciary. Track vehicles, drivers, fuel consumption, maintenance, insurance, and generate detailed reports.

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Phase Breakdown](#phase-breakdown)
4. [Getting Started](#getting-started)
5. [Development](#development)
6. [Deployment](#deployment)
7. [Key Features](#key-features)
8. [Database Schema](#database-schema)

---

## 🏗️ Project Structure

This is a **monorepo** with three main workspaces:

```
fleet-management-system/
├── backend/          # Node.js/Express REST API
│   ├── src/
│   │   ├── routes/        (auth, vehicles, drivers, fuel, maintenance, insurance, reports)
│   │   ├── models/        (database models and queries)
│   │   ├── middleware/    (auth, error handling, validation)
│   │   └── db/            (PostgreSQL connection & schema)
│   ├── package.json
│   └── tsconfig.json
│
├── web/              # Next.js Admin/Manager Dashboard
│   ├── app/
│   │   ├── dashboard/      (fleet overview, alerts)
│   │   ├── vehicles/       (CRUD vehicles, status updates)
│   │   ├── drivers/        (driver management, retirement alerts)
│   │   ├── reports/        (PDF/Excel export)
│   │   └── page.tsx        (home page)
│   ├── components/
│   ├── lib/
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/           # React Native Driver App
│   ├── src/
│   │   ├── screens/        (login, dashboard, fuel logging, notifications)
│   │   ├── components/
│   │   ├── navigation/
│   │   └── store/          (Zustand state management)
│   ├── app.json            (Expo config)
│   ├── package.json
│   └── tsconfig.json
│
├── docs/             # Project documentation
├── .github/copilot-instructions.md
└── package.json      (monorepo root)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | Next.js 14 + React 18 | Admin dashboard, reports |
| **Frontend (Mobile)** | React Native (Expo) | Driver app, fuel logging, push notifications |
| **Backend** | Node.js + Express | REST API for all operations |
| **Database** | PostgreSQL | Fleet data, users, fuel logs, maintenance, insurance |
| **Auth** | JWT + bcryptjs | Role-based access (Admin, Manager, Driver, Auditor) |
| **Storage** | Firebase Storage | Receipt photos, insurance documents |
| **Notifications** | Firebase Cloud Messaging | Push alerts, email notifications |
| **Hosting** | Vercel (web), Play Store (mobile), Render/AWS (API) | Production deployment |

---

## 📌 Phase Breakdown

### **Phase 1: Requirements & Design** ✅ COMPLETED
- Define user roles: Admin, Fleet Manager, Driver, Viewer
- Design database schema (vehicles, drivers, fuel, maintenance, insurance, users)
- Create mockups and UI/UX specifications

### **Phase 2: Database & Backend Setup** 🔄 IN PROGRESS
- [x] Create PostgreSQL database schema
- [x] Build REST API (Express.js) with core routes
- [ ] Implement authentication (JWT + role-based access)
- [ ] Add validation & error handling
- [ ] Set up Firebase admin SDK for notifications

### **Phase 3: Web App (Next.js)**
- [ ] Dashboard with fleet status and alerts
- [ ] Vehicle management (CRUD, status updates)
- [ ] Maintenance scheduling and tracking
- [ ] Insurance management with reminders
- [ ] Fuel tracking and consumption analytics
- [ ] Driver management and retirement alerts
- [ ] Reports generation (PDF/Excel)

### **Phase 4: Mobile App (React Native)**
- [ ] Driver login and authentication
- [ ] Driver dashboard (assigned vehicle, status)
- [ ] Fuel logging with receipt photo upload
- [ ] Push notifications for assignments/alerts
- [ ] Driver profile and license info display
- [ ] Location-based vehicle tracking (future)

### **Phase 5: Notifications & Alerts**
- [ ] Web alerts (insurance expiry, maintenance overdue)
- [ ] Firebase Cloud Messaging (FCM) for push notifications
- [ ] Email notifications to managers
- [ ] Real-time WebSocket updates (optional)

### **Phase 6: Reports & Analytics**
- [ ] Fleet usage reports
- [ ] Fuel consumption analysis (km/litre, anomaly detection)
- [ ] Maintenance cost reports
- [ ] Driver performance reports
- [ ] PDF/Excel export functionality

### **Phase 7: Weather Integration**
- [ ] OpenWeatherMap API integration
- [ ] Display weather at vehicle last location
- [ ] Alert system for storms/heavy rain

### **Phase 8: Testing & Deployment**
- [ ] Unit tests (backend + web)
- [ ] E2E testing (web app)
- [ ] Pilot launch with judiciary staff
- [ ] Production deployment
- [ ] Training and documentation

### **Phase 9: Future Enhancements**
- [ ] Real-time GPS tracking
- [ ] AI-powered maintenance forecasting
- [ ] Expense tracking (tyres, oil, etc.)
- [ ] Driver performance monitoring
- [ ] HR system integration

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12 (for backend database)
- **npm** >= 9.0.0
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd fleet-management-system
```

2. **Install monorepo dependencies**
```bash
npm install
npm run install-workspaces
```

3. **Set up environment variables**

Create `.env` files in each workspace:

**`backend/.env`**
```
PORT=3000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleet_management
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key
```

**`web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=Fleet Management System
```

**`mobile/.env`**
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_FIREBASE_CONFIG={...}
```

4. **Create PostgreSQL database**
```bash
createdb fleet_management
```

The backend will automatically run migrations on startup.

---

## 👨‍💻 Development

### Start all services (Backend + Web)
```bash
npm run dev
```

This will start:
- Backend API: `http://localhost:3000`
- Web Dashboard: `http://localhost:3001`
- Mobile (via Expo): Follow terminal instructions

### Start individual services
```bash
npm run dev:backend   # Backend API only
npm run dev:web       # Next.js dashboard only
npm run dev:mobile    # React Native app (Expo)
```

### Build for production
```bash
npm run build         # Build all
npm run build:backend # Backend only
npm run build:web     # Web only
npm run build:mobile  # Mobile only
```

### Testing
```bash
npm test              # Run all tests
npm run test:backend  # Backend tests only
```

### Linting
```bash
npm run lint          # Lint all workspaces
```

---

## 📤 Deployment

### Backend (Node.js API)
**Option 1: Render.com** (recommended for free tier)
```bash
# Push to GitHub, connect Render account
# Set environment variables in Render dashboard
# Deploy automatically on push
```

**Option 2: AWS / Heroku**
```bash
npm run build:backend
# Follow provider's deployment steps
```

### Web (Next.js)
**Deploy to Vercel** (recommended)
```bash
npm install -g vercel
vercel deploy
```

Or via GitHub:
- Push to GitHub
- Connect Vercel to your repo
- Automatic deployments on push

### Mobile (React Native / Expo)
**Build & Publish**
```bash
eas build --platform android  # Android APK/AAB
eas build --platform ios      # iOS app
eas submit --platform android # Submit to Play Store
```

**Or build locally:**
```bash
npm run build:android
npm run build:ios
```

---

## ✨ Key Features

### **Web Dashboard (Admin/Manager)**
✅ Fleet status overview (available, in-use, under maintenance, broken)
✅ Real-time alerts (insurance expiry, maintenance overdue)
✅ Vehicle management (add, edit, delete, update status)
✅ Maintenance scheduling and tracking
✅ Insurance management with document upload
✅ Fuel consumption analytics
✅ Driver management and retirement alerts
✅ Comprehensive reporting (PDF/Excel export)
✅ Weather widget for current location
✅ Role-based access control (Admin, Manager, Viewer)

### **Mobile App (Driver)**
✅ Driver login with role-based authentication
✅ View assigned vehicle and status
✅ Log fuel entries (litres, cost, odometer, receipt photo)
✅ Push notifications for assignments and alerts
✅ Driver profile and license expiry info
✅ Offline-first architecture (sync when online)
✅ Real-time updates via WebSocket

### **Backend API**
✅ JWT-based authentication
✅ Role-based authorization
✅ RESTful API design
✅ Database validation
✅ Error handling & logging
✅ Firebase integration (notifications)
✅ Image upload handling

---

## 🗄️ Database Schema

### Core Tables

**`users`** - System users (admin, manager, driver, viewer)
- id, username, password_hash, email, full_name, role, active, created_at

**`drivers`** - Driver information
- id, user_id, license_number, license_expiry, retirement_date, phone, address, assigned_vehicle_id, status

**`vehicles`** - Fleet vehicles
- id, registration_number, make, model, year, chassis_number, engine_number, status, mileage, fuel_type, tank_capacity, purchase_date, insurance_expiry, next_service_date

**`fuel_logs`** - Fuel refueling records
- id, vehicle_id, driver_id, liters, cost, odometer, date_refueled, receipt_url, notes

**`maintenance_logs`** - Vehicle maintenance records
- id, vehicle_id, service_type, description, cost, service_date, next_service_date, completed_by, status

**`insurance`** - Vehicle insurance records
- id, vehicle_id, provider, policy_number, cover_amount, start_date, expiry_date, document_url

---

## 📞 Support & Contributions

For questions or issues, please:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Contact the development team

---

## 📄 License

This project is proprietary software for the Malawi Judiciary. All rights reserved.

---

## 🎯 Next Steps

1. **Set up PostgreSQL** database locally
2. **Configure environment variables** for each workspace
3. **Install dependencies**: `npm install && npm run install-workspaces`
4. **Start development**: `npm run dev`
5. **Test API**: Visit `http://localhost:3000/health`
6. **Test Dashboard**: Visit `http://localhost:3001`

---

**Built with ❤️ for Malawi Judiciary Fleet Management**
