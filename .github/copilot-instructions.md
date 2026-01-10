<!-- Copilot / AI agent instructions for Fleet Management System Desktop -->

# 🚗 Fleet Management System — AI Agent Instructions (Desktop)

**Last Updated:** January 10, 2026

## Quick Orientation

**Judiciary Fleet Desktop App** — A comprehensive desktop application for managing the Malawi Judiciary transportation fleet. Track vehicles, drivers, fuel consumption, maintenance, insurance, and generate reports.

**Tech Stack:**
- **Frontend:** React 18 + TypeScript (Vite dev server on port 5173)
- **Desktop:** Electron 27 (main process in `main.js`)
- **Styling:** Tailwind CSS + custom gradients
- **Icons:** Lucide React
- **Database:** Supabase PostgreSQL (cloud-hosted)
- **State:** React hooks + Supabase session storage (no Redux/Context)

**Current State:** ✅ Auth complete | ✅ Dashboard ready | ✅ Fuel tracking + analytics | ✅ 50+ database functions | ✅ Vehicles/Drivers/Maintenance/Reports pages

---

## 📂 Key Files & Structure

### **Entry Points**
- `main.js` — Electron main process: window creation, `waitForServer()` polling until Vite ready (development)
- `preload.js` — Electron preload (security layer, minimal IPC currently)
- `index.html` — Vite HTML entry
- `src/main.tsx` — React entry point

### **Core App** (`src/`)
- **`App.tsx`** (353 lines) — Main component: session management, tab routing, profile fetching
  - `useEffect` checks `sb.auth.getSession()` on mount → restores user or shows login
  - Conditional render: `isLoggedIn ? <Dashboard> : <Login>`
  - Tab system: `activeTab` state routes to Dashboard, Vehicles, Drivers, Fuel, etc.
