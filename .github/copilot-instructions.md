<!-- Copilot / AI agent instructions for Fleet Management System Desktop -->

# 🚗 Fleet Management System — AI Agent Instructions (Desktop)

**Last Updated:** January 9, 2026

## Quick Orientation

This is a **desktop application** for managing the Malawi Judiciary fleet. Built with **Electron + Vite + React + TypeScript** and powered by **Supabase** for authentication and database operations.

**Current State:** ✅ Authentication complete | ✅ Dashboard ready | ✅ 30+ database query functions | 🚀 Ready for feature expansion

**Key Stack:**
- **Frontend:** React 18 + TypeScript (Vite dev server on port 5173)
- **Desktop:** Electron 27 (main process in `main.js`)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase PostgreSQL (cloud-hosted)
- **Authentication:** Supabase Auth (email/password, JWT-based sessions)

---

## 📂 Key Files & Structure

### **Root Level**
- `package.json` — scripts: `dev`, `dev:ui`, `dev:electron`, `build`, `preview`, `test`
- `main.js` — Electron main process (window creation, dev server waiting)
- `preload.js` — Electron preload script (IPC security layer)
- `index.html` — Vite entry point
- `vite.config.ts` — Vite + React configuration
- `tailwind.config.js` — Tailwind CSS setup
- `tsconfig.json` — TypeScript configuration

### **Source Code** (`src/`)
- `App.tsx` — Main React component with authentication state, dashboard layout (263 lines)
  - Session checking on mount
  - Conditional rendering (Login vs Dashboard)
  - User profile fetching from Supabase
