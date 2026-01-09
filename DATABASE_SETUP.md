# Database Schema Setup Guide

Comprehensive SQL script for creating all necessary tables for the Judiciary Fleet Management System.

## 📋 Tables Included

### Core Tables

| Table | Purpose | Rows |
|-------|---------|------|
| **users** | System user accounts with role-based access | ✓ |
| **vehicles** | Fleet vehicle registry and status tracking | ✓ |
| **drivers** | Driver information, licenses, and assignments | ✓ |
| **fuel_logs** | Fuel refueling transactions and consumption | ✓ |
| **maintenance_logs** | Vehicle service history and repairs | ✓ |
| **insurance** | Insurance policies and coverage details | ✓ |

### Supporting Tables

| Table | Purpose | Rows |
|-------|---------|------|
| **audit_logs** | System audit trail for compliance | ✓ |
| **vehicle_assignments** | Historical driver-to-vehicle assignments | ✓ |
| **maintenance_schedules** | Planned maintenance tracking | ✓ |
| **alerts** | System alerts and reminders | ✓ |
| **expense_reports** | Fleet-related expense tracking | ✓ |

## 🚀 Quick Start

### Option 1: PostgreSQL via psql CLI

```bash
# Connect to your PostgreSQL database
psql -U postgres -d fleet_management

# Run the SQL script
\i database-schema.sql

# Verify tables were created
\dt
```

### Option 2: Using SQL GUI (pgAdmin, DBeaver)

1. Open your PostgreSQL client
2. Open/paste the `database-schema.sql` file
3. Execute the entire script
4. Verify all 11 tables appear in the schema

### Option 3: Using Node.js

```bash
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'your_password',
  host: 'localhost',
  port: 5432,
  database: 'fleet_management',
});

const sql = fs.readFileSync('database-schema.sql', 'utf8');
pool.query(sql, (err) => {
  if (err) console.error('Error:', err);
  else console.log('✓ Database schema created successfully');
});
```

## 📊 Database Schema Overview

### 1. Users Table
```sql
-- System users with role-based access control
users (
  id, username, email, password_hash, role,
  first_name, last_name, phone_number, is_active,
  created_at, updated_at
)

Roles: admin, fleet_manager, driver, auditor
Indexes: email, role, is_active
```

### 2. Vehicles Table
```sql
-- Fleet vehicle registry
vehicles (
  id, registration_number, make, model, year,
  status, mileage, fuel_type, tank_capacity,
  purchase_date, color, notes,
  created_at, updated_at
)

Status: available, in-use, under-maintenance, out-of-service, retired
Fuel Types: petrol, diesel, lpg, electric, hybrid
Indexes: registration_number, status, fuel_type
```

### 3. Drivers Table
```sql
-- Driver information and license management
drivers (
  id, user_id, license_number, license_expiry,
  blood_group, emergency_contact,
  assigned_vehicle_id, status,
  hire_date, retirement_date,
  no_of_accidents, no_of_violations,
  performance_rating,
  created_at, updated_at
)

Status: active, on-leave, suspended, retired
Indexes: user_id, license_number, license_expiry, status
```

### 4. Fuel Logs Table
```sql
-- Fuel refueling and consumption tracking
fuel_logs (
  id, vehicle_id, driver_id, liters, cost,
  odometer, fuel_price_per_liter, fuel_station,
  receipt_photo_url, date, notes,
  created_at, updated_at
)

Indexes: vehicle_id, driver_id, date
```

### 5. Maintenance Logs Table
```sql
-- Vehicle maintenance and service history
maintenance_logs (
  id, vehicle_id, service_type, description, cost,
  service_provider, odometer_reading, date,
  next_service_date, parts_replaced,
  mechanic_name, invoice_url, notes,
  created_at, updated_at
)

Service Types: oil-change, tire-rotation, brake-service, air-filter, spark-plug
Indexes: vehicle_id, service_type, date, next_service_date
```

### 6. Insurance Table
```sql
-- Vehicle insurance and coverage management
insurance (
  id, vehicle_id, provider, policy_number,
  policy_type, start_date, expiry_date,
  coverage_amount, premium_amount,
  claim_history, no_of_claims,
  agent_name, document_url, notes,
  created_at, updated_at
)

Policy Types: third-party, comprehensive, full-coverage
Indexes: vehicle_id, provider, expiry_date, policy_number
```

