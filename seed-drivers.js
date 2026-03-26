#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Drivers Seed Script
 * Node.js script to insert sample driver data into Supabase
 * Usage: node seed-drivers.js
 * Created: January 10, 2026
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ganrduvdyhlwkeiriaqp.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjQ3MjUsImV4cCI6MjA4MzU0MDcyNX0.ZSjqnzKQoWMVxNgalPCa4M3EbDVG57mnQyvqWE6FECU';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample driver data
const drivers = [
  // Active Drivers
  {
    license_number: 'DL-001-2024',
    first_name: 'John',
    last_name: 'Banda',
    phone: '+265991234567',
    email: 'john.banda@judiciary.mw',
    license_expiry: '2026-06-15',
    assigned_vehicle: 'JJ-16-AB',
    status: 'active',
    hire_date: '2020-03-10',
  },
  {
    license_number: 'DL-002-2024',
    first_name: 'Grace',
    last_name: 'Mwale',
    phone: '+265992234567',
    email: 'grace.mwale@judiciary.mw',
    license_expiry: '2025-12-20',
    assigned_vehicle: 'JJ-16-AE',
    status: 'active',
    hire_date: '2021-05-15',
  },
  {
    license_number: 'DL-003-2024',
    first_name: 'Samuel',
    last_name: 'Chikwanda',
    phone: '+265993234567',
    email: 'samuel.chikwanda@judiciary.mw',
    license_expiry: '2026-09-10',
    assigned_vehicle: 'JJ-16-AF',
    status: 'active',
    hire_date: '2019-07-22',
  },
  {
    license_number: 'DL-004-2024',
    first_name: 'Martha',
    last_name: 'Phiri',
    phone: '+265994234567',
    email: 'martha.phiri@judiciary.mw',
    license_expiry: '2026-03-05',
    assigned_vehicle: 'JJ-16-AG',
    status: 'active',
    hire_date: '2020-09-18',
  },
  {
    license_number: 'DL-005-2024',
    first_name: 'Christopher',
    last_name: 'Nkhata',
    phone: '+265995234567',
    email: 'chris.nkhata@judiciary.mw',
    license_expiry: '2026-11-30',
    assigned_vehicle: 'JJ-16-AN',
    status: 'active',
    hire_date: '2021-02-14',
  },

  // Inactive Drivers
  {
    license_number: 'DL-006-2024',
    first_name: 'Robert',
    last_name: 'Kapito',
    phone: '+265996234567',
    email: 'robert.kapito@judiciary.mw',
    license_expiry: '2026-05-20',
    assigned_vehicle: null,
    status: 'inactive',
    hire_date: '2018-11-05',
  },
  {
    license_number: 'DL-007-2024',
    first_name: 'Susan',
    last_name: 'Chilembwe',
    phone: '+265997234567',
    email: 'susan.chilembwe@judiciary.mw',
    license_expiry: '2025-08-15',
    assigned_vehicle: null,
    status: 'inactive',
    hire_date: '2019-04-12',
  },
  {
    license_number: 'DL-008-2024',
    first_name: 'David',
    last_name: 'Mlambiri',
    phone: '+265998234567',
    email: 'david.mlambiri@judiciary.mw',
    license_expiry: '2026-07-25',
    assigned_vehicle: null,
    status: 'inactive',
    hire_date: '2020-01-08',
  },

  // Suspended Drivers
  {
    license_number: 'DL-009-2024',
    first_name: 'Thomas',
    last_name: 'Kachali',
    phone: '+265999234567',
    email: 'thomas.kachali@judiciary.mw',
    license_expiry: '2025-04-10',
    assigned_vehicle: null,
    status: 'suspended',
    hire_date: '2017-06-20',
  },
  {
    license_number: 'DL-010-2024',
    first_name: 'Lucy',
    last_name: 'Chirwa',
    phone: '+265991234568',
    email: 'lucy.chirwa@judiciary.mw',
    license_expiry: '2024-12-01',
    assigned_vehicle: null,
    status: 'suspended',
    hire_date: '2018-09-15',
  },

  // Additional Active Drivers
  {
    license_number: 'DL-011-2024',
    first_name: 'James',
    last_name: 'Mwansambo',
    phone: '+265992234568',
    email: 'james.mwansambo@judiciary.mw',
    license_expiry: '2026-02-28',
    assigned_vehicle: 'JJ-16-AC',
    status: 'active',
    hire_date: '2021-10-05',
  },
  {
    license_number: 'DL-012-2024',
    first_name: 'Elizabeth',
    last_name: 'Phimbi',
    phone: '+265993234568',
    email: 'elizabeth.phimbi@judiciary.mw',
    license_expiry: '2025-10-15',
    assigned_vehicle: 'JJ-16-AD',
    status: 'active',
    hire_date: '2020-12-01',
  },
  {
    license_number: 'DL-013-2024',
    first_name: 'Peter',
    last_name: 'Mapanje',
    phone: '+265994234568',
    email: 'peter.mapanje@judiciary.mw',
    license_expiry: '2026-08-22',
    assigned_vehicle: 'JJ-16-AL',
    status: 'active',
    hire_date: '2019-05-20',
  },
  {
    license_number: 'DL-014-2024',
    first_name: 'Victoria',
    last_name: 'Kumwenda',
    phone: '+265995234568',
    email: 'victoria.kumwenda@judiciary.mw',
    license_expiry: '2026-04-10',
    assigned_vehicle: 'JJ-16-AM',
    status: 'active',
    hire_date: '2021-03-10',
  },
];

