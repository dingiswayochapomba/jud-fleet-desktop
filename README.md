# 🚗 Fleet Management System for Malawi Judiciary

A comprehensive **Desktop Application** for managing the transportation fleet of the Malawi Judiciary. Track vehicles, drivers, fuel consumption, maintenance, insurance, and generate detailed reports. **Now with full Supabase authentication!**

---

## ✨ Latest Updates

**January 9, 2026:**
- ✅ **Full Supabase Authentication** - Complete login system with session management
- ✅ **Dashboard Ready** - Professional UI with fleet summary cards
- ✅ **30+ Database Functions** - Complete query library for all operations
- ✅ **Production Ready** - Error handling, loading states, responsive design

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Development](#development)
6. [Authentication](#authentication)
7. [Database](#database)
8. [Documentation](#documentation)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

**Result:**
- Vite dev server launches on http://localhost:5173
- Electron desktop app launches automatically

### 3. Login with Demo Account
```
📧 Email: dingiswayochapomba@gmail.com
🔐 Password: @malawi2017
```

**Done!** You're now authenticated and can use the full dashboard.

---

## ✨ Features

### Authentication ✅ COMPLETE
- Email/password login with Supabase
- Secure session management
- Automatic session persistence
- User profile loading from database
- Role-based user display (Admin, Manager, Driver)
- Professional login UI
- Error handling and validation

### Dashboard ✅ READY
- Fleet summary statistics
- Vehicle status cards
- Driver information
- Responsive design
- User profile display
- Feature overview

### Database Integration ✅ COMPLETE
- 8 core tables (users, vehicles, drivers, maintenance, insurance, fuel_logs, etc.)
- 5 SQL views for reporting
- 30+ query functions
- Complete CRUD operations
- Analytics and reporting

### Ready to Build 🚀
- Vehicle management pages
- Driver management interface
- Fuel tracking dashboard
- Maintenance scheduling
- Insurance management
- Reports generation

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Desktop** | Electron 27 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (JWT) |
| **HTTP Client** | Axios |

---

## 📂 Project Structure

```
fleet-management-system/
├── src/
│   ├── App.tsx                    # Main app with dashboard
│   ├── components/
│   │   └── Login.tsx              # Supabase authentication
│   ├── lib/
│   │   └── supabaseQueries.ts     # 30+ database functions
│   ├── assets/
│   └── index.css
│
├── public/
│   └── assets/                    # Images and files
│
├── main.js                        # Electron main process
├── preload.js                     # Electron preload
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
│
├── database-schema.sql            # PostgreSQL schema
├── seed-admin-user.sql            # User creation script
├── seed-admin-user.js             # User creation script
│
├── docs/
├── AUTHENTICATION.md              # Auth guide (367 lines)
├── QUICK_START.md                 # 3-step setup
├── DATABASE_SCHEMA.md             # Database reference
├── SEED_USERS.md                  # User creation guide
├── IMPLEMENTATION_SUMMARY.md      # Complete summary
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── README.md                      # This file
```

---

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Supabase validates credentials
3. JWT session created
4. User profile loaded from database
5. Dashboard displays with user info

### Features
✅ Session persistence across reloads  
✅ Automatic session refresh  
✅ Role-based access control  
✅ Secure logout  
✅ Error handling  
✅ Responsive UI  

**See `AUTHENTICATION.md` for complete details**

---

## 💾 Database

### Schema (8 Tables + 5 Views)
- `users` - User accounts with roles
- `vehicles` - Fleet vehicles
- `drivers` - Driver information
- `vehicle_assignments` - Driver-vehicle mapping
- `maintenance` - Service records
- `insurance` - Policy management
- `fuel_logs` - Fuel tracking
- `notifications` - User alerts

### Available Views
- `fleet_summary` - Overall statistics
- `active_assignments` - Current assignments
- `drivers_expiring_licenses` - License alerts
- `vehicles_overdue_maintenance` - Maintenance alerts
- `vehicles_expired_insurance` - Insurance alerts

**See `DATABASE_SCHEMA.md` for complete reference**

---

## 🔧 Available Functions

### 30+ Database Functions

**Vehicles:**
```tsx
getAllVehicles()          // Fetch all vehicles
getVehiclesByStatus()     // Filter by status
createVehicle()           // Add new vehicle
updateVehicle()           // Update vehicle
```

**Drivers:**
```tsx
getAllDrivers()           // Fetch all drivers
getDriversByStatus()      // Filter by status
createDriver()            // Add new driver
```

**Analytics:**
```tsx
getFleetSummary()         // Overall stats
getDriversExpiringLicenses()  // Alert system
getFuelConsumptionStats() // Fuel analytics
```

**See `src/lib/supabaseQueries.ts` for all 30+ functions**

---

## 📚 Documentation

| File | Purpose | Size |
|------|---------|------|
| `QUICK_START.md` | 3-step setup guide | 245 lines |
| `AUTHENTICATION.md` | Complete auth reference | 367 lines |
| `DATABASE_SCHEMA.md` | Schema and queries | 500+ lines |
| `IMPLEMENTATION_SUMMARY.md` | Complete overview | 409 lines |
| `SEED_USERS.md` | User creation guide | 300+ lines |

---

## 🚦 Development

### Start Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

---

## 🧪 Testing

### Login Testing Checklist
- [ ] App loads with login screen
- [ ] Login with demo credentials works
- [ ] Dashboard shows after successful login
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Can re-login after logout
- [ ] Error messages display correctly

### More Detailed Testing
**See `AUTHENTICATION.md` for complete testing guide**

---

## 🚀 Deployment
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