### 7-11. Supporting Tables
- **audit_logs** - Track all system changes
- **vehicle_assignments** - Historical assignment records
- **maintenance_schedules** - Planned maintenance
- **alerts** - System alerts and notifications
- **expense_reports** - Fleet expense tracking

## 🔑 Key Features

### Foreign Key Relationships
```
drivers → users (user_id)
drivers → vehicles (assigned_vehicle_id)
fuel_logs → vehicles, drivers
maintenance_logs → vehicles
insurance → vehicles
audit_logs → users
vehicle_assignments → vehicles, drivers
maintenance_schedules → vehicles
alerts → vehicles, drivers
expense_reports → vehicles, users
```

### Indexes for Performance
All tables include strategic indexes on:
- Foreign keys
- Commonly searched columns (registration_number, license_number, etc.)
- Date fields
- Status fields

### Timestamps
All tables include:
- `created_at` - Record creation time
- `updated_at` - Last modification time

## 🛡️ Security Features

### User Access Control
```sql
-- Different roles have different permissions
Role: admin        → Full system access
Role: fleet_manager → Manage vehicles, drivers, reports
Role: driver       → View assigned vehicle, log fuel
Role: auditor      → Read-only access
```

### Audit Trail
All changes are logged in `audit_logs`:
- User ID who made the change
- Entity type and ID
- Old and new values
- Timestamp

## 📝 Sample Queries

### Get Fleet Status Summary
```sql
SELECT 
  status, 
  COUNT(*) as count 
FROM vehicles 
GROUP BY status;
```

### Check Driver License Expiry (30 days)
```sql
SELECT d.*, u.email 
FROM drivers d
JOIN users u ON d.user_id = u.id
WHERE d.license_expiry <= CURRENT_DATE + INTERVAL '30 days'
AND d.status = 'active';
```

### Get Insurance Expiry Alerts
```sql
SELECT v.registration_number, i.expiry_date, i.provider
FROM insurance i
JOIN vehicles v ON i.vehicle_id = v.id
WHERE i.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
AND i.is_active = true;
```

### Calculate Fuel Efficiency
```sql
SELECT 
  v.registration_number,
  SUM(f.liters) as total_fuel,
  MAX(f.odometer) - MIN(f.odometer) as distance_km,
  ROUND((MAX(f.odometer) - MIN(f.odometer)) / SUM(f.liters), 2) as km_per_liter
FROM fuel_logs f
JOIN vehicles v ON f.vehicle_id = v.id
WHERE f.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY v.id, v.registration_number;
```

### Get Maintenance History for Vehicle
```sql
SELECT 
  service_type, 
  cost, 
  date, 
  service_provider,
  next_service_date
FROM maintenance_logs
WHERE vehicle_id = 1
ORDER BY date DESC;
```

## ⚙️ Configuration

### Before Running Script

1. **Create Database** (if not exists):
   ```bash
   createdb fleet_management
   ```

2. **Set Environment Variables** (.env):
   ```
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fleet_management
   ```

3. **Optional - Create DB User**:
   ```sql
   CREATE USER fleet_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;
   ```

## 🔄 Updating the Schema

To add new columns to existing tables:

```sql
ALTER TABLE vehicles ADD COLUMN new_column VARCHAR(100);
CREATE INDEX idx_vehicles_new_column ON vehicles(new_column);
```

To add a new table:

```sql
CREATE TABLE new_table (
  id SERIAL PRIMARY KEY,
  -- columns...
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚨 Important Notes

- **Development**: Uncomment the `DROP TABLE` statements at the top to clear existing data
- **Production**: DO NOT drop tables in production - use migrations instead
- **Backups**: Always backup your database before running schema changes
- **Indexes**: The script creates indexes for performance - adjust based on your query patterns

## 📞 Support

For issues or questions:
1. Check PostgreSQL error logs
2. Verify all foreign key relationships
3. Ensure user permissions are correctly set
4. Review audit logs for any issues

## 📄 File Location

`database-schema.sql` - Main database schema file  
`DATABASE_SETUP.md` - This documentation

---

**Last Updated:** January 9, 2026  
**Version:** 1.0  
**Status:** Production Ready
