-- ============================================================
-- Emergency Fix: Disable RLS on Vehicles Table
-- ============================================================
-- This script disables Row Level Security on the vehicles table
-- Use this if you're getting "AbortError" or permission denied errors

-- Step 1: Check current RLS status for key tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('drivers', 'vehicles', 'users', 'fuel_logs', 'maintenance', 'insurance');

-- Step 2: Disable RLS on vehicles table (temporary emergency fix)
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop any existing policies on vehicles (if RLS was enabled)
DROP POLICY IF EXISTS "vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "vehicles_insert" ON vehicles;
DROP POLICY IF EXISTS "vehicles_update" ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete" ON vehicles;
DROP POLICY IF EXISTS "enable_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "allow_public_read" ON vehicles;

-- Step 4: Verify RLS is disabled for vehicles
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'vehicles';
-- Should show: rowsecurity = false

-- Step 5: Test access
SELECT COUNT(*) as total_vehicles FROM vehicles;
SELECT id, registration_number, make, model FROM vehicles LIMIT 5;
