# Judiciary Fleet Management System - Database Schema

**Created:** January 9, 2026  
**Database Type:** PostgreSQL (Supabase)  
**Optimization:** UUID primary keys, Supabase-ready

---

## 📊 Overview

The database schema consists of:
- **8 Core Tables** for managing users, vehicles, drivers, assignments, maintenance, insurance, fuel logs, and notifications
- **5 SQL Views** for reporting and dashboard queries
- **Row Level Security (RLS) Support** for Supabase

Total schema file: `database-schema.sql` (~450 lines)

---

## 📋 Tables

### 1. **users** - System User Accounts
Stores system users with role-based access control.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| name | TEXT | - | User's full name |
| email | TEXT | UNIQUE | Unique email address |
| password_hash | TEXT | - | Hashed password |
| role | TEXT | - | `'admin'`, `'manager'`, or `'driver'` |
| created_at | TIMESTAMP | - | `DEFAULT now()` |
| updated_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_users_email` - For fast email lookups (authentication)
- `idx_users_role` - For filtering by role

---

### 2. **drivers** - Driver Information & License Management
Stores driver profiles, license information, and assignment status.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| user_id | UUID | FK | References `users.id`, ON DELETE SET NULL |
| name | TEXT | - | Driver's full name |
| license_number | TEXT | UNIQUE | License ID/number |
| license_expiry | DATE | - | License expiration date |
| date_of_birth | DATE | - | Driver's DOB |
| retirement_date | DATE | - | Optional retirement date |
| phone | TEXT | - | Contact phone number |
| status | TEXT | - | `'active'`, `'retired'`, or `'suspended'` |
| created_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_drivers_user_id` - For user lookups
- `idx_drivers_license_number` - For license lookups
- `idx_drivers_license_expiry` - For expiration checks
- `idx_drivers_status` - For status filtering

---

### 3. **vehicles** - Fleet Vehicle Registry
Stores vehicle information and status.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| registration_number | TEXT | UNIQUE | Vehicle plate/registration |
| make | TEXT | - | Manufacturer (e.g., "Toyota") |
| model | TEXT | - | Model name (e.g., "Hilux") |
| year | INT | - | Year of manufacture |
| mileage | BIGINT | - | Current mileage in km |
| status | TEXT | - | `'available'`, `'in_use'`, `'maintenance'`, `'broken'`, `'disposed'` |
| purchase_date | DATE | - | When acquired |
| disposal_date | DATE | - | When disposed (if applicable) |
| created_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_vehicles_registration` - For registration lookups
- `idx_vehicles_status` - For status filtering

---

### 4. **vehicle_assignments** - Driver-to-Vehicle Assignments
Tracks which driver is assigned to which vehicle and when.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| vehicle_id | UUID | FK | References `vehicles.id`, ON DELETE CASCADE |
| driver_id | UUID | FK | References `drivers.id`, ON DELETE CASCADE |
| start_date | TIMESTAMP | - | Assignment start date |
| end_date | TIMESTAMP | - | Assignment end date (NULL if active) |
| status | TEXT | - | `'active'` or `'completed'` |

**Indexes:**
- `idx_vehicle_assignments_vehicle` - For vehicle lookups
- `idx_vehicle_assignments_driver` - For driver lookups
- `idx_vehicle_assignments_status` - For status filtering

---

### 5. **maintenance** - Vehicle Maintenance & Service History
Tracks maintenance, repairs, and inspections for vehicles.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| vehicle_id | UUID | FK | References `vehicles.id`, ON DELETE CASCADE |
| type | TEXT | - | `'service'`, `'repair'`, or `'inspection'` |
| description | TEXT | - | Details of work performed |
| cost | DECIMAL(12,2) | - | Cost of maintenance |
| start_date | DATE | - | Maintenance start date |
| end_date | DATE | - | Maintenance end date |
| status | TEXT | - | `'scheduled'`, `'in_progress'`, or `'completed'` |
| created_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_maintenance_vehicle` - For vehicle lookups
- `idx_maintenance_type` - For type filtering
- `idx_maintenance_status` - For status filtering
- `idx_maintenance_end_date` - For overdue checks

