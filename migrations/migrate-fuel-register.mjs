#!/usr/bin/env node
import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function initFirebase() {
  if (admin.apps.length) return admin.firestore();

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
    return admin.firestore();
  }

  const credPath = resolve(root, 'serviceAccountKey.json');
  if (!existsSync(credPath)) {
    console.error('❌ Missing Firebase service account.');
    console.error('   Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in the project root.');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin.firestore();
}

const db = initFirebase();

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeFuelRegister(data = {}) {
  const createdAt = data.created_at || new Date().toISOString();
  return {
    date_of_top_up: data.date_of_top_up || data.date || '',
    proof_of_payment: data.proof_of_payment || data.pop || '',
    amount_to_top_up: toNumber(data.amount_to_top_up),
    general_receipt_number: data.general_receipt_number || data.receipt_number || '',
    vehicle_registration_number: data.vehicle_registration_number || data.registration_number || '',
    fuel_gas_station: data.fuel_gas_station || data.station_name || '',
    balance_after_refill: toNumber(data.balance_after_refill),
    driver_name: data.driver_name || data.driver || '',
    authorising_officer: data.authorising_officer || data.authorised_officer || '',
    activity_description: data.activity_description || data.description || '',
    created_at: createdAt,
    updated_at: data.updated_at || createdAt,
    source: data.source || 'migration',
  };
}

async function migrateLegacyCollection() {
  const primaryLedger = db.collection('primary_ledger');
  const fuelRegister = db.collection('fuel_register');
  const snapshot = await primaryLedger.get();

  let migrated = 0;
  let backfilled = 0;

  for (const doc of snapshot.docs) {
    const original = doc.data();
    const normalized = normalizeFuelRegister(original);
    const legacyDoc = { ...original, ...normalized };
    await primaryLedger.doc(doc.id).set(legacyDoc, { merge: true });
    backfilled += 1;

    if (original.source !== 'fuel_register') continue;

    const target = await fuelRegister.doc(doc.id).get();
    if (!target.exists) {
      await fuelRegister.doc(doc.id).set({ ...normalized, id: doc.id });
      migrated += 1;
    } else {
      await fuelRegister.doc(doc.id).set({ ...normalized, ...target.data(), id: doc.id }, { merge: true });
    }
  }

  return { total: snapshot.size, backfilled, migrated };
}

async function migrateEmptyCollection() {
  const fuelRegister = db.collection('fuel_register');
  const snapshot = await fuelRegister.get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const normalized = normalizeFuelRegister(data);
    await fuelRegister.doc(doc.id).set(normalized, { merge: true });
    await fuelRegister.doc(doc.id).update({
      balance_after_top_up: admin.firestore.FieldValue.delete(),
    });
  }
}

async function rebuildMonthlyBalances() {
  const [primarySnapshot, registerSnapshot] = await Promise.all([
    db.collection('primary_ledger').get(),
    db.collection('fuel_register').get(),
  ]);
  const months = new Map();
  const getMonth = (data) => data.month_key || (data.date_of_top_up || '').slice(0, 7);

  for (const doc of primarySnapshot.docs) {
    const data = doc.data();
    if (data.source === 'fuel_register') continue;
    const monthKey = getMonth(data);
    if (!/^\d{4}-\d{2}$/.test(monthKey)) continue;
    const month = months.get(monthKey) || { allocated_litres: 0, issued_litres: 0 };
    month.allocated_litres += toNumber(data.amount_to_top_up);
    months.set(monthKey, month);
  }

  for (const doc of registerSnapshot.docs) {
    const data = doc.data();
    const monthKey = getMonth(data);
    if (!/^\d{4}-\d{2}$/.test(monthKey)) continue;
    const month = months.get(monthKey) || { allocated_litres: 0, issued_litres: 0 };
    month.issued_litres += toNumber(data.amount_to_top_up);
    months.set(monthKey, month);
  }

  for (const [monthKey, totals] of months) {
    await db.collection('fuel_month_balances').doc(monthKey).set({
      month_key: monthKey,
      ...totals,
      balance_litres: totals.allocated_litres - totals.issued_litres,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  }

  return months.size;
}

async function main() {
  console.log('🔄 Starting fuel register migration...');
  const result = await migrateLegacyCollection();
  await migrateEmptyCollection();
  const months = await rebuildMonthlyBalances();

  console.log(`✅ Processed ${result.total} legacy ledger records`);
  console.log(`   Backfilled primary_ledger: ${result.backfilled}`);
  console.log(`   Created/updated fuel_register: ${result.migrated}`);
  console.log(`   Rebuilt monthly litre balances: ${months}`);
  console.log('🎯 Fuel register schema includes: date_of_top_up, proof_of_payment, amount_to_top_up, general_receipt_number, vehicle_registration_number, fuel_gas_station, balance_after_refill, driver_name, authorising_officer, activity_description');
}

main().catch((error) => {
  console.error('❌ Fuel register migration failed:', error);
  process.exit(1);
});
