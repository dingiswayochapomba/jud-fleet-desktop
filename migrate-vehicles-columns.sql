-- ================================================================
-- Judiciary Fleet Management System - Add Vehicle Details Columns
-- Migration for existing databases
-- Created: January 9, 2026
-- ================================================================
-- This migration adds missing columns to the vehicles table:
-- - fuel_type
-- - chassis_number
-- - engine_number
-- - insurance_expiry
-- 
-- Run this if you already have a vehicles table created
-- ================================================================

-- Add fuel_type column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'diesel' 
CHECK (fuel_type IN ('diesel', 'petrol', 'hybrid', 'electric'));

-- Add chassis_number column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS chassis_number TEXT;

-- Add engine_number column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS engine_number TEXT;

-- Add insurance_expiry column
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS insurance_expiry DATE;

-- Add index on insurance_expiry for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicles_insurance_expiry ON vehicles(insurance_expiry);

-- ================================================================
-- Verification
-- ================================================================
-- Run this to verify all columns exist:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'vehicles' ORDER BY ordinal_position;
-- ================================================================
