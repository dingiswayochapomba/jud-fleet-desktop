-- ================================================================
-- Judiciary Fleet Management System - Drivers Seed Data
-- PostgreSQL SQL Script
-- Created: January 10, 2026
-- ================================================================
-- This script inserts sample driver data for testing and development
-- Run this AFTER creating the database schema (database-schema.sql)
-- 
-- WARNING: This will insert test data. Clear if needed with:
-- DELETE FROM drivers WHERE license_number LIKE 'DL-%';
-- ================================================================

-- Insert sample drivers for the Judiciary fleet
-- Mix of statuses: active, retired, suspended
-- Mix of license expiry dates for testing expiry alerts

INSERT INTO drivers (
  name,
  license_number,
  license_expiry,
  date_of_birth,
  phone,
  status,
  created_at
) VALUES
  -- Active Drivers (5 drivers)
  (
    'John Banda',
    'DL-001-2024',
    '2026-06-15',
    '1985-03-15',
    '+265991234567',
    'active',
    now()
  ),
  (
    'Grace Mwale',
    'DL-002-2024',
    '2025-12-20',
    '1990-05-20',
    '+265992234567',
    'active',
    now()
  ),
  (
    'Samuel Chikwanda',
    'DL-003-2024',
    '2026-09-10',
    '1982-07-22',
    '+265993234567',
    'active',
    now()
  ),
  (
    'Martha Phiri',
    'DL-004-2024',
    '2026-03-05',
    '1988-09-18',
    '+265994234567',
    'active',
    now()
  ),
  (
    'Christopher Nkhata',
    'DL-005-2024',
    '2026-11-30',
    '1992-02-14',
    '+265995234567',
    'active',
    now()
  ),

  -- Retired Drivers (3 drivers)
  (
    'Robert Kapito',
    'DL-006-2024',
    '2026-05-20',
    '1960-11-05',
    '+265996234567',
    'retired',
    now()
  ),
  (
    'Susan Chilembwe',
    'DL-007-2024',
    '2025-08-15',
    '1965-04-12',
    '+265997234567',
    'retired',
    now()
  ),
  (
    'David Mlambiri',
    'DL-008-2024',
    '2026-07-25',
    '1980-01-08',
    '+265998234567',
    'retired',
    now()
  ),

  -- Suspended Drivers (2 drivers - license issues)
  (
    'Thomas Kachali',
    'DL-009-2024',
    '2025-04-10',
    '1978-06-20',
    '+265999234567',
    'suspended',
    now()
  ),
  (
    'Lucy Chirwa',
    'DL-010-2024',
    '2024-12-01',
    '1975-09-15',
    '+265991234568',
    'suspended',
    now()
  ),

  -- Additional Active Drivers (4 drivers)
  (
    'James Mwansambo',
    'DL-011-2024',
    '2026-02-28',
    '1987-10-05',
    '+265992234568',
    'active',
    now()
  ),
  (
    'Elizabeth Phimbi',
    'DL-012-2024',
    '2025-10-15',
    '1993-12-01',
    '+265993234568',
    'active',
    now()
  ),
  (
    'Peter Mapanje',
    'DL-013-2024',
    '2026-08-22',
    '1981-05-20',
    '+265994234568',
    'active',
    now()
  ),
  (
    'Victoria Kumwenda',
    'DL-014-2024',
    '2026-04-10',
    '1989-03-10',
    '+265995234568',
    'active',
    now()
  );

-- Verify insertion
SELECT COUNT(*) as total_drivers, 
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
       SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) as retired_count,
       SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_count
FROM drivers 
WHERE license_number LIKE 'DL-%';