async function seedDrivers() {
  console.log('👥 Starting drivers seed...\n');

  try {
    // Check if drivers already exist
    const { data: existingDrivers, error: fetchError } = await supabase
      .from('drivers')
      .select('license_number')
      .like('license_number', 'DL-%');

    if (fetchError) {
      console.error('❌ Error checking existing drivers:', fetchError.message);
      process.exit(1);
    }

    if (existingDrivers && existingDrivers.length > 0) {
      console.warn(`⚠️  Found ${existingDrivers.length} existing drivers with DL- prefix`);
      console.log('   Use the following SQL to clear them:');
      console.log('   DELETE FROM drivers WHERE license_number LIKE \'DL-%\';\n');
      console.log('   Proceeding with seed...\n');
    }

    // Insert drivers in batches
    const batchSize = 5;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < drivers.length; i += batchSize) {
      const batch = drivers.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('drivers')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} error:`, error.message);
        errorCount += batch.length;
      } else {
        insertedCount += data?.length || 0;
        const names = batch.map(d => `${d.first_name} ${d.last_name}`).join(', ');
        console.log(`✓ Batch ${i / batchSize + 1} inserted: ${names}`);
      }
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   Total drivers: ${drivers.length}`);
    console.log(`   Inserted: ${insertedCount}`);
    if (errorCount > 0) {
      console.log(`   Errors: ${errorCount}`);
    }

    // Get status summary
    const { data: summary, error: summaryError } = await supabase
      .from('drivers')
      .select('status')
      .like('license_number', 'DL-%');

    if (!summaryError && summary) {
      const statusCounts = summary.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 Drivers by Status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status.padEnd(15)}: ${count}`);
      });
    }

    // Get license expiry summary
    const { data: licenses, error: licenseError } = await supabase
      .from('drivers')
      .select('license_number, license_expiry')
      .like('license_number', 'DL-%');

    if (!licenseError && licenses) {
      const today = new Date();
      const expiredCount = licenses.filter(d => new Date(d.license_expiry) < today).length;
      const expiring15d = licenses.filter(d => {
        const exp = new Date(d.license_expiry);
        const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
        return exp > today && exp <= in15Days;
      }).length;
      const expiring30d = licenses.filter(d => {
        const exp = new Date(d.license_expiry);
        const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        return exp > in15Days && exp <= in30Days;
      }).length;

      console.log('\n📋 License Expiry Summary:');
      console.log(`   Expired: ${expiredCount}`);
      console.log(`   0-15 days: ${expiring15d}`);
      console.log(`   15-30 days: ${expiring30d}`);
      console.log(`   30+ days: ${licenses.length - expiredCount - expiring15d - expiring30d}`);
    }

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedDrivers();
