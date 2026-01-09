-- ================================================================
-- Judiciary Fleet Management System - Database Schema
-- PostgreSQL SQL Script
-- Optimized for Supabase with UUID primary keys
-- Created: January 9, 2026
-- ================================================================

-- Drop existing objects if they exist (for development)
-- WARNING: This will delete all data!
-- DROP VIEW IF EXISTS fleet_summary CASCADE;
-- DROP VIEW IF EXISTS active_assignments CASCADE;
-- DROP VIEW IF EXISTS drivers_expiring_licenses CASCADE;
-- DROP VIEW IF EXISTS vehicles_expired_insurance CASCADE;
-- DROP VIEW IF EXISTS vehicles_overdue_maintenance CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS fuel_logs CASCADE;
-- DROP TABLE IF EXISTS insurance CASCADE;
-- DROP TABLE IF EXISTS maintenance CASCADE;
-- DROP TABLE IF EXISTS vehicle_assignments CASCADE;
-- DROP TABLE IF EXISTS drivers CASCADE;
-- DROP TABLE IF EXISTS vehicles CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- 1. USERS TABLE - System users with role-based access control
-- ================================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'driver')) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ================================================================
-- 2. DRIVERS TABLE - Driver information and license management
-- ================================================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  date_of_birth DATE NOT NULL,
  retirement_date DATE,
  phone TEXT,
  status TEXT CHECK (status IN ('active', 'retired', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_license_number ON drivers(license_number);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);
CREATE INDEX idx_drivers_status ON drivers(status);

-- ================================================================
-- 3. VEHICLES TABLE - Fleet vehicle information
-- ================================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT,
  mileage BIGINT DEFAULT 0,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance', 'broken', 'disposed')) DEFAULT 'available',
  purchase_date DATE,
  disposal_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- ================================================================
-- 4. VEHICLE_ASSIGNMENTS TABLE - Driver-to-vehicle assignments
-- ================================================================
CREATE TABLE vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  start_date TIMESTAMP DEFAULT now(),
  end_date TIMESTAMP,
  status TEXT CHECK (status IN ('active', 'completed')) DEFAULT 'active'
);

CREATE INDEX idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX idx_vehicle_assignments_driver ON vehicle_assignments(driver_id);
CREATE INDEX idx_vehicle_assignments_status ON vehicle_assignments(status);

-- ================================================================
-- 5. MAINTENANCE TABLE - Vehicle maintenance and service history
-- ================================================================
CREATE TABLE maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('service', 'repair', 'inspection')) NOT NULL,
  description TEXT,
  cost DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed')) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_maintenance_vehicle ON maintenance(vehicle_id);
CREATE INDEX idx_maintenance_type ON maintenance(type);
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_maintenance_end_date ON maintenance(end_date);

-- ================================================================
-- 6. INSURANCE TABLE - Vehicle insurance and coverage management
-- ================================================================
CREATE TABLE insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL,
  provider TEXT NOT NULL,
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'pending')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_insurance_vehicle ON insurance(vehicle_id);
CREATE INDEX idx_insurance_provider ON insurance(provider);
CREATE INDEX idx_insurance_expiry_date ON insurance(expiry_date);
CREATE INDEX idx_insurance_policy_number ON insurance(policy_number);

-- ================================================================
-- 7. FUEL_LOGS TABLE - Fuel refueling and consumption tracking
-- ================================================================
CREATE TABLE fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  litres DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(12, 2) NOT NULL,
  station_name TEXT,
  odometer BIGINT,
  receipt_url TEXT,
  refuel_date TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_driver ON fuel_logs(driver_id);
CREATE INDEX idx_fuel_logs_refuel_date ON fuel_logs(refuel_date);

-- ================================================================
-- 8. NOTIFICATIONS TABLE - System alerts and user notifications
-- ================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('maintenance', 'insurance', 'retirement', 'fuel', 'general')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ================================================================
-- 9. DATABASE VIEWS - Useful queries for reporting
-- ================================================================

-- View: Vehicles requiring maintenance
CREATE VIEW vehicles_overdue_maintenance AS
SELECT 
  v.id, 
  v.registration_number, 
  m.type, 
  m.end_date,
  CURRENT_DATE - m.end_date as days_overdue
FROM vehicles v
JOIN maintenance m ON v.id = m.vehicle_id
WHERE m.status != 'completed' 
  AND m.end_date < now()
ORDER BY m.end_date ASC;

-- View: Expired insurance policies
CREATE VIEW vehicles_expired_insurance AS
SELECT 
  v.id,
  v.registration_number,
  i.provider,
  i.policy_number,
  i.expiry_date,
  CURRENT_DATE - i.expiry_date as days_expired
FROM vehicles v
JOIN insurance i ON v.id = i.vehicle_id
WHERE i.status = 'active'
  AND i.expiry_date < CURRENT_DATE
ORDER BY i.expiry_date ASC;

-- View: Drivers with expiring licenses
CREATE VIEW drivers_expiring_licenses AS
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

-- View: Active vehicle assignments
CREATE VIEW active_assignments AS
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

-- View: Fleet summary statistics
CREATE VIEW fleet_summary AS
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

-- ================================================================
-- ENABLE ROW LEVEL SECURITY (Supabase specific)
-- ================================================================
-- Uncomment the following lines if using Supabase with RLS enabled:

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE insurance ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================================

-- INSERT INTO users (name, email, password_hash, role) 
-- VALUES 
--   ('Admin User', 'admin@judiciary.gov.mw', 'hashed_password', 'admin'),
--   ('Fleet Manager', 'manager@judiciary.gov.mw', 'hashed_password', 'manager'),
--   ('Driver One', 'driver1@judiciary.gov.mw', 'hashed_password', 'driver');

-- INSERT INTO vehicles (registration_number, make, model, year, purchase_date)
-- VALUES
--   ('JW 1234', 'Toyota', 'Hilux', 2020, '2020-05-15'),
--   ('JW 5678', 'Ford', 'Transit', 2019, '2019-08-20');

-- ================================================================
-- SUMMARY OF TABLES CREATED:
-- ================================================================
-- 1. users - System user accounts (3 roles: admin, manager, driver)
-- 2. drivers - Driver information and licenses
-- 3. vehicles - Fleet vehicle registry
-- 4. vehicle_assignments - Driver-to-vehicle assignment history
-- 5. maintenance - Vehicle maintenance and service records
-- 6. insurance - Insurance policies and coverage
-- 7. fuel_logs - Fuel refueling transactions
-- 8. notifications - User notifications and alerts
-- 
-- VIEWS:
-- - vehicles_overdue_maintenance - Maintenance that's past due
-- - vehicles_expired_insurance - Insurance policies that have expired
-- - drivers_expiring_licenses - Driver licenses expiring in 30 days
-- - active_assignments - Currently active driver assignments
-- - fleet_summary - Overall fleet statistics
-- ================================================================
