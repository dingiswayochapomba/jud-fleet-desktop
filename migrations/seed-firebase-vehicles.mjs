#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Firebase Vehicles Seed
 * Seeds Firestore 'vehicles' collection with sample data.
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var or serviceAccountKey.json in project root
 * Usage: node migrations/seed-firebase-vehicles.mjs
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function initFirebase() {
  if (admin.apps.length) return admin.firestore();
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else {
    const credPath = resolve(root, 'serviceAccountKey.json');
    if (!existsSync(credPath)) {
      console.error('❌ Missing Firebase service account. Either:');
      console.error('   1. Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
      console.error('   2. Place serviceAccountKey.json in the project root');
      console.error('   Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key');
      process.exit(1);
    }
    const cred = JSON.parse(readFileSync(credPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  }
  return admin.firestore();
}

const db = initFirebase();

const vehicles = [
  { registration_number: 'JJ-16-AB', make: 'Toyota', model: 'Land Cruiser', year: 2020, mileage: 45000, status: 'available', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060295', engine_number: 'EN-LC-2020-001', purchase_date: '2020-03-15', insurance_expiry: '2026-03-14' },
  { registration_number: 'JJ-16-AC', make: 'Toyota', model: 'Hilux', year: 2019, mileage: 62500, status: 'available', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060296', engine_number: 'EN-HX-2019-001', purchase_date: '2019-05-20', insurance_expiry: '2026-05-19' },
  { registration_number: 'JJ-16-AD', make: 'Isuzu', model: 'NPR', year: 2021, mileage: 28000, status: 'available', fuel_type: 'diesel', chassis_number: 'ISUZU2021000001', engine_number: 'EN-NPR-2021-001', purchase_date: '2021-01-10', insurance_expiry: '2026-01-09' },
  { registration_number: 'JJ-16-AE', make: 'Toyota', model: 'Fortuner', year: 2018, mileage: 78500, status: 'in_use', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060297', engine_number: 'EN-FR-2018-001', purchase_date: '2018-07-22', insurance_expiry: '2025-07-21' },
  { registration_number: 'JJ-16-AF', make: 'Mercedes-Benz', model: 'Sprinter', year: 2017, mileage: 95000, status: 'in_use', fuel_type: 'diesel', chassis_number: 'MB2017000001', engine_number: 'EN-SP-2017-001', purchase_date: '2017-11-05', insurance_expiry: '2025-11-04' },
  { registration_number: 'JJ-16-AG', make: 'Nissan', model: 'Navara', year: 2020, mileage: 51200, status: 'in_use', fuel_type: 'diesel', chassis_number: 'NI2020000001', engine_number: 'EN-NV-2020-001', purchase_date: '2020-09-18', insurance_expiry: '2026-09-17' },
  { registration_number: 'JJ-16-AH', make: 'Toyota', model: 'Land Cruiser', year: 2016, mileage: 125000, status: 'maintenance', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060298', engine_number: 'EN-LC-2016-001', purchase_date: '2016-04-12', insurance_expiry: '2025-04-11' },
  { registration_number: 'JJ-16-AI', make: 'Isuzu', model: 'D-Max', year: 2019, mileage: 85300, status: 'maintenance', fuel_type: 'diesel', chassis_number: 'IZ2019000001', engine_number: 'EN-DM-2019-001', purchase_date: '2019-02-28', insurance_expiry: '2025-02-27' },
  { registration_number: 'JJ-16-AJ', make: 'Toyota', model: 'Hiace', year: 2015, mileage: 142000, status: 'broken', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060299', engine_number: 'EN-HC-2015-001', purchase_date: '2015-08-30', insurance_expiry: '2024-08-29' },
  { registration_number: 'JJ-16-AK', make: 'Toyota', model: 'Corolla', year: 2012, mileage: 185000, status: 'disposed', fuel_type: 'petrol', chassis_number: 'JT2BF18K8M0060300', engine_number: 'EN-CO-2012-001', purchase_date: '2012-06-15', insurance_expiry: '2023-06-14' },
  { registration_number: 'JJ-16-AL', make: 'Hyundai', model: 'H350', year: 2021, mileage: 32000, status: 'available', fuel_type: 'diesel', chassis_number: 'HY2021000001', engine_number: 'EN-H350-2021-001', purchase_date: '2021-10-05', insurance_expiry: '2026-10-04' },
  { registration_number: 'JJ-16-AM', make: 'Ford', model: 'Transit', year: 2020, mileage: 58000, status: 'available', fuel_type: 'diesel', chassis_number: 'FD2020000001', engine_number: 'EN-TR-2020-001', purchase_date: '2020-12-01', insurance_expiry: '2026-11-30' },
  { registration_number: 'JJ-16-AN', make: 'Volkswagen', model: 'Crafter', year: 2019, mileage: 71000, status: 'in_use', fuel_type: 'diesel', chassis_number: 'VW2019000001', engine_number: 'EN-CR-2019-001', purchase_date: '2019-03-10', insurance_expiry: '2025-03-09' },
  { registration_number: 'JJ-16-AO', make: 'Toyota', model: 'Land Cruiser Prado', year: 2021, mileage: 35000, status: 'available', fuel_type: 'diesel', chassis_number: 'JT2BF18K8M0060301', engine_number: 'EN-LCP-2021-001', purchase_date: '2021-05-20', insurance_expiry: '2026-05-19' },
];

async function seedVehicles() {
  console.log('🚗 Seeding vehicles to Firestore...\n');
  const col = db.collection('vehicles');
  const existing = await col.where('registration_number', '>=', 'JJ-').where('registration_number', '<=', 'JJ-\uf8ff').get();
  if (existing.size > 0) {
    console.warn(`⚠️  Found ${existing.size} existing vehicles with JJ- prefix. Skipping to avoid duplicates.`);
    console.log('   To re-seed, delete existing JJ-* vehicles in Firebase Console first.\n');
    process.exit(0);
  }
  let inserted = 0;
  for (const v of vehicles) {
    await col.add({ ...v, created_at: new Date().toISOString() });
    inserted++;
    console.log(`✓ ${v.registration_number} - ${v.make} ${v.model}`);
  }
  const counts = vehicles.reduce((acc, v) => { acc[v.status] = (acc[v.status] || 0) + 1; return acc; }, {});
  console.log('\n📊 Summary:', { inserted, byStatus: counts });
  console.log('✅ Vehicles seed completed.\n');
  process.exit(0);
}

seedVehicles().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
