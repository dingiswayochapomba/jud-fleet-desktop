#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Vehicles Seed Script
 * Node.js script to insert sample vehicle data into Supabase
 * Usage: node seed-vehicles.js
 * Created: January 9, 2026
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ganrduvdyhlwkeiriaqp.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjQ3MjUsImV4cCI6MjA4MzU0MDcyNX0.ZSjqnzKQoWMVxNgalPCa4M3EbDVG57mnQyvqWE6FECU';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample vehicle data
const vehicles = [
  // Available Vehicles
  {
    registration_number: 'JJ-16-AB',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2020,
    mileage: 45000,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060295',
    engine_number: 'EN-LC-2020-001',
    purchase_date: '2020-03-15',
    insurance_expiry: '2026-03-14',
  },
  {
    registration_number: 'JJ-16-AC',
    make: 'Toyota',
    model: 'Hilux',
    year: 2019,
    mileage: 62500,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060296',
    engine_number: 'EN-HX-2019-001',
    purchase_date: '2019-05-20',
    insurance_expiry: '2026-05-19',
  },
  {
    registration_number: 'JJ-16-AD',
    make: 'Isuzu',
    model: 'NPR',
    year: 2021,
    mileage: 28000,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'ISUZU2021000001',
    engine_number: 'EN-NPR-2021-001',
    purchase_date: '2021-01-10',
    insurance_expiry: '2026-01-09',
  },

  // In Use Vehicles
  {
    registration_number: 'JJ-16-AE',
    make: 'Toyota',
    model: 'Fortuner',
    year: 2018,
    mileage: 78500,
    status: 'in_use',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060297',
    engine_number: 'EN-FR-2018-001',
    purchase_date: '2018-07-22',
    insurance_expiry: '2025-07-21',
  },
  {
    registration_number: 'JJ-16-AF',
    make: 'Mercedes-Benz',
    model: 'Sprinter',
    year: 2017,
    mileage: 95000,
    status: 'in_use',
    fuel_type: 'diesel',
    chassis_number: 'MB2017000001',
    engine_number: 'EN-SP-2017-001',
    purchase_date: '2017-11-05',
    insurance_expiry: '2025-11-04',
  },
  {
    registration_number: 'JJ-16-AG',
    make: 'Nissan',
    model: 'Navara',
    year: 2020,
    mileage: 51200,
    status: 'in_use',
    fuel_type: 'diesel',
    chassis_number: 'NI2020000001',
    engine_number: 'EN-NV-2020-001',
    purchase_date: '2020-09-18',
    insurance_expiry: '2026-09-17',
  },

  // Maintenance Vehicles
  {
    registration_number: 'JJ-16-AH',
    make: 'Toyota',
    model: 'Land Cruiser',
    year: 2016,
    mileage: 125000,
    status: 'maintenance',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060298',
    engine_number: 'EN-LC-2016-001',
    purchase_date: '2016-04-12',
    insurance_expiry: '2025-04-11',
  },
  {
    registration_number: 'JJ-16-AI',
    make: 'Isuzu',
    model: 'D-Max',
    year: 2019,
    mileage: 85300,
    status: 'maintenance',
    fuel_type: 'diesel',
    chassis_number: 'IZ2019000001',
    engine_number: 'EN-DM-2019-001',
    purchase_date: '2019-02-28',
    insurance_expiry: '2025-02-27',
  },

  // Broken Vehicle
  {
    registration_number: 'JJ-16-AJ',
    make: 'Toyota',
    model: 'Hiace',
    year: 2015,
    mileage: 142000,
    status: 'broken',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060299',
    engine_number: 'EN-HC-2015-001',
    purchase_date: '2015-08-30',
    insurance_expiry: '2024-08-29',
  },

  // Disposed Vehicle
  {
    registration_number: 'JJ-16-AK',
    make: 'Toyota',
    model: 'Corolla',
    year: 2012,
    mileage: 185000,
    status: 'disposed',
    fuel_type: 'petrol',
    chassis_number: 'JT2BF18K8M0060300',
    engine_number: 'EN-CO-2012-001',
    purchase_date: '2012-06-15',
    insurance_expiry: '2023-06-14',
  },

  // Additional vehicles
  {
    registration_number: 'JJ-16-AL',
    make: 'Hyundai',
    model: 'H350',
    year: 2021,
    mileage: 32000,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'HY2021000001',
    engine_number: 'EN-H350-2021-001',
    purchase_date: '2021-10-05',
    insurance_expiry: '2026-10-04',
  },
  {
    registration_number: 'JJ-16-AM',
    make: 'Ford',
    model: 'Transit',
    year: 2020,
    mileage: 58000,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'FD2020000001',
    engine_number: 'EN-TR-2020-001',
    purchase_date: '2020-12-01',
    insurance_expiry: '2026-11-30',
  },
  {
    registration_number: 'JJ-16-AN',
    make: 'Volkswagen',
    model: 'Crafter',
    year: 2019,
    mileage: 71000,
    status: 'in_use',
    fuel_type: 'diesel',
    chassis_number: 'VW2019000001',
    engine_number: 'EN-CR-2019-001',
    purchase_date: '2019-03-10',
    insurance_expiry: '2025-03-09',
  },
  {
    registration_number: 'JJ-16-AO',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2021,
    mileage: 35000,
    status: 'available',
    fuel_type: 'diesel',
    chassis_number: 'JT2BF18K8M0060301',
    engine_number: 'EN-LCP-2021-001',
    purchase_date: '2021-05-20',
    insurance_expiry: '2026-05-19',
  },
];

async function seedVehicles() {
  console.log('🚗 Starting vehicles seed...\n');

  try {
    // Check if vehicles already exist
    const { data: existingVehicles, error: fetchError } = await supabase
      .from('vehicles')
      .select('registration_number')
      .like('registration_number', 'JJ-%');

    if (fetchError) {
      console.error('❌ Error checking existing vehicles:', fetchError.message);
      process.exit(1);
    }

    if (existingVehicles && existingVehicles.length > 0) {
      console.warn(`⚠️  Found ${existingVehicles.length} existing vehicles with JJ- prefix`);
      console.log('   Use the following SQL to clear them:');
      console.log('   DELETE FROM vehicles WHERE registration_number LIKE \'JJ-%\';\n');
      console.log('   Proceeding with seed...\n');
    }

    // Insert vehicles in batches
    const batchSize = 5;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < vehicles.length; i += batchSize) {
      const batch = vehicles.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('vehicles')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} error:`, error.message);
        errorCount += batch.length;
      } else {
        insertedCount += data?.length || 0;
        const registrations = batch.map(v => v.registration_number).join(', ');
        console.log(`✓ Batch ${i / batchSize + 1} inserted: ${registrations}`);
      }
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   Total vehicles: ${vehicles.length}`);
    console.log(`   Inserted: ${insertedCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }

    // Get status summary
    const { data: summary, error: summaryError } = await supabase
      .from('vehicles')
      .select('status')
      .like('registration_number', 'JJ-%');

    if (!summaryError && summary) {
      const statusCounts = summary.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 Vehicles by Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status.padEnd(15)}: ${count}`);
      });
    }

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedVehicles();
