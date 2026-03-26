-- Check and fix RLS on drivers table
-- This script disables RLS temporarily to debug the AbortError

-- First, check current RLS status:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'drivers';

-- Disable RLS on drivers table (temporary for debugging)
ALTER TABLE IF EXISTS drivers DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'drivers';

-- If RLS is still enabled after disabling, drop all policies:
DROP POLICY IF EXISTS "enable_drivers_select" ON drivers;
DROP POLICY IF EXISTS "enable_drivers_insert" ON drivers;
DROP POLICY IF EXISTS "enable_drivers_update" ON drivers;
DROP POLICY IF EXISTS "enable_drivers_delete" ON drivers;

-- Verify drivers table is now accessible
SELECT COUNT(*) as driver_count FROM drivers;

-- If you need to check what data exists:
SELECT id, name, license_number, status FROM drivers LIMIT 5;
