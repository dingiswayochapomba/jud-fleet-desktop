#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Firebase Drivers Seed
 * Seeds Firestore 'drivers' collection with sample data.
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var or serviceAccountKey.json in project root
 * Usage: node migrations/seed-firebase-drivers.mjs
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

const drivers = [
  { name: 'John Banda', license_number: 'DL-001-2024', license_expiry: '2026-06-15', date_of_birth: '1985-03-15', phone: '+265991234567', status: 'active' },
  { name: 'Grace Mwale', license_number: 'DL-002-2024', license_expiry: '2025-12-20', date_of_birth: '1990-05-20', phone: '+265992234567', status: 'active' },
  { name: 'Samuel Chikwanda', license_number: 'DL-003-2024', license_expiry: '2026-09-10', date_of_birth: '1982-07-22', phone: '+265993234567', status: 'active' },
  { name: 'Martha Phiri', license_number: 'DL-004-2024', license_expiry: '2026-03-05', date_of_birth: '1988-09-18', phone: '+265994234567', status: 'active' },
  { name: 'Christopher Nkhata', license_number: 'DL-005-2024', license_expiry: '2026-11-30', date_of_birth: '1992-02-14', phone: '+265995234567', status: 'active' },
  { name: 'Robert Kapito', license_number: 'DL-006-2024', license_expiry: '2026-05-20', date_of_birth: '1960-11-05', phone: '+265996234567', status: 'retired' },
  { name: 'Susan Chilembwe', license_number: 'DL-007-2024', license_expiry: '2025-08-15', date_of_birth: '1965-04-12', phone: '+265997234567', status: 'retired' },
  { name: 'David Mlambiri', license_number: 'DL-008-2024', license_expiry: '2026-07-25', date_of_birth: '1980-01-08', phone: '+265998234567', status: 'retired' },
  { name: 'Thomas Kachali', license_number: 'DL-009-2024', license_expiry: '2025-04-10', date_of_birth: '1978-06-20', phone: '+265999234567', status: 'suspended' },
  { name: 'Lucy Chirwa', license_number: 'DL-010-2024', license_expiry: '2024-12-01', date_of_birth: '1975-09-15', phone: '+265991234568', status: 'suspended' },
  { name: 'James Mwansambo', license_number: 'DL-011-2024', license_expiry: '2026-02-28', date_of_birth: '1987-10-05', phone: '+265992234568', status: 'active' },
  { name: 'Elizabeth Phimbi', license_number: 'DL-012-2024', license_expiry: '2025-10-15', date_of_birth: '1993-12-01', phone: '+265993234568', status: 'active' },
  { name: 'Peter Mapanje', license_number: 'DL-013-2024', license_expiry: '2026-08-22', date_of_birth: '1981-05-20', phone: '+265994234568', status: 'active' },
  { name: 'Victoria Kumwenda', license_number: 'DL-014-2024', license_expiry: '2026-04-10', date_of_birth: '1989-03-10', phone: '+265995234568', status: 'active' },
];

async function seedDrivers() {
  console.log('👥 Seeding drivers to Firestore...\n');
  const col = db.collection('drivers');
  const existing = await col.where('license_number', '>=', 'DL-').where('license_number', '<=', 'DL-\uf8ff').get();
  if (existing.size > 0) {
    console.warn(`⚠️  Found ${existing.size} existing drivers with DL- prefix. Skipping to avoid duplicates.`);
    console.log('   To re-seed, delete existing DL-* drivers in Firebase Console first.\n');
    process.exit(0);
  }
  let inserted = 0;
  for (const d of drivers) {
    await col.add({ ...d, created_at: new Date().toISOString() });
    inserted++;
    console.log(`✓ ${d.name} (${d.license_number})`);
  }
  const counts = drivers.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
  console.log('\n📊 Summary:', { inserted, byStatus: counts });
  console.log('✅ Drivers seed completed.\n');
  process.exit(0);
}

seedDrivers().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
