# ⚡ Quick Start - Judiciary Fleet Management System

**Last Updated:** January 9, 2026

---

## 🚀 Get Started in 3 Steps

### Step 1: Install & Start
```bash
npm install
npm run dev
```

**Result:** 
- Vite dev server starts on http://localhost:5173
- Electron app launches automatically

### Step 2: Login with Demo Credentials
```
📧 Email: dingiswayochapomba@gmail.com
🔐 Password: @malawi2017
```

Click **"Sign In"** → Dashboard loads!

### Step 3: Explore the Dashboard
✅ View your profile  
✅ See fleet summary  
✅ Check available features

---

## 📊 What's Ready Now

| Feature | Status | Location |
|---------|--------|----------|
| **Authentication** | ✅ Complete | `/src/components/Login.tsx` |
| **Session Management** | ✅ Complete | `/src/App.tsx` |
| **Dashboard** | ✅ Ready | Dashboard page |
| **Database Queries** | ✅ 30+ Functions | `/src/lib/supabaseQueries.ts` |
| **User Profiles** | ✅ Loaded | From `users` table |
| **Role-Based Access** | ✅ Supported | User role displayed |

---

## 📁 Key Files

### Authentication
- `src/components/Login.tsx` - Login form with Supabase auth
- `src/App.tsx` - Session & dashboard management
- `AUTHENTICATION.md` - Complete auth guide

### Database
- `src/lib/supabaseQueries.ts` - 30+ query functions
- `database-schema.sql` - Database schema
- `DATABASE_SCHEMA.md` - Schema documentation

### User Management
- `seed-admin-user.js` - Create users programmatically
- `seed-admin-user.sql` - SQL user creation
- `SEED_USERS.md` - User creation guide

---

## 🔑 Demo Credentials

| Field | Value |
|-------|-------|
| Email | dingiswayochapomba@gmail.com |
| Password | @malawi2017 |
| Role | admin |

---

## 🎯 Available Functions

### Vehicles
```tsx
getAllVehicles()
getVehiclesByStatus(status)
createVehicle(data)
updateVehicle(id, updates)
```

### Drivers
```tsx
getAllDrivers()
getDriversByStatus(status)
createDriver(data)
getDriversExpiringLicenses()
```

### Maintenance
```tsx
getOverdueMaintenance()
getMaintenanceByVehicle(id)
createMaintenanceRecord(data)
```

### Reports
```tsx
getFleetSummary()
getFuelConsumptionStats(vehicleId)
getExpiredInsurance()
```

**→ See `supabaseQueries.ts` for all 30+ functions**

---

## 🚦 Testing Checklist

- [ ] App loads with login screen
- [ ] Login with demo credentials works
- [ ] Dashboard shows user profile
- [ ] Logout button works
- [ ] Session persists on refresh
- [ ] Can login again after logout

---

## 📖 Documentation

| File | Purpose |
|------|---------|
| `AUTHENTICATION.md` | Complete auth guide + testing |
| `DATABASE_SCHEMA.md` | Database reference |
| `SEED_USERS.md` | Creating users |
| `README.md` | Project overview |
| `QUICKSTART.md` | Initial setup |

---

## 💡 Quick Examples

### Fetch Fleet Summary
```tsx
import { getFleetSummary } from '@/lib/supabaseQueries';

const { data, error } = await getFleetSummary();
console.log(data); // { total_vehicles: 5, active_drivers: 3, ... }
```

### Get Active Assignments
```tsx
import { getActiveAssignments } from '@/lib/supabaseQueries';

const { data, error } = await getActiveAssignments();
console.log(data); // Array of active driver-vehicle assignments
```

### Create Fuel Log
```tsx
import { createFuelLog } from '@/lib/supabaseQueries';

const { data, error } = await createFuelLog({
  vehicle_id: '...',
  driver_id: '...',
  litres: 50,
  cost: 25000,
  odometer: 125000
});
```

---

## 🔧 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Start auto-commit (every 15 min)
./auto-commit.sh  # On Mac/Linux
auto-commit.bat   # On Windows
```

---

## 🐛 Troubleshooting

**Q: Login fails with "Invalid credentials"**  
A: Check that the admin user was created. Run `seed-admin-user.js` or use the Supabase dashboard.

**Q: App won't start**  
A: Run `npm install` to ensure all dependencies are installed.

**Q: Session doesn't persist**  
A: Clear browser cache and try again.

**Q: Dashboard shows 0 for all values**  
A: No vehicles/drivers in database yet. Add test data to see values.

---

## 🎓 Learning Path

1. **Understand Auth** → Read `AUTHENTICATION.md`
2. **Learn Database Schema** → Read `DATABASE_SCHEMA.md`
3. **See Available Functions** → Check `supabaseQueries.ts`
4. **Build First Feature** → Pick a dashboard page and fetch data
5. **Add CRUD Operations** → Create, read, update, delete records

---

## 📞 Need Help?

1. Check the documentation files in root folder
2. Look at `AUTHENTICATION.md` for auth troubleshooting
3. Check `DATABASE_SCHEMA.md` for database questions
4. Review function documentation in `supabaseQueries.ts`

---

## ✅ Ready to Build

You now have:
- ✅ Full authentication system
- ✅ Database schema with 8 tables
- ✅ 30+ query functions
- ✅ Dashboard foundation
- ✅ User management
- ✅ Role-based access
- ✅ Session persistence

**Start building your features! 🚀**

---

**Current Commits:**
- `770620d` - Authentication complete + documentation
- `08fabc3` - Full Supabase integration
- `474499a` - User seeding scripts

See full history: `git log --oneline`