---

### 6. **insurance** - Vehicle Insurance & Coverage
Stores insurance policies for vehicles.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| vehicle_id | UUID | FK | References `vehicles.id`, ON DELETE CASCADE |
| policy_number | TEXT | - | Insurance policy ID |
| provider | TEXT | - | Insurance company name |
| start_date | DATE | - | Policy start date |
| expiry_date | DATE | - | Policy expiration date |
| status | TEXT | - | `'active'`, `'expired'`, or `'pending'` |
| created_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_insurance_vehicle` - For vehicle lookups
- `idx_insurance_provider` - For provider filtering
- `idx_insurance_expiry_date` - For expiration checks
- `idx_insurance_policy_number` - For policy lookups

---

### 7. **fuel_logs** - Fuel Refueling & Consumption Tracking
Records every fuel refueling transaction.

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| vehicle_id | UUID | FK | References `vehicles.id`, ON DELETE CASCADE |
| driver_id | UUID | FK | References `drivers.id`, ON DELETE SET NULL |
| litres | DECIMAL(10,2) | - | Liters of fuel |
| cost | DECIMAL(12,2) | - | Total cost |
| station_name | TEXT | - | Fuel station name |
| odometer | BIGINT | - | Vehicle odometer reading |
| receipt_url | TEXT | - | URL to receipt photo |
| refuel_date | TIMESTAMP | - | When refueling occurred |

**Indexes:**
- `idx_fuel_logs_vehicle` - For vehicle lookups
- `idx_fuel_logs_driver` - For driver lookups
- `idx_fuel_logs_refuel_date` - For date range queries

---

### 8. **notifications** - System Alerts & User Notifications
Stores notifications for users (maintenance alerts, expiring insurance, etc.).

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | UUID | PK | `DEFAULT gen_random_uuid()` |
| user_id | UUID | FK | References `users.id`, ON DELETE CASCADE |
| type | TEXT | - | `'maintenance'`, `'insurance'`, `'retirement'`, `'fuel'`, `'general'` |
| message | TEXT | - | Notification message |
| is_read | BOOLEAN | - | `DEFAULT false` |
| created_at | TIMESTAMP | - | `DEFAULT now()` |

**Indexes:**
- `idx_notifications_user` - For user lookups
- `idx_notifications_is_read` - For read/unread filtering
- `idx_notifications_created_at` - For date filtering

---

## 🔍 SQL Views (For Reporting & Dashboards)

### 1. **vehicles_overdue_maintenance**
Returns vehicles that are past their scheduled maintenance dates.

```sql
SELECT 
  v.id, 
  v.registration_number, 
  m.type, 
  m.end_date,
  CURRENT_DATE - m.end_date as days_overdue
FROM vehicles v
JOIN maintenance m ON v.id = m.vehicle_id
WHERE m.status != 'completed' AND m.end_date < now()
ORDER BY m.end_date ASC;
```

---

### 2. **vehicles_expired_insurance**
Returns vehicles with expired insurance policies.

```sql
SELECT 
  v.id,
  v.registration_number,
  i.provider,
  i.policy_number,
  i.expiry_date,
  CURRENT_DATE - i.expiry_date as days_expired
FROM vehicles v
JOIN insurance i ON v.id = i.vehicle_id
WHERE i.status = 'active' AND i.expiry_date < CURRENT_DATE
ORDER BY i.expiry_date ASC;
```

---

### 3. **drivers_expiring_licenses**
Returns drivers whose licenses will expire within 30 days.

```sql
SELECT 
  d.id,
  d.name,
  d.license_number,
  d.license_expiry,
  d.license_expiry - CURRENT_DATE as days_until_expiry
FROM drivers d
WHERE d.status = 'active'
  AND d.license_expiry <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY d.license_expiry ASC;
