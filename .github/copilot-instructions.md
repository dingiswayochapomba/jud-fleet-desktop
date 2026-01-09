<!-- Copilot / AI agent instructions for Fleet Management System -->

# 🚗 Fleet Management System — AI Agent Instructions

**Last Updated:** January 9, 2026

## Quick Orientation

This is a **monorepo** managing a fleet for the Malawi Judiciary with three independent services:
- **Backend:** Node.js/Express REST API (port 3000, PostgreSQL, JWT auth)
- **Web:** Next.js dashboard for admins/managers (port 3001)
- **Mobile:** React Native driver app with Expo (fuel logging, GPS, push notifications)

**Current Phase:** Phase 2 (Database & Backend) in progress; Phases 3-9 pending

---

## 📂 Key Files & Structure

### **Monorepo Root**
- `package.json` — workspace scripts: `dev`, `dev:backend`, `dev:web`, `dev:mobile`, `build`, `test`, `lint`
- `README.md` (300+ lines) — comprehensive architecture, phases 1-9, database schema
- `QUICKSTART.md` — 5-minute setup guide (database, env, npm install)
- `TRANSFORMATION_SUMMARY.md` — transformation from Jayflix to Fleet Management System
- `.github/copilot-instructions.md` — this file

### **Backend** (`backend/src/`)
- `index.ts` — Express app, login page, router registration (routes not yet wired in)
- `db/connection.ts` — PostgreSQL Pool config, auto-creates 6 tables on startup
- `routes/` — 7 stub route files (auth, vehicles, drivers, fuel, maintenance, insurance, reports)
- `middleware/errorHandler.ts` — error handling middleware, asyncHandler utility
- `models/` — currently empty (database layer to be implemented)

### **Web** (`web/app/`)
- `page.tsx` — dashboard homepage with fleet status cards (hardcoded data)
- `layout.tsx` — Next.js layout wrapper with global styles
- `globals.css` — Tailwind reset and custom styles
- `dashboard/`, `vehicles/`, `drivers/`, `reports/` — placeholder directories (pages not yet created)
- `components/`, `lib/` — utilities ready for building dashboard features

### **Mobile** (`mobile/src/`)
- `screens/` — directory for driver app screens (not yet populated)
- `navigation/` — navigation structure (not yet populated)
- `store/` — Zustand store setup (not yet populated)
- `app.json` — Expo config (Firebase, app name, permissions)

---

## 🚀 Development Workflows

### Initial Setup (Required Once)
```bash
# Install all workspaces
npm install
npm run install-workspaces

# Create PostgreSQL database (if not exists)
createdb fleet_management

# Copy environment template to backend
cp .env.example backend/.env
# Edit backend/.env: set DB_PASSWORD, JWT_SECRET
```

### Start All Services (Backend + Web + Mobile)
```bash
npm run dev
```
- Backend: `http://localhost:3000` (logs "Server running on port 3000")
- Web: `http://localhost:3001` (Next.js dashboard)
- Mobile: Expo Go app or simulator (follow terminal for QR code)

### Start Individual Services
```bash
npm run dev:backend   # Express API only (port 3000)
npm run dev:web       # Next.js dashboard (port 3001)
npm run dev:mobile    # Expo for mobile (TBD)
```

### Build for Production
```bash
npm run build         # Build all three workspaces
npm run build:backend # Backend only
npm run build:web     # Web only
npm run build:mobile  # Mobile only
```

### Database & Testing
```bash
# Connect to PostgreSQL
psql -U postgres -d fleet_management

# Run all tests
npm test

# Lint all workspaces
npm run lint
```

### Important: Routes Not Wired Yet
⚠️ API routes in `backend/src/routes/` are **stubs** with TODO comments. They are not imported/registered in `backend/src/index.ts`. When implementing:
1. Add route import to `backend/src/index.ts`
2. Register with `app.use('/api/<feature>', featureRoutes)`
3. Implement logic in the stub route files

---

## 🎨 Theme Colors & Styling Guidelines