- **`components/`** — 12 feature components:
  - `Login.tsx` — Supabase email/password auth with coral gradient (#EA7B7B to #D65A5A)
  - `Sidebar.tsx` — Navigation menu with responsive toggle, logout handler
  - `DashboardContent.tsx` — Fleet summary cards (vehicles, drivers, fuel consumption, maintenance status)
  - `VehiclesManagement.tsx` — Vehicle CRUD, filtering by status/make
  - `DriversManagement.tsx` — Driver CRUD, active assignments
  - `FuelTracking.tsx` — Log fuel consumption with odometer, cost, station, driver assignment; real-time stats
  - `FuelAnalytics.tsx` — 6 chart types (line, bar, pie), multi-vehicle comparison, 12-month history, anomaly detection
  - `MaintenanceManagement.tsx` — Maintenance log CRUD, status tracking, cost analysis
  - `ReportsPage.tsx` — Fleet summary, vehicle metrics, cost analysis
  - `FuelConsumptionChart.tsx`, `VehicleStatusChart.tsx` — Chart components
  - `Header.tsx` — User profile, date display

### **Database Layer**
- **`lib/supabaseQueries.ts`** (451 lines, 50+ functions) — All async query functions
  - **Initialization:** `initSupabase()` — lazy loads Supabase client, caches it
  - **Users:** `getCurrentUser()`, `getUserProfile()`, `updateUserProfile()`
  - **Vehicles:** `getAllVehicles()`, `getVehicleById()`, `getVehiclesByStatus()`, `createVehicle()`, `updateVehicle()`, `deleteVehicle()`
  - **Drivers:** `getAllDrivers()`, `getDriverById()`, `getDriversByStatus()`, `createDriver()`, `updateDriver()`
  - **Assignments:** `getActiveAssignments()`, `createAssignment()`, `endAssignment()`, `getAssignmentHistory()`
  - **Fuel:** `getFuelLogsByVehicle()`, `createFuelLog()`, `updateFuelLog()`, `deleteFuelLog()`
  - **Maintenance:** `getMaintenanceByVehicle()`, `getOverdueMaintenance()`, `createMaintenanceLog()`, etc.
  - **Insurance:** `getInsuranceByVehicle()`, `createInsurancePolicy()`, etc.
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

### Full Stack Development (Recommended)
```bash
npm run dev
```
**What happens:**
1. Vite dev server starts on `http://localhost:5173` (compiles React + HMR)
2. Electron app launches, waits for server via `waitForServer()` in `main.js`
3. Electron loads from http://localhost:5173
4. Both UI and desktop app hot-reload on file changes

### Browser-Only Development (UI Testing)
```bash
npm run dev:ui
```
- Vite dev server only: `http://localhost:5173`
- Open in browser to test React components without Electron overhead

### Electron with Production Build
```bash
npm run build && npm run dev:electron
```
- Builds React to `dist/` (production bundle)
- Electron loads from `dist/index.html` instead of dev server
- Use for testing production behavior locally

### Build for Distribution
```bash
npm run build
```
- Outputs production-optimized React bundle to `dist/`
- Ready for packaging with Electron builder (if configured)

---

## 🎯 Common Development Tasks

### Adding a New Feature Page
1. Create component in `src/components/FeatureName.tsx`
2. Import it in `App.tsx`
3. Add tab config in `tabNames` object in `App.tsx`
4. Add menu item in `Sidebar.tsx` with Lucide icon
5. Add conditional render in dashboard section of `App.tsx`
6. Use existing queries from `supabaseQueries.ts` or add new ones

**Example:** FuelTracking component uses 5 queries: `getFuelLogsByVehicle()`, `createFuelLog()`, `getAllVehicles()`, `getAllDrivers()`, `updateFuelLog()`, `deleteFuelLog()`

### Adding Database Queries
1. Open `src/lib/supabaseQueries.ts`
2. Follow existing pattern:
```typescript
export async function getNewData(filter: string) {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('table_name')
    .select('*')
    .eq('column', filter);
  return { data, error };
}
```
3. Import in component and destructure: `const { data, error } = await getNewData('value')`
4. Handle errors: `if (error) { setError(error.message); return; }`

### Working with Real-Time Data
- Use `useEffect` with dependency array to fetch on component mount
- Store results in local state: `const [data, setData] = useState([])`
- For updates: fetch fresh data after mutations or use Supabase real-time subscriptions
- All components currently use polling pattern (no real-time subscriptions yet)

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
- `src/lib/supabaseQueries.ts` — All 50+ database functions (copy patterns from here)
- `src/components/FuelTracking.tsx` — Reference for complex component with modals + forms
- `.github/copilot-instructions.md` — This file

**Styling Reference:**
- `src/components/DashboardContent.tsx` — Status card gradients (statusMap object)
- `src/components/Login.tsx` — Coral gradient pattern

**Testing Credentials:**
```
📧 Email: dingiswayochapomba@gmail.com
🔐 Password: @malawi2017
```

---

## 🚀 Command Reference

| Task | Command |
|------|---------|
| **Full Dev** | `npm run dev` |
| **UI Only** | `npm run dev:ui` |
| **Build** | `npm run build` |
| **Preview** | `npm run preview` |
| **Test** | `npm run test` |

---

## ✅ What's Complete

- ✅ Authentication (Supabase JWT + session persistence)
- ✅ Dashboard (summary cards, user profile)
- ✅ Vehicles Management (CRUD, status filtering)
- ✅ Drivers Management (CRUD, assignment tracking)
- ✅ Fuel Tracking (log creation, editing, deletion, real-time stats)
- ✅ Fuel Analytics (6 chart types, anomaly detection, comparisons)
- ✅ Maintenance Management (history, scheduling)
- ✅ Reports Page (fleet summary, metrics)
- ✅ 50+ database query functions

## 🎯 Adding New Features

**Copy this sequence:**
1. Create component in `src/components/NewFeature.tsx`
2. Import necessary queries from `supabaseQueries.ts` (or add new functions following existing pattern)
3. Add tab to `tabNames` object and Sidebar menu in `App.tsx`
4. Use `useState`/`useEffect` for data fetching and state
5. Style with Tailwind using existing color palette (coral #EA7B7B)
6. Handle loading/error states with try-catch on query calls
