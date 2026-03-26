<!-- Copilot / AI agent instructions for Fleet Management System Desktop -->

# 🚗 Fleet Management System — AI Agent Instructions (Desktop)

**Last Updated:** January 11, 2026

## Quick Orientation

**Judiciary Fleet Desktop App** — A comprehensive desktop application for managing the Malawi Judiciary transportation fleet. Track vehicles, drivers, fuel consumption, maintenance, insurance, and generate reports.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript (Vite dev server on port 5173, HMR enabled)
- **Desktop:** Electron 27 (main process in `main.js`, auto-waits for dev server)
- **Styling:** Tailwind CSS + status gradients (not coral theme as previously noted)
- **Icons:** Lucide React
- **Database:** Supabase PostgreSQL (REST API fallback in `supabaseQueries.ts` for Electron compatibility)
- **State:** React hooks only (useState, useEffect) + Supabase auth session
- **Charts:** Recharts for visualizations

**Current State:** ✅ Auth complete | ✅ Dashboard + 13 feature pages | ✅ Fuel tracking & analytics | ✅ Insurance/Disposal/Maintenance CRUD | ✅ 60+ database functions | ✅ Mock data in UsersManagement

---

## 📂 Key Files & Structure

### **Entry Points**
- `main.js` — Electron main process: window creation, `waitForServer()` polling until Vite ready (development)
- `preload.js` — Electron preload (security layer, minimal IPC currently)
- `index.html` — Vite HTML entry
- `src/main.tsx` — React entry point

### **Core App** (`src/`)
- **`App.tsx`** (347 lines) — Main component: session management, tab routing, profile fetching
  - `useEffect` checks `sb.auth.getSession()` on mount → restores user or shows login
  - Conditional render: `isLoggedIn ? <Dashboard> : <Login>`
  - Tab system: `activeTab` state routes to Dashboard, Vehicles, Drivers, Fuel, Insurance, Disposal, etc.
  - `tabNames` object defines all available tabs (10 feature pages + settings)
