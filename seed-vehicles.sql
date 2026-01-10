-- ================================================================
-- Judiciary Fleet Management System - Vehicles Seed Data
-- PostgreSQL SQL Script
-- Created: January 9, 2026
-- ================================================================
-- This script inserts sample vehicle data for testing and development
-- Run this AFTER creating the database schema (database-schema.sql)
-- 
-- WARNING: This will insert test data. Clear if needed with:
-- DELETE FROM vehicles WHERE registration_number LIKE 'JJ-%';
-- ================================================================

-- Insert sample vehicles for the Judiciary fleet
-- Mix of statuses: available, in_use, maintenance, broken

INSERT INTO vehicles (
  registration_number,
  make,
  model,
  year,
  mileage,
  status,
  fuel_type,
  chassis_number,
  engine_number,
  purchase_date,
  insurance_expiry,
  created_at
) VALUES
  -- Available Vehicles
  (
    'JJ-16-AB',
    'Toyota',
    'Land Cruiser',
    2020,
    45000,
    'available',
    'diesel',
    'JT2BF18K8M0060295',
    'EN-LC-2020-001',
    '2020-03-15',
    '2026-03-14',
    now()
  ),
  (
    'JJ-16-AC',
    'Toyota',
    'Hilux',
    2019,
    62500,
    'available',
    'diesel',
    'JT2BF18K8M0060296',
    'EN-HX-2019-001',
    '2019-05-20',
    '2026-05-19',
    now()
  ),
  (
    'JJ-16-AD',
    'Isuzu',
    'NPR',
    2021,
    28000,
    'available',
    'diesel',
    'ISUZU2021000001',
    'EN-NPR-2021-001',
    '2021-01-10',
    '2026-01-09',
    now()
  ),

  -- In Use Vehicles
  (
    'JJ-16-AE',
    'Toyota',
    'Fortuner',
    2018,
    78500,
    'in_use',
    'diesel',
    'JT2BF18K8M0060297',
    'EN-FR-2018-001',
    '2018-07-22',
    '2025-07-21',
    now()
  ),
  (
    'JJ-16-AF',
    'Mercedes-Benz',
    'Sprinter',
    2017,
    95000,
    'in_use',
    'diesel',
    'MB2017000001',
    'EN-SP-2017-001',
    '2017-11-05',
    '2025-11-04',
    now()
  ),
  (
    'JJ-16-AG',
    'Nissan',
    'Navara',
    2020,
    51200,
    'in_use',
    'diesel',
    'NI2020000001',
    'EN-NV-2020-001',
    '2020-09-18',
    '2026-09-17',
    now()
  ),

  -- Maintenance Vehicles
  (
    'JJ-16-AH',
    'Toyota',
    'Land Cruiser',
    2016,
    125000,
    'maintenance',
    'diesel',
    'JT2BF18K8M0060298',
    'EN-LC-2016-001',
    '2016-04-12',
    '2025-04-11',
    now()
  ),
  (
    'JJ-16-AI',
    'Isuzu',
    'D-Max',
    2019,
    85300,
    'maintenance',
    'diesel',
    'IZ2019000001',
    'EN-DM-2019-001',
    '2019-02-28',
    '2025-02-27',
    now()
  ),

  -- Broken Vehicle
  (
    'JJ-16-AJ',
    'Toyota',
    'Hiace',
    2015,
    142000,
    'broken',
    'diesel',
    'JT2BF18K8M0060299',
    'EN-HC-2015-001',
    '2015-08-30',
    '2024-08-29',
    now()
  ),

  -- Disposed Vehicle (for records)
  (
    'JJ-16-AK',
    'Toyota',
    'Corolla',
    2012,
    185000,
    'disposed',
    'petrol',
    'JT2BF18K8M0060300',
    'EN-CO-2012-001',
    '2012-06-15',
    '2023-06-14',
    now()
  ),

  -- Additional vehicles for realistic fleet size
  (
    'JJ-16-AL',
    'Hyundai',
    'H350',
    2021,
    32000,
    'available',
    'diesel',
    'HY2021000001',
    'EN-H350-2021-001',
    '2021-10-05',
    '2026-10-04',
    now()
  ),
  (
    'JJ-16-AM',
    'Ford',
    'Transit',
    2020,
    58000,
    'available',
    'diesel',
    'FD2020000001',
    'EN-TR-2020-001',
    '2020-12-01',
    '2026-11-30',
    now()
  ),
  (
    'JJ-16-AN',
    'Volkswagen',
    'Crafter',
    2019,
    71000,
    'in_use',
    'diesel',
    'VW2019000001',
    'EN-CR-2019-001',
    '2019-03-10',
    '2025-03-09',
    now()
  ),
  (
    'JJ-16-AO',
    'Toyota',
    'Land Cruiser Prado',
    2021,
    35000,
    'available',
    'diesel',
    'JT2BF18K8M0060301',
    'EN-LCP-2021-001',
    '2021-05-20',
    '2026-05-19',
    now()
  );

-- ================================================================
-- Summary Statistics
-- ================================================================
-- Run this query to see a summary of inserted vehicles:
-- SELECT status, COUNT(*) as count FROM vehicles 
-- WHERE registration_number LIKE 'JJ-%' 
-- GROUP BY status;

-- Expected output:
-- status      | count
-- -----------+-------
-- available  |   6
-- in_use     |   3
-- maintenance|   2
-- broken     |   1
-- disposed   |   1

-- Total vehicles inserted: 13

-- ================================================================
-- Notes
-- ================================================================
-- - All registration numbers follow Malawi format: JJ-16-XX
-- - All vehicles use realistic makes/models common in Africa
-- - Insurance expiry dates reflect realistic timeframes
-- - Mix of statuses for comprehensive testing
-- - Fuel types: mostly diesel (commercial preference) with one petrol
-- - Years range from 2012-2021 showing fleet age diversity
-- - Mileage realistic for Malawi driving conditions
-- ================================================================
