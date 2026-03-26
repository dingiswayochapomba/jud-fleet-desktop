#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Firebase Fuel Logs Seed
 * Seeds Firestore 'fuel_logs' collection with sample fuel consumption data.
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var or serviceAccountKey.json in project root
 * Usage: node migrations/seed-firebase-fuel-logs.mjs
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

// Helper to generate past dates
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function seedFuelLogs() {
  console.log('⛽ Seeding fuel logs to Firestore...\n');
  
  // Fetch all vehicles first
  const vehicleCol = db.collection('vehicles');
  const vehicleSnap = await vehicleCol.get();
  
  if (vehicleSnap.empty) {
    console.warn('⚠️  No vehicles found in database. Please run seed-firebase-vehicles.mjs first.\n');
    process.exit(0);
  }
  
  const vehicles = [];
  vehicleSnap.forEach((doc) => {
    vehicles.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`📍 Found ${vehicles.length} vehicles. Creating fuel logs...\n`);
  
  // Fetch all drivers for assignment
  const driversCol = db.collection('drivers');
  const driversSnap = await driversCol.limit(100).get();
  const drivers = [];
  driversSnap.forEach((doc) => {
    drivers.push({ id: doc.id, ...doc.data() });
  });
  
  if (drivers.length === 0) {
    console.warn('⚠️  No drivers found in database. Please run seed-firebase-drivers.mjs first.\n');
    process.exit(0);
  }
  
  console.log(`🚗 Found ${drivers.length} drivers. Assigning to fuel logs...\n`);
  
  // Generate fuel logs for each vehicle (3-5 logs per vehicle in past 90 days)
  const fuelLogs = [];
  let logId = 1;
  
  for (const vehicle of vehicles) {
    // Skip disposed vehicles
    if (vehicle.status === 'disposed') continue;
    
    const logsPerVehicle = Math.floor(Math.random() * 3) + 3; // 3-5 logs
    const baseCost = vehicle.fuel_type === 'diesel' ? 1.15 : 0.95; // Price per litre
    let currentOdometer = vehicle.mileage || 10000;
    
    // Create array of dates for this vehicle's logs
    const logDates = [];
    for (let i = 0; i < logsPerVehicle; i++) {
      const daysInPast = Math.floor(Math.random() * 85) + 5; // Past 5-90 days
      logDates.push(daysAgo(daysInPast));
    }
    logDates.sort(); // Sort chronologically
    
    for (let i = 0; i < logsPerVehicle; i++) {
      const litres = Math.floor(Math.random() * 40) + 15; // 15-55 litres
      const cost = parseFloat((litres * baseCost + (Math.random() * 5 - 2.5)).toFixed(2));
      const kmDriven = Math.floor(Math.random() * 300) + 100; // 100-400 km per log
      
      // Random driver assignment (some logs may be without driver)
      const driverId = Math.random() > 0.2 ? drivers[Math.floor(Math.random() * drivers.length)].id : null;
      
      fuelLogs.push({
        vehicle_id: vehicle.id,
        driver_id: driverId,
        litres,
        cost,
        station_name: ['Puma Energy', 'Total', 'Caltex', 'Sonangol', 'Naftco'][Math.floor(Math.random() * 5)],
        odometer: currentOdometer + kmDriven,
        refuel_date: logDates[i],
        receipt_url: null,
      });
      
      currentOdometer += kmDriven;
      logId++;
    }
  }
  
  // Add logs in batches (Firestore has a batch write limit of 500)
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < fuelLogs.length; i += batchSize) {
    const batch = db.batch();
    const logsBatch = fuelLogs.slice(i, i + batchSize);
    
    for (const logData of logsBatch) {
      const docRef = db.collection('fuel_logs').doc();
      batch.set(docRef, {
        ...logData,
        created_at: new Date().toISOString(),
      });
    }
    
    await batch.commit();
    inserted += logsBatch.length;
    process.stdout.write(`\r✓ Inserted ${inserted} fuel logs...`);
  }
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   Total fuel logs created: ${fuelLogs.length}`);
  console.log(`   Vehicles with logs: ${vehicles.filter(v => v.status !== 'disposed').length}`);
  console.log(`   Date range: ${daysAgo(90)} to today`);
  console.log('\n✅ Fuel logs seed completed.\n');
  process.exit(0);
}

seedFuelLogs().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