### Tailwind Color Palette
**Primary Colors:**
- `blue-600` (#2563eb) — Main primary color for buttons, links, headers, highlights
- `blue-800` (#1e40af) — Darker shade for backgrounds, gradients, hover states

**Neutral Colors:**
- `gray-900` (#111827) — Text headings, primary text
- `gray-600` (#4b5563) — Secondary text, labels
- `gray-100` (#f3f4f6) — Light backgrounds
- `white` (#ffffff) — Primary background

**Status & Alert Colors:**
- `red-50` (#fef2f2) — Error backgrounds
- `red-200` (#fecaca) — Error borders
- `red-700` (#b91c1c) — Error text
- `green-600` (#16a34a) — Success indicators (when needed)
- `yellow-600` (#ca8a04) — Warning indicators (when needed)

**Gradients:**
- `from-blue-600 to-blue-800` — Login sidebar gradient, premium sections
- `bg-gradient-to-br` — Background to bottom-right direction

### Custom CSS Variables (in `src/index.css`)
```css
--brand-purple-1: #2b0b4a    /* Dark purple from original design */
--brand-purple-2: #5a1fbf    /* Bright purple accent */
--brand-accent: #ffcf33      /* Warm golden accent for highlights */
--scrollbar-thumb: rgba(20,20,20,0.95)  /* Scrollbar styling */
```

### Component Color Usage
- **Login Page:** Blue gradient (`from-blue-600 to-blue-800`), white form, red error messages
- **Buttons:** Blue background (`bg-blue-600`), white text, blue-800 on hover
- **Headers:** Gray-900 text, optional blue accent underline
- **Forms:** White background, gray-600 labels, blue-600 focus states
- **Cards:** White background, gray borders, blue-600 icons/badges
- **Errors:** Red-50 background, red-200 border, red-700 text
- **Disabled State:** Gray-100 background, gray-400 text

### Responsive Design
- **Mobile-first:** Design for mobile first, enhance for desktop
- **Breakpoints:** Use `md:` prefix for desktop features (see Login.tsx for example)
- **Spacing:** Use Tailwind spacing scale (4px base unit: p-4 = 1rem)
- **Icons:** Lucide React (import from 'lucide-react'), use `text-blue-600` for primary icons

### Dark Mode Considerations
Current app uses light theme. If dark mode needed in future:
- Invert backgrounds (white → dark gray/black)
- Invert text (gray-900 → light gray)
- Keep blue colors but use lighter shades (blue-400 instead of blue-600)
- Maintain contrast ratios for accessibility (WCAG AA minimum)

---

## 🔑 Current State & Implementation Patterns

### What's Built vs. TODO
✅ **Completed:**
- Monorepo structure with workspaces
- PostgreSQL database schema with 6 tables (users, drivers, vehicles, fuel_logs, maintenance_logs, insurance)
- Backend Express server with middleware (error handler, asyncHandler)
- 7 route file stubs (auth, vehicles, drivers, fuel, maintenance, insurance, reports)
- Web dashboard homepage with fleet status cards (hardcoded data)
- Mobile/Expo project structure

❌ **TODO (Phase 2 & Beyond):**
- Wire up routes in `backend/src/index.ts`
- Implement authentication (JWT login, register, refresh)
- Implement database queries in route handlers
- Create models layer for DB queries
- Build web dashboard pages (vehicles, drivers, reports)
- Implement mobile screens and navigation
- Firebase integration for notifications/storage

### User Roles & Access Control (Planned)
- **Admin:** Full system access
- **Fleet Manager:** Manage vehicles, drivers, fuel, maintenance, insurance
- **Driver:** Log fuel, view assigned vehicle, receive notifications
- **Auditor/Viewer:** Read-only access to reports
- **Implementation:** Role stored in `users.role` column, JWT token includes role, middleware validates access

### Database Schema (Already Created)
Tables auto-created on backend startup:
- **users** (id, username, password_hash, email, role, created_at, updated_at)
- **drivers** (id, user_id, license_number, license_expiry, retirement_date, assigned_vehicle_id, status, created_at, updated_at)
- **vehicles** (id, registration_number, make, model, year, status, mileage, fuel_type, tank_capacity, created_at, updated_at)
- **fuel_logs** (id, vehicle_id, driver_id, liters, cost, odometer, receipt_photo_url, date, created_at)
- **maintenance_logs** (id, vehicle_id, service_type, cost, date, notes, created_at)
- **insurance** (id, vehicle_id, provider, policy_number, expiry_date, coverage_amount, created_at, updated_at)

All tables have timestamps and foreign key constraints.

### Stub Route Structure
All route files follow this pattern (see `backend/src/routes/auth.ts`):
```typescript
import { Router } from 'express';
const router = Router();

router.post('/endpoint', async (req, res) => {
  // TODO: Implement logic
  res.json({ message: 'Endpoint description' });
});

export const featureRoutes = router;
```

### Vehicle Status Values (Planned)
- `available` — ready for assignment
- `in-use` — currently assigned
- `under-maintenance` — scheduled for service
- `out-of-service` — not fit for duty

### Error Handling (Already in place)
Use `asyncHandler` utility to wrap async route handlers:
```typescript
router.get('/path', asyncHandler(async (req, res) => {
  // errors automatically caught and passed to errorHandler middleware
}));
```

Response format (on error):
```json
{
  "error": {
    "statusCode": 400,
    "message": "Error description",
    "timestamp": "2026-01-09T..."
  }
}
```

### Environment Variables Required
**Backend** (`backend/.env`):
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleet_management
JWT_SECRET=your_jwt_secret_key
FIREBASE_API_KEY=optional_for_phase_5
FIREBASE_PROJECT_ID=optional_for_phase_5
```

**Web** & **Mobile**: Use defaults or set `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL` to `http://localhost:3000`

### TypeScript & Monorepo Conventions
- Backend: `src/**/*.ts` → `dist/**/*.js` on build
- Web: `.tsx` files in `app/` (Next.js App Router) and `components/`
- Mobile: `.tsx` files in `src/` (Expo/React Native compatible)
- Keep import paths relative within workspace
- Run type checks: `npm run lint`

### Styling Conventions
- **Web:** Tailwind CSS utility-first (already configured in `tailwind.config.ts`)
- **Mobile:** React Native StyleSheet; use flexbox layouts
- **Color scheme:** Blue (#2563eb) primary, indigo secondary, red for alerts

---

## 🔧 Implementing Phase 2 Tasks (Current)

### Wiring up API routes (Priority 1)
1. In `backend/src/index.ts`, add route imports:
   ```typescript
   import { authRoutes } from './routes/auth';
   import { vehicleRoutes } from './routes/vehicles';
   // ... etc
   ```
2. Register routes before error handler:
   ```typescript
   app.use('/api/auth', authRoutes);
   app.use('/api/vehicles', vehicleRoutes);
   // ... etc
   ```
3. Test with `curl` or Postman before moving to next route

### Implementing a stub route
1. Open `backend/src/routes/<feature>.ts`
2. Replace TODO comments with actual logic
3. Use `asyncHandler` for async operations:
   ```typescript
   router.post('/login', asyncHandler(async (req, res) => {
     const { username, password } = req.body;
     // Query database, validate, return JWT
     res.json({ token: '...', user: { id, role } });
   }));
   ```
4. Import `pool` from `backend/src/db/connection.ts` for queries
5. Test with curl/Postman

### Adding database logic (models layer)
1. Create `backend/src/models/<feature>.ts` (e.g., `userModel.ts`)
2. Export async query functions using `pool`:
   ```typescript
   export async function getUserByUsername(username: string) {
     const { rows } = await pool.query(
       'SELECT * FROM users WHERE username = $1',
       [username]
     );
     return rows[0];
   }
   ```
3. Import and use in route handlers
4. Keep SQL queries close to domain logic

### Building Web dashboard pages
1. Create `.tsx` file in `web/app/<feature>/page.tsx`
2. Use Next.js App Router (automatic routes)
3. Import components from `web/components/`
4. Fetch from backend in `useEffect` or Server Component:
   ```typescript
   const response = await axios.get('http://localhost:3000/api/vehicles');
   ```
5. Use Tailwind utilities for styling (reference `web/app/page.tsx`)
6. Import icons from `lucide-react`

### Adding Mobile screens
1. Create screen component in `mobile/src/screens/<Feature>Screen.tsx`
2. Import `useNavigate()` from `@react-navigation/native`
3. Use Zustand store for state management
4. Make API calls using `axios` from store or screen
5. Handle loading/error states
6. Add screen to navigation in `mobile/src/navigation/`

### Debugging
- **Backend:** Add console.logs, check `backend/.env` has DB credentials
- **Web:** Use React DevTools, check `http://localhost:3001` in browser
- **Mobile:** Use `expo start`, scan QR code with Expo Go app, check console
- **Database:** Test queries directly: `psql -U postgres -d fleet_management`
- **API:** Test routes with curl or Postman before wiring to frontend

---

## 📋 Files to Open First When Investigating

- **Project Overview:** `README.md`
- **Backend Health:** `backend/src/index.ts`, `backend/src/db/connection.ts`
- **Web Home:** `web/app/page.tsx` (dashboard design)
- **API Routes:** `backend/src/routes/` (all endpoints)
- **Database Schema:** `backend/src/db/connection.ts` (table definitions)
- **Environment:** Root `.env` files in each workspace
- **Config:** `tailwind.config.ts` (web), `tsconfig.json` (TS setup)

---

## 🎯 Phase Breakdown (Next Steps)

| Phase | Status | Owner | Timeline |
|-------|--------|-------|----------|
| 1. Requirements & Design | ✅ Done | PM | Dec 2025 |
| 2. Backend & Database | 🔄 IN PROGRESS | Backend Team | Jan 2026 |
| 3. Web Dashboard | ⏳ Pending | Frontend Team | Feb 2026 |
| 4. Mobile App | ⏳ Pending | Mobile Team | Mar 2026 |
| 5. Notifications & Alerts | ⏳ Pending | Backend | Apr 2026 |
| 6. Reports & Analytics | ⏳ Pending | Frontend | May 2026 |
| 7. Weather Integration | ⏳ Pending | Backend | May 2026 |
| 8. Testing & Deployment | ⏳ Pending | QA/DevOps | Jun 2026 |
| 9. Future Enhancements | 📝 Planned | Product | Q3+ 2026 |

---

## ❓ Common Questions

**Q: How do I add a new user role?**
A: Add to `users` table `role` enum. Update middleware validation in `backend/src/middleware/auth.ts`. Update API endpoint guards accordingly.

**Q: How do I enable push notifications?**
A: Set up Firebase project, add admin SDK keys to `.env`, then implement `sendFCMNotification()` in backend routes. Client must request permission on app install.

**Q: How do I export reports to PDF?**
A: Use `jspdf` library on web or `react-native-pdf-lib` on mobile. Backend can also use `pdfkit` for server-side generation.

**Q: How do I track vehicle location in real-time?**
A: Use GPS from mobile app, send lat/long to `/api/vehicles/:id/location` endpoint, store in DB, fetch on web dashboard. Requires Firebase Realtime Database or WebSocket for live updates.

---

## 📞 Questions for Team

- Preferred database hosting (AWS RDS, Neon, PlanetScale, local)?
- Preferred backend hosting (Render, AWS Lambda, Heroku)?
- Preferred mobile distribution (Play Store, internal beta, enterprise)?
- Real-time updates needed? (WebSocket, Firebase, polling?)
- Offline-first requirement for mobile? (sync on reconnect?)

---

**Last Updated:** Jan 9, 2026
**Project Lead:** Fleet Management Team
**Maintained by:** Development Team