- **`components/`** — 13 feature components:
  - `Login.tsx` — Supabase email/password auth with coral gradient (#EA7B7B to #D65A5A)
  - `Sidebar.tsx` — Navigation menu with responsive toggle, logout handler, tab switching
  - `DashboardContent.tsx` — Fleet summary cards (vehicles, drivers, fuel consumption, maintenance status) using `statusMap` gradients
  - `VehiclesManagement.tsx` — Vehicle CRUD, filtering by status/make, active/disposal status tracking
  - `DriversManagement.tsx` — Driver CRUD, active assignments, license tracking
  - `FuelTracking.tsx` — Log fuel consumption with odometer, cost, station, driver assignment; real-time stats
  - `FuelAnalytics.tsx` — 6 chart types (line, bar, pie), multi-vehicle comparison, 12-month history, anomaly detection
  - `MaintenanceManagement.tsx` — Maintenance log CRUD, status tracking, cost analysis
  - `InsuranceManagement.tsx` — Policy CRUD, expiry tracking, coverage management, premium analysis
  - `DisposalTracking.tsx` — Vehicle disposal records, method tracking (scrap/auction/donation/sale), recovery value analysis
  - `ReportsPage.tsx` — Fleet summary, vehicle metrics, cost analysis
  - `FuelConsumptionChart.tsx`, `VehicleStatusChart.tsx` — Chart components
  - `Header.tsx` — User profile, date display

### **Database Layer**
- **`lib/supabaseQueries.ts`** (519 lines, 60+ functions) — All async query functions organized by domain
  - **Initialization:** `initSupabase()` — lazy loads Supabase client, caches it
  - **Users:** `getCurrentUser()`, `getUserProfile()`, `updateUserProfile()`
  - **Vehicles:** `getAllVehicles()`, `getVehicleById()`, `getVehiclesByStatus()`, `createVehicle()`, `updateVehicle()`, `deleteVehicle()`
  - **Drivers:** `getAllDrivers()`, `getDriverById()`, `getDriversByStatus()`, `createDriver()`, `updateDriver()`, `getDriversExpiringLicenses()`
  - **Assignments:** `getActiveAssignments()`, `createAssignment()`, `endAssignment()`, `getAssignmentHistory()`
  - **Fuel:** `getFuelLogsByVehicle()`, `createFuelLog()`, `updateFuelLog()`, `deleteFuelLog()`, `getFuelConsumptionStats()`
  - **Maintenance:** `getMaintenanceByVehicle()`, `getOverdueMaintenance()`, `createMaintenanceRecord()`, `updateMaintenanceRecord()`, `getOverdueMaintenanceRecords()`
  - **Insurance:** `getAllInsurance()`, `getInsuranceByVehicle()`, `createInsurancePolicy()`, `updateInsurancePolicy()`, `deleteInsurancePolicy()`, `getExpiredInsurance()`, `getExpiringInsurance()`
  - **Disposal:** `getAllDisposals()`, `getDisposalByVehicle()`, `createDisposal()`, `updateDisposal()`, `deleteDisposal()`
  - **Notifications:** `getNotificationsForUser()`, `createNotification()`, `markNotificationAsRead()`, `deleteNotification()`
  - **Reports:** `getFleetSummary()`, `getOverdueMaintenanceRecords()`
  - **Auth:** `signOut()`, `refreshSession()`
  - **Pattern:** All functions return `{ data, error }` tuple (destructure in components)

### **Configuration**
- `vite.config.ts` — React plugin, dev server port 5173, HMR enabled
- `tailwind.config.js` — Custom theme colors
- `tsconfig.json` — Strict mode enabled
- `package.json` — Scripts: `dev` (Electron+Vite concurrent), `dev:ui` (browser only), `build`, `preview`, `test`

---

## 🚀 Development Workflows

### Initial Setup
```bash
npm install
```

### Full Stack Development (Recommended) — `npm run dev`
**What happens (in `main.js` + `package.json`):**
1. `concurrently` starts **Vite dev server** on `http://localhost:5173` (compiles React + HMR)
2. **Electron launches immediately** (in development mode)
3. Electron's `main.js` calls `findAvailableServer()` → `waitForServer()` polling
4. Waits up to 30 seconds for Vite server to respond on ports 5173-5176 (fallback ports if 5173 busy)
5. Once available: Electron loads from `http://localhost:5173`
6. **Both UI and desktop app hot-reload** on React/CSS changes
7. On failure: Displays error message in window instead of crashing

**Key insight:** Electron intentionally waits for Vite. Vite starts *first*, Electron waits for it. Never launch Electron directly during dev.

### Browser-Only Development — `npm run dev:ui`
```bash
npm run dev:ui
```
- Vite dev server only: `http://localhost:5173`
- Open in browser at `http://localhost:5173` to test React components without Electron overhead
- Useful for debugging UI without managing two processes

### Production Build Testing — `npm run build && npm run dev:electron`
```bash
npm run build                 # Creates dist/ bundle
npm run dev:electron         # Starts Electron in dev mode, loads from dist/
```
- Builds React to `dist/` (production-optimized)
- Electron loads from `dist/index.html` instead of dev server
- Use to test production behavior locally before distribution

### Build for Distribution — `npm run build`
- Outputs production bundle to `dist/`
- Ready for Electron builder packaging (if configured)

---

## ⚡ Critical Supabase Patterns (Unique to This Project)

### 1. REST API Fallback (Electron Compatibility)
**Location:** `src/lib/supabaseQueries.ts` lines 30-65, used throughout queries

Electron's SecurityPreload + CORS restrictions → Supabase JS client sometimes fails. **Solution:**
- All queries try **Supabase JS client first** (normal API calls)
- **If that fails**, automatically falls back to **REST API** via `querySupabaseREST()` helper
- **If REST fails too**, retries JS client up to 3 times with exponential backoff
- **Example:** See `getAllVehicles()` function — has explicit retry logic with fallback

**This is why queries are robust in production but agents shouldn't assume perfect connectivity.**

### 2. Query Result Caching (5-minute TTL)
**Location:** `src/lib/supabaseQueries.ts` lines 13-25

```typescript
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

- Caches query results to reduce database load
- TTL: 5 minutes — after that, cache is invalidated
- Console logs show `💾 Using cached result` when hit
- **Pattern:** `getCacheKey()` creates unique key from table + params

**Don't worry about stale data — it's fine for this app's use case, and manual refreshes clear cache.**

### 3. Supabase Initialization (Lazy + Singleton)
```typescript
let supabase: any = null;

export async function initSupabase() {
  if (supabase) return supabase;
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return supabase;
}
```

- **Lazy loads** Supabase client on first query (not on app start)
- **Cached as singleton** — every query reuses same client instance
- Auth flags set to `false` because JWT is managed in `App.tsx`, not by Supabase client
- Always `await initSupabase()` before using in new queries

---

## 📂 Key Files & Structure

### **Entry Points & Config**
- `main.js` — Electron main process: `waitForServer()` polling, window creation, dev/prod loading
- `preload.js` — Electron security preload (minimal IPC currently)
- `index.html` — Vite HTML entry point (includes Tailwind CSS)
- `src/main.tsx` — React app entry
- `vite.config.ts` — Vite config: React plugin, port 5173, HMR enabled
- `tsconfig.json` — Strict mode enabled
- `package.json` — Scripts: `dev`, `dev:ui`, `dev:electron`, `build`, `preview`, `test`

### **Core App** (`src/App.tsx` — 336 lines)
**Main component: Session management + tab routing**
- `useEffect` on mount: calls `sb.auth.getSession()` → restores user or shows login
- Conditional render: `isLoggedIn ? <Dashboard> : <Login>`
- Tab system: `activeTab` state routes between 10 feature pages
- `tabNames` object defines all available tabs
- Fetches user profile from `users` table on login via `getUserProfile()`

### **Components** (`src/components/` — 13 feature pages)
| Component | Purpose | Key Features |
|-----------|---------|-------------|
| `Login.tsx` | Authentication UI | Supabase email/password, error handling, responsive design |
| `Sidebar.tsx` | Navigation menu | Tab switching, logout handler, responsive toggle |
| `Header.tsx` | User profile display | Shows email, date, profile info |
| `DashboardContent.tsx` | Fleet summary (208 lines) | **Status card pattern reference** — see `statusMap` object |
| `VehiclesManagement.tsx` | Vehicle CRUD (1140 lines) | Heavy retry logic, RLS error handling, Truck icon, status filtering |
| `DriversManagement.tsx` | Driver CRUD | License tracking, assignment linking |
| `UsersManagement.tsx` | User CRUD (659 lines) | **Mock data only** — not integrated with Supabase yet |
| `FuelTracking.tsx` | Log fuel (877 lines) | Modal forms, real-time stats calculation, driver assignment |
| `FuelAnalytics.tsx` | 6 chart types | Line, Bar, Pie charts; 7/30/90 day filters; anomaly detection |
| `MaintenanceManagement.tsx` | Maintenance CRUD | Scheduling, overdue tracking, cost analysis |
| `InsuranceManagement.tsx` | Policy CRUD | Expiry alerts, coverage/premium management |
| `DisposalTracking.tsx` | Disposal records | Method tracking (scrap/auction/donation/sale), recovery value |
| `ReportsPage.tsx` | Analytics dashboards | Fleet summary, vehicle metrics, cost breakdown |
| `FuelConsumptionChart.tsx`, `VehicleStatusChart.tsx` | Chart components | Recharts wrappers |

### **Database Layer** (`src/lib/supabaseQueries.ts` — 782 lines)
**60+ async query functions organized by domain:**

| Domain | Key Functions | Pattern |
|--------|---------------|---------|
| **Vehicles** | `getAllVehicles()`, `getVehicleById()`, `getVehiclesByStatus()`, `createVehicle()`, `updateVehicle()`, `deleteVehicle()` | All return `{ data, error }` tuple; retry logic in getAllVehicles |
| **Drivers** | `getAllDrivers()`, `getDriverById()`, `getDriversByStatus()`, `createDriver()`, `updateDriver()`, `getDriversExpiringLicenses()` | License expiry filtering |
| **Fuel** | `getFuelLogsByVehicle()`, `createFuelLog()`, `updateFuelLog()`, `deleteFuelLog()`, `getFuelConsumptionStats()` | Odometer-based km/L calculation |
| **Maintenance** | `getMaintenanceByVehicle()`, `getOverdueMaintenance()`, `createMaintenanceRecord()`, `updateMaintenanceRecord()` | Overdue detection |
| **Insurance** | `getAllInsurance()`, `getInsuranceByVehicle()`, `createInsurancePolicy()`, `updateInsurancePolicy()`, `deleteInsurancePolicy()`, `getExpiredInsurance()`, `getExpiringInsurance()` | Expiry tracking |
| **Disposal** | `getAllDisposals()`, `getDisposalByVehicle()`, `createDisposal()`, `updateDisposal()`, `deleteDisposal()` | Recovery value analytics |
| **Users** | `getCurrentUser()`, `getUserProfile()`, `updateUserProfile()` | Auth session helpers |
| **Notifications** | `getNotificationsForUser()`, `createNotification()`, `markNotificationAsRead()` | Alert system |
| **Reports** | `getFleetSummary()`, `getOverdueMaintenanceRecords()` | Analytics aggregation |
| **Auth** | `signOut()`, `refreshSession()` | Session management |

---

## 🎯 Common Development Tasks

### Adding a New Feature Page
1. Create component in `src/components/FeatureName.tsx` (see `FuelTracking.tsx` as template)
2. Import it in `App.tsx`
3. Add tab config to `tabNames` object in `App.tsx`
4. Add menu item in `Sidebar.tsx` with Lucide icon
5. Add conditional render in `App.tsx` dashboard section
6. Queries: Use existing functions from `supabaseQueries.ts` or add new ones following the pattern

**Data flow:** Component → `useEffect` → query from `supabaseQueries.ts` → `{ data, error }` → set state → render

### Adding Database Queries
1. Open `src/lib/supabaseQueries.ts`
2. Follow the established pattern:
```typescript
export async function getNewData(filter: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('table_name')
    .select('*')
    .eq('column', filter)
    .order('created_at', { ascending: false });
  return { data, error };
}
```
3. Import in component: `import { getNewData } from '../lib/supabaseQueries'`
4. Call in `useEffect`, destructure result: `const { data, error } = await getNewData('value')`
5. Handle errors: `if (error) { setError(error.message); return; }`

### Error Handling in Components
**Standard pattern (see `VehiclesManagement.tsx` for complete example):**
```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let isMounted = true; // Prevent state updates on unmount
  
  const load = async () => {
    try {
      setError(null);
      const { data, error: err } = await getNewData();
      
      if (!isMounted) return; // Component unmounted
      if (err) {
        setError(err.message);
        return;
      }
      setData(data);
    } catch (err: any) {
      if (isMounted) setError(err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  };
  
  load();
  return () => { isMounted = false; }; // Cleanup
}, []);
```

**Why `isMounted` check?** Prevents "Cannot perform a React state update on an unmounted component" warnings when queries complete after component unmount.

### Form CRUD Pattern
**Reference:** `FuelTracking.tsx` (lines 200-400+), `VehiclesManagement.tsx` (lines 150-350)

**Pattern:**
1. State for form visibility: `const [showForm, setShowForm] = useState(false)`
2. State for editing: `const [editingId, setEditingId] = useState<string | null>(null)`
3. State for form data: `const [formData, setFormData] = useState({ field: '' })`
4. State for submission: `const [submitting, setSubmitting] = useState(false)`
5. Render: Conditional JSX for modal/form
6. On submit: Call `createItem()` or `updateItem()`, refresh list, show success message

---

## 🌟 Styling & UI Patterns

### Status Card Pattern (Dashboard Standard)
**Reference:** `DashboardContent.tsx` lines 14-42 — `statusMap` object

Each status has gradient background, border, text colors, icon background:
```typescript
const statusMap = {
  success: {
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    borderColor: 'border-emerald-200',
    titleColor: 'text-emerald-700',
    valueColor: 'text-emerald-900',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentLine: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  },
  // ... warning, danger, info similarly
};
```

**Usage in component:**
```tsx
const style = statusMap[status];
<div className={`${style.bgGradient} border ${style.borderColor}`}>
  <div className={`absolute top-0 left-0 right-0 h-0.5 ${style.accentLine}`} />
  {/* content */}
</div>
```

**Apply to:** Dashboard cards, status badges, alert boxes, inline notifications

### Color Reference (Status-Driven, NOT Coral)
**Tailwind Status Colors Used:**
- **Success:** emerald (emerald-50, emerald-100, emerald-200, emerald-600, emerald-700, emerald-900)
- **Warning:** amber (amber-50, amber-100, amber-200, amber-600, amber-700, amber-900)
- **Danger:** red (red-50, red-100, red-200, red-600, red-700, red-900)
- **Info:** blue (blue-50, blue-100, blue-200, blue-600, blue-700, blue-900)

**Neutral:**
- Backgrounds: `white`, `gray-50`, `gray-100`
- Text: `gray-900` (headings), `gray-700` (body), `gray-600` (labels)
- Borders: `gray-200`, `gray-300`

**NOT used:** Coral (#EA7B7B) — that was from previous design iteration

### Standard Component Styling
- **Cards:** `bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all`
- **Buttons:** Status-based colors; add `disabled:opacity-50 disabled:cursor-not-allowed` for loading
- **Forms:** White background, gray-600 labels, focus states with border color
- **Icons:** Lucide React, use `size={18}` or `size={20}` for consistency
- **Responsive:** Mobile-first Tailwind; use `md:`, `lg:` prefixes (see `Login.tsx`)

### Icons Usage
```tsx
import { Truck, Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';

<Truck size={20} className="text-blue-600" />
<button><Plus size={18} /> Add</button>
```

---

## 🔑 Architecture Insights

### Why Electron + Vite Dev Setup?
- **Electron** provides desktop app packaging, file system access, native menus
- **Vite** provides blazing-fast dev server with HMR (hot module replacement)
- **Together:** `main.js` waits for Vite on startup → loads dev URL instead of prod bundle
- **Result:** Full hot-reload during development, production build uses `dist/index.html`

### Why REST API Fallback?
- Electron's SecurityPreload + CORS restrictions cause Supabase JS client to fail occasionally
- REST API has no CORS issues — direct HTTP calls work reliably
- **Pattern:** Try JS client → if fails, try REST API → if fails, retry JS client
- See `getAllVehicles()` for production-grade example

### Why Mock Data in UsersManagement?
- `UsersManagement.tsx` (659 lines) uses hardcoded mock data instead of Supabase queries
- Not integrated with real database yet (intentional, awaiting design review)
- **Pattern to follow when integrating:** Replace mock data with queries from `supabaseQueries.ts`

### State Management: Why No Redux/Context?
- App is small enough for local React hooks (useState, useEffect)
- Supabase client persists auth state in browser storage automatically
- Components fetch data independently on mount
- **Add Context only if:** Multiple tabs need deeply shared state

### Why Cache Queries?
- Reduces database load for repeated queries within 5 minutes
- Console logs show cache hits: `💾 Using cached result`
- TTL: 5 minutes — after that, next query fetches fresh data
- **Impact:** Faster page navigation, fewer API calls to Supabase

---

## 📋 Supabase Tables Reference

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | id, email, name, role, position, jurisdiction | Auth + profile data |
| `vehicles` | id, registration_number, make, model, year, status, mileage, fuel_type, chassis_number, engine_number, purchase_date, insurance_expiry | Fleet inventory; statuses: available/in_use/maintenance/broken/disposed |
| `drivers` | id, name, email, license_number, status, phone, jurisdiction | Driver management |
| `assignments` | id, vehicle_id, driver_id, start_date, end_date | Links drivers to vehicles |
| `fuel_logs` | id, vehicle_id, driver_id, litres, cost, station_name, odometer, refuel_date, receipt_url | Fuel tracking; used for km/L calculation |
| `maintenance_logs` | id, vehicle_id, service_type, cost, maintenance_date, parts_replaced, technician | Service history |
| `insurance` | id, vehicle_id, provider, policy_number, coverage_amount, premium_amount, start_date, expiry_date | Insurance records; used for expiry tracking |
| `disposal` | id, vehicle_id, disposal_date, disposal_method, disposal_value, buyer_name, final_mileage, condition, reason | End-of-life tracking |
| `notifications` | id, user_id, message, type, read, created_at | Alert system |

---

## 🔧 Troubleshooting & Tips

### Dev Server Not Connecting?
- Check that `npm run dev` started Vite first (should see "Local: http://localhost:5173")
- Electron polls 5173-5176 for 30 seconds
- If all ports busy: kill other processes with `lsof -i :5173` or restart machine

### Component Not Updating After Database Change?
- Queries use 5-minute cache — manually refresh or change vehicle/driver selection to refetch
- Or manually call `loadData()` function after mutation

### Supabase Query Failing?
- Check browser console for REST API fallback log: `🔗 REST API URL:` + `✅ REST query successful:`
- If still failing: Supabase might be down or RLS policies blocking query
- See `VehiclesManagement.tsx` error handling for RLS error detection

### TypeScript Errors?
- Run `npm run build` to check all files
- Ensure imported queries are exported from `supabaseQueries.ts`
- Check that interfaces match Supabase table columns

---

## 📚 Reference Components

**Reference these for patterns:**
- **Data fetching + error handling:** `VehiclesManagement.tsx` (1140 lines) — heavy retry logic, isMounted cleanup
- **Modal forms:** `FuelTracking.tsx` (877 lines) — form state, modal rendering, submission handling
- **Status card styling:** `DashboardContent.tsx` (208 lines) — statusMap pattern, gradient backgrounds
- **Charts:** `FuelAnalytics.tsx` — 6 different Recharts examples, time filtering
- **Authentication:** `App.tsx` (336 lines) — session restoration, login flow

**Testing Credentials:**
```
📧 Email: dingiswayochapomba@gmail.com
🔐 Password: @malawi2017
```

---

## 🚀 Command Reference

| Task | Command |
|------|---------|
| **Full Dev (Electron + React)** | `npm run dev` |
| **Browser-Only (No Electron)** | `npm run dev:ui` |
| **Electron with Prod Build** | `npm run build && npm run dev:electron` |
| **Build for Distribution** | `npm run build` |
| **Preview Production** | `npm run preview` |
| **Run Tests** | `npm run test` |

---

## ✅ What's Complete

- ✅ Authentication (Supabase JWT + session restoration)
- ✅ Dashboard (12+ summary cards, status gradients, charts)
- ✅ Vehicles Management (full CRUD, status filtering, RLS error handling)
- ✅ Drivers Management (CRUD, assignment tracking, license expiry detection)
- ✅ Fuel Tracking (log creation/editing/deletion, real-time stats, km/L calculation)
- ✅ Fuel Analytics (6 chart types, 7/30/90 day filtering, anomaly detection, vehicle comparison)
- ✅ Maintenance Management (history, overdue detection, cost tracking)
- ✅ Insurance Management (policy CRUD, expiry/expiring soon alerts, premium analysis)
- ✅ Disposal Tracking (method tracking, recovery value analysis, condition recording)
- ✅ Reports Page (fleet summary, vehicle metrics, cost analysis)
- ✅ 60+ database query functions with retry logic
- ✅ Electron + Vite dev setup with auto-reload

## 🎯 NOT Yet Implemented

- ⚠️ UsersManagement page uses **mock data only** — not integrated with Supabase
- ⚠️ Real-time subscriptions (currently polling only)
- ⚠️ File uploads (receipt photos, vehicle images)
- ⚠️ Role-based access control (RBAC) in RLS policies

### Styling Components
- **Colors:** Use Tailwind classes: `bg-white`, `text-gray-600`, `border-gray-200`
- **Coral theme:** `bg-[#EA7B7B]` (primary), `bg-[#D65A5A]` (hover)
- **Status gradients:** See `DashboardContent.tsx` `statusMap` for danger/warning/success/info patterns
- **Cards:** `bg-white p-6 rounded-lg border border-gray-200 shadow-sm`
- **Icons:** Import from `lucide-react`, use size prop: `<Truck size={18} />`

---

## 🌟 Feature-Specific Patterns

### Fuel Tracking System (Complete)
**Files:** `FuelTracking.tsx`, `FuelAnalytics.tsx`, `FuelConsumptionChart.tsx`

**Pattern for Fuel Logs:**
```typescript
interface FuelLog {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  litres: number;
  cost: number;
  station_name: string;
  odometer: number;
  refuel_date: string;
}

// Queries used:
getFuelLogsByVehicle(vehicleId)
createFuelLog(logData)
updateFuelLog(logId, updates)
deleteFuelLog(logId)
```

**FuelAnalytics Features:**
- Chart types: Line (consumption trends), Bar (cost analysis), Pie (distribution)
- Time ranges: 7/30/90 days
- Multi-vehicle comparison
- Anomaly detection (flags unusual consumption spikes)
- Calculate km/L from odometer readings

**Styling:** Cards use `bg-white p-6 rounded-lg border border-gray-200`, icons from Lucide

### Insurance Management System (Complete)
**Files:** `InsuranceManagement.tsx`

**Pattern for Insurance Policies:**
```typescript
interface Insurance {
  id: string;
  vehicle_id: string;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'expiring_soon';
}

// Queries used:
getAllInsurance()
getInsuranceByVehicle(vehicleId)
createInsurancePolicy(policyData)
updateInsurancePolicy(policyId, updates)
deleteInsurancePolicy(policyId)
getExpiredInsurance()
getExpiringInsurance()
```

**Insurance Features:**
- Policy status tracking (active/expired/expiring_soon)
- Expiry date alerts and filtering
- Coverage and premium amount management
- Insurance stats dashboard (total, active, expired, expiring counts)

### Disposal Tracking System (Complete)
**Files:** `DisposalTracking.tsx`

**Pattern for Disposals:**
```typescript
interface Disposal {
  id: string;
  vehicle_id: string;
  disposal_date: string;
  disposal_method: 'scrap' | 'auction' | 'donation' | 'sale' | 'other';
  disposal_value: number;
  buyer_name: string | null;
  final_mileage: number | null;
  condition: 'poor' | 'fair' | 'good' | 'excellent' | null;
  reason: string;
}

// Queries used:
getAllDisposals()
getDisposalByVehicle(vehicleId)
createDisposal(disposalData)
updateDisposal(disposalId, updates)
deleteDisposal(disposalId)
```

**Disposal Features:**
- Method tracking (scrap/auction/donation/sale)
- Recovery value analysis and reporting
- Condition recording (poor/fair/good/excellent)
- Buyer information for sales/donations
- Final mileage recording for archival

### Vehicle Management Pattern
**Used by:** `VehiclesManagement.tsx`
```typescript
// CRUD operations
getAllVehicles()           // fetch all with ordering
getVehicleById(id)        // single detail
getVehiclesByStatus(status) // filter
createVehicle(data)        // add new
updateVehicle(id, updates) // modify
deleteVehicle(id)          // remove
```
**Vehicle Statuses:** 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed'

### Charts & Analytics
**Library:** Recharts (React charts library)
**Pattern:** Wrap data, set dimensions, use standardized colors
**Files:** `FuelConsumptionChart.tsx`, `VehicleStatusChart.tsx`
**Example:** See `FuelAnalytics.tsx` for 6 different chart implementations

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

### Status Card Pattern (Dashboard & Feature Pages)
**Critical pattern used throughout:** See `DashboardContent.tsx` `statusMap` object for reference
- Each status type (success/warning/danger/info) has gradient colors, border, text, icon background
- Apply via destructuring: `const style = statusMap[status]`
- Cards have: gradient background, colored border, accent line at top, icon container
- Used in: DashboardContent, FuelTracking, Insurance, Disposal, Maintenance components
- **Example:** `bg-gradient-to-br from-emerald-50 to-emerald-100/50` + `border-emerald-200` + accent gradient
- Always include hover effect: `hover:shadow-md transition-all duration-300`

---

## 🔑 Critical Architecture Patterns

### Authentication & Session Flow
1. **App Mount (`App.tsx`):** `useEffect` calls `sb.auth.getSession()` to restore user from browser storage
2. **If Session Exists:** Fetches user profile from `users` table via `getUserProfile(userId)`
3. **Login:** `supabase.auth.signInWithPassword(email, password)` creates JWT session + stores in browser
4. **Logout:** Clears session, sets `isLoggedIn = false`, redirects to Login component
5. **Protected Routes:** All feature components only render inside `isLoggedIn && !loading` guards

### Data Flow: Components → Queries → Supabase
```
Component (FuelTracking.tsx)
  ↓ useEffect with dependency array
  ↓ calls getFuelLogsByVehicle(vehicleId)
  ↓ supabaseQueries.ts handles Supabase initialization + query
  ↓ returns { data, error } tuple
  ↓ Component sets state & renders
```

### State Management Philosophy
- **No Redux/Context API** — React hooks only (useState, useEffect, useCallback)
- **Local component state** for form inputs, filters, expanded items
- **Supabase client state** for authentication (automatically persisted in browser)
- **Add Context only if** multiple components need deeply nested state across different tabs

### Error Handling Pattern
```typescript
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const load = async () => {
    const { data, error } = await getFuelLogsByVehicle(vehicleId);
    if (error) {
      setError(error.message);
      return;
    }
    setFuelLogs(data);
  };
  load();
}, [vehicleId]);
```

### Supabase Tables Schema
| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `users` | id, email, name, role | Auth + profile data |
| `vehicles` | id, registration_number, make, model, status, mileage | Fleet inventory |
| `drivers` | id, name, license_number, status | Driver management |
| `fuel_logs` | vehicle_id, driver_id, litres, cost, odometer, refuel_date | Fuel tracking |
| `maintenance_logs` | vehicle_id, service_type, cost, maintenance_date | Service history |
| `insurance` | vehicle_id, provider, policy_number, expiry_date | Insurance records |

---

## 🔧 Common Patterns & Examples

### Adding Modal/Dialog Pattern
- See `FuelTracking.tsx` for modal implementation (lines ~200-400)
- Pattern: State for `isOpen`, render conditional JSX with form, save on submit
- Use Tailwind for styling: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`

### Form Submission Pattern
```typescript
const [isLoading, setIsLoading] = useState(false);
const handleSubmit = async (formData) => {
  setIsLoading(true);
  const { data, error } = await createItem(formData);
  if (error) {
    setError(error.message);
    setIsLoading(false);
    return;
  }
  // Refresh list after creation
  await loadItems();
  setIsLoading(false);
  setIsOpen(false);
};
```

### Real-Time Chart Updates
**Pattern Used in FuelAnalytics:**
- Calculate stats in `useEffect` when data changes
- Store processed data in state
- Pass to Recharts component
- Charts re-render automatically on state update

---

## 📋 Key Files Reference

**Start Here:**
- `src/App.tsx` — Auth flow, tab routing, profile loading
- `src/lib/supabaseQueries.ts` — All 60+ database functions (copy patterns from here)
- `src/components/FuelTracking.tsx` — Reference for complex component with modals + forms
- `.github/copilot-instructions.md` — This file

**Styling Reference:**
- `src/components/DashboardContent.tsx` — Status card gradients (statusMap object)
- `src/components/Login.tsx` — Coral gradient pattern

**Feature Examples:**
- `src/components/InsuranceManagement.tsx` — Complete CRUD + expiry tracking example
- `src/components/DisposalTracking.tsx` — Analytics + recovery value calculations

**Testing Credentials:**
```
📧 Email: dingiswayochapomba@gmail.com
🔐 Password: @malawi2017
```

---

## 🚀 Command Reference

| Task | Command |
|------|---------|
| **Full Dev (Electron + React)** | `npm run dev` |
| **Browser-Only (No Electron)** | `npm run dev:ui` |
| **Electron with Prod Build** | `npm run build && npm run dev:electron` |
| **Build for Distribution** | `npm run build` |
| **Preview Production** | `npm run preview` |
| **Run Tests** | `npm run test` |

---

## ✅ What's Complete

- ✅ Authentication (Supabase JWT + session restoration)
- ✅ Dashboard (12+ summary cards, status gradients, charts)
- ✅ Vehicles Management (full CRUD, status filtering, RLS error handling)
- ✅ Drivers Management (CRUD, assignment tracking, license expiry detection)
- ✅ Fuel Tracking (log creation/editing/deletion, real-time stats, km/L calculation)
- ✅ Fuel Analytics (6 chart types, 7/30/90 day filtering, anomaly detection, vehicle comparison)
- ✅ Maintenance Management (history, overdue detection, cost tracking)
- ✅ Insurance Management (policy CRUD, expiry/expiring soon alerts, premium analysis)
- ✅ Disposal Tracking (method tracking, recovery value analysis, condition recording)
- ✅ Reports Page (fleet summary, vehicle metrics, cost analysis)
- ✅ 60+ database query functions with retry logic
- ✅ Electron + Vite dev setup with auto-reload

## 🎯 NOT Yet Implemented

- ⚠️ UsersManagement page uses **mock data only** — not integrated with Supabase
- ⚠️ Real-time subscriptions (currently polling only)
- ⚠️ File uploads (receipt photos, vehicle images)
- ⚠️ Role-based access control (RBAC) in RLS policies