- `components/Login.tsx` — Supabase Auth UI (196 lines)
  - Email/password login with error handling
  - Gradient background (coral #EA7B7B to #D65A5A)
  - Responsive mobile/desktop layout
  - Loading states and password visibility toggle
- `lib/supabaseQueries.ts` — Database query functions (431 lines, 30+ functions)
  - User queries: `getCurrentUser()`, `getUserProfile()`, `updateUserProfile()`
  - Vehicle queries: `getAllVehicles()`, `getVehicleById()`, `getVehiclesByStatus()`, etc.
  - Fuel, maintenance, insurance queries
  - All functions follow pattern: `initSupabase()` → query → `{ data, error }` tuple return
- `assets/images/` — Background images (2.jpg used in login)
- `index.css` — Global styles, custom CSS variables

### **Public Assets** (`public/assets/`)
- Images and static files for UI

---

## 🚀 Development Workflows

### Initial Setup (Required Once)
```bash
# Install dependencies
npm install

# Create .env.local (Supabase credentials already in code, but can override)
cp .env.local.example .env.local
```

### Start Development (Single Command)
```bash
npm run dev
```
- Vite dev server on `http://localhost:5173` (React app)
- Electron app launches automatically and loads from Vite dev server
- HMR (hot module replacement) enabled
- Uses `waitForServer()` in `main.js` to ensure Vite is ready before loading

### Start UI Only (No Electron)
```bash
npm run dev:ui
```
- Vite dev server only on `http://localhost:5173`
- Useful for testing React components in browser

### Start Electron Only (Using Built UI)
```bash
npm run dev:electron
```
- Requires `npm run build` first
- Uses `dist/index.html` instead of dev server
- NODE_ENV=development for dev tools

### Build for Production
```bash
npm run build
```
- Vite builds React app to `dist/`
- Electron app can then load `dist/index.html`
- No Electron build needed (uses current `main.js` and `preload.js`)

### Preview Production Build
```bash
npm run preview
```
- Runs Vite preview server
- Tests production build before packaging

### Run Tests
```bash
npm run test
```
- Vitest (zero-config for Vite projects)
- Test files collocated with components

---

## 🎨 Theme Colors & Styling Guidelines

### Tailwind Color Palette (Coral Theme)
**Primary Colors:**
- `#EA7B7B` — Main coral primary (buttons, links, highlights)
- `#D65A5A` — Darker coral (hover states, gradients)

**Neutral Colors:**
- `gray-900` (#111827) — Text headings
- `gray-600` (#4b5563) — Secondary text, labels
- `gray-100` (#f3f4f6) — Light backgrounds
- `white` (#ffffff) — Primary background

**Status Colors:**
- `red-700` (#b91c1c) — Error text/alerts
- `green-600` (#16a34a) — Success (when needed)
- `yellow-600` (#ca8a04) — Warning (when needed)

**Gradients:**
- `from-[#EA7B7B] to-[#D65A5A]` — Login sidebar gradient (see `Login.tsx`)
- `bg-gradient-to-br` — Bottom-right direction

### Component Patterns
- **Login Page:** See `src/components/Login.tsx` for reference (coral gradient + white form)
- **Buttons:** `bg-[#EA7B7B] hover:bg-[#D65A5A] text-white`
- **Forms:** White background, gray-600 labels, coral focus states
- **Cards:** White background, subtle gray borders
- **Icons:** Lucide React (import from `lucide-react`)
- **Responsive:** Mobile-first with `md:` prefix for desktop (see Login.tsx for example)

---

## 🔑 Architecture & Key Patterns

### Authentication Flow (Supabase)
1. **Session Check on App Mount** (`App.tsx` useEffect)
   - Calls `sb.auth.getSession()` to restore user session
   - If session exists, fetches user profile from `users` table
   - Conditionally renders Dashboard or Login component

2. **Login Process** (`Login.tsx`)
   - User enters email/password
   - `supabase.auth.signInWithPassword()` creates JWT session
   - Session persisted in browser storage
   - User profile loaded into state for dashboard display

3. **Logout**
   - Clears session from Supabase
   - Redirects to login screen
   - All API queries require active session

### Database Query Pattern
All 30+ query functions in `lib/supabaseQueries.ts` follow consistent tuple return pattern:
```typescript
export async function getVehicles() {
  const sb = await initSupabase();
  const { data, error } = await sb.from('vehicles').select('*');
  return { data, error };  // Always return tuple
}

// Usage in components:
const { data: vehicles, error } = await getVehicles();
if (error) { /* handle error */ }
```

### State Management
- **React hooks** for local component state (Login, App)
- **Supabase session object** persisted automatically in browser storage
- **No Redux/Context API** currently used (can add if needed for complex state)

### Supabase Tables (Cloud-hosted PostgreSQL)
Auto-provisioned tables with JWT auth:
- **users** — ID, name, role, email (Auth + DB)
- **vehicles** — Registration, make, model, status, mileage
- **drivers** — License, assigned vehicle, status
- **fuel_logs** — Vehicle, driver, liters, cost, date
- **maintenance_logs** — Service type, cost, date, notes
- **insurance** — Provider, policy, expiry, coverage

### Electron Main Process (`main.js`)
- **waitForServer()** — Polls `http://localhost:5173` until Vite dev server is ready
- **createWindow()** — Creates BrowserWindow, loads from Vite or dist
- **preload.js** — Security layer for IPC (currently minimal)
- Default: 1200x800, contextIsolation enabled, no Node.js in renderer

---

## 🔧 Implementing Dashboard Features

### Adding a New Dashboard Card/Widget
1. Create component in `src/components/` (e.g., `VehicleStatsCard.tsx`)
2. Use existing 30+ query functions from `src/lib/supabaseQueries.ts`
3. Fetch data with `useEffect`, handle error/loading states
4. Style using Tailwind: `bg-white p-6 rounded-lg border border-gray-200`
5. Use Lucide icons for visual interest
6. Example patterns in `App.tsx` dashboard section

### Extending Supabase Queries
1. Add new function to `src/lib/supabaseQueries.ts`
2. Follow pattern: `initSupabase()` → `sb.from('table').select().where(...)` → `return { data, error }`
3. Import and use in components immediately
4. All queries use Supabase JS SDK (not SQL directly)

### Error Handling in Components
- **Display errors:** Show toast/alert with error message from `{ data, error }` tuple
- **Retry logic:** Wrap queries in try-catch, add retry button in UI
- **Network:** Use optional chaining on results: `data?.vehicles?.length || 0`

### Adding Authentication Guards
- Components only render after `isLoggedIn && !loading` check
- Logout clears session and redirects to Login
- Profile data cached in App state, refresh on demand
- See `App.tsx` for full pattern

---

## 📋 Files to Open First When Investigating

- **Project Overview:** `README.md` (full architecture & features)
- **Main App:** `src/App.tsx` (authentication state, dashboard layout)
- **Login Component:** `src/components/Login.tsx` (Supabase Auth UI reference)
- **Database Queries:** `src/lib/supabaseQueries.ts` (all 30+ query functions)
- **Electron Process:** `main.js` (desktop app lifecycle)
- **Build Config:** `vite.config.ts`, `tailwind.config.js`, `tsconfig.json`
- **Demo Creds:** Email: `dingiswayochapomba@gmail.com` | Password: `@malawi2017`

---

## 🚀 Quick Reference: Essential Commands

| Task | Command |
|------|---------|
| **Dev (Full)** | `npm run dev` → http://localhost:5173 (Electron loads from Vite) |
| **Dev (Browser)** | `npm run dev:ui` → http://localhost:5173 (React only) |
| **Build** | `npm run build` → outputs to `dist/` |
| **Production** | `npm run dev:electron` (after build) or `npm run preview` |
| **Test** | `npm run test` (Vitest) |

---

## ✅ What's Complete & Ready to Use

- ✅ Full Supabase authentication with JWT sessions
- ✅ Dashboard with fleet summary cards
- ✅ 30+ database query functions (users, vehicles, fuel, maintenance, insurance)
- ✅ Error handling and loading states
- ✅ Responsive design (mobile & desktop)
- ✅ Theme styling (coral #EA7B7B, Tailwind)

## 🚀 What's Next (Priority Order)

1. **Add vehicle management page** — List, filter, detail view
2. **Add driver management** — CRUD operations
3. **Add fuel tracking** — Log consumption, cost analysis
4. **Add maintenance scheduling** — Track service history
5. **Add reports/analytics** — Export data, generate summaries