```

---

### 4. **active_assignments**
Returns currently active driver-to-vehicle assignments.

```sql
SELECT 
  va.id,
  va.vehicle_id,
  v.registration_number as vehicle,
  va.driver_id,
  d.name as driver,
  va.start_date,
  va.status
FROM vehicle_assignments va
JOIN vehicles v ON va.vehicle_id = v.id
JOIN drivers d ON va.driver_id = d.id
WHERE va.status = 'active'
ORDER BY va.start_date DESC;
```

---

### 5. **fleet_summary**
Returns overall fleet statistics.

```sql
SELECT 
  COUNT(DISTINCT v.id) as total_vehicles,
  COUNT(DISTINCT CASE WHEN v.status = 'available' THEN v.id END) as available_vehicles,
  COUNT(DISTINCT CASE WHEN v.status = 'in_use' THEN v.id END) as in_use_vehicles,
  COUNT(DISTINCT CASE WHEN v.status = 'maintenance' THEN v.id END) as maintenance_vehicles,
  COUNT(DISTINCT CASE WHEN v.status = 'broken' THEN v.id END) as broken_vehicles,
  COUNT(DISTINCT d.id) as total_drivers,
  COUNT(DISTINCT CASE WHEN d.status = 'active' THEN d.id END) as active_drivers
FROM vehicles v
FULL OUTER JOIN drivers d ON TRUE;
```

---

## 🔐 Row Level Security (RLS) - Supabase

The schema includes commented-out RLS policies for Supabase security:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

To enable RLS:
1. Uncomment these lines in `database-schema.sql`
2. Create RLS policies in Supabase dashboard
3. Test with different user roles

---

## 🚀 Setup Instructions

### 1. In Supabase Dashboard
1. Go to **SQL Editor**
2. Copy the entire contents of `database-schema.sql`
3. Paste and execute

### 2. Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should return 8 tables (users, drivers, vehicles, vehicle_assignments, maintenance, insurance, fuel_logs, notifications)

### 3. Verify Views Created
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public';
```

Should return 5 views (vehicles_overdue_maintenance, vehicles_expired_insurance, drivers_expiring_licenses, active_assignments, fleet_summary)

### 4. Test a View
```sql
SELECT * FROM fleet_summary;
```

---

## 📝 Sample Queries

### Get all active drivers
```sql
SELECT * FROM drivers WHERE status = 'active';
```

### Get available vehicles
```sql
SELECT * FROM vehicles WHERE status = 'available';
```

### Get current assignments
```sql
SELECT * FROM active_assignments;
```

### Get vehicles needing maintenance
```sql
SELECT * FROM vehicles_overdue_maintenance;
```

### Get expired insurance
```sql
SELECT * FROM vehicles_expired_insurance;
```

### Get drivers with expiring licenses
```sql
SELECT * FROM drivers_expiring_licenses;
```

### Calculate fuel consumption for a vehicle
```sql
SELECT 
  vehicle_id,
  COUNT(*) as refuel_count,
  SUM(litres) as total_litres,
  SUM(cost) as total_cost,
  AVG(litres) as avg_litres_per_refuel
FROM fuel_logs
WHERE vehicle_id = '...'
GROUP BY vehicle_id;
```

---

## 🔄 Data Relationships

```
users (1) ──→ drivers (many)
users (1) ──→ notifications (many)

drivers (many) ──→ (many) vehicles [vehicle_assignments]

vehicles (1) ──→ maintenance (many)
vehicles (1) ──→ insurance (many)
vehicles (1) ──→ fuel_logs (many)
vehicles (many) ──→ (many) drivers [vehicle_assignments]

drivers (many) ──→ fuel_logs (many)
```

---

## ✅ Quick Checklist

- [ ] Schema created in Supabase
- [ ] All 8 tables exist
- [ ] All 5 views exist
- [ ] Sample data inserted (optional)
- [ ] RLS policies configured (optional)
- [ ] Frontend connected to Supabase
- [ ] API functions created for common queries

---

**Last Updated:** January 9, 2026
