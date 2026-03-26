#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Complete Firebase Seed
 * Seeds all Firestore collections with realistic, related data
 * Usage: node migrations/seed-all-firebase.mjs
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
      process.exit(1);
    }
    const cred = JSON.parse(readFileSync(credPath, 'utf8'));
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  }
  return admin.firestore();
}

const db = initFirebase();

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const drivers = [
  { name: 'John Banda', license_number: 'DL-001-2024', license_expiry: '2026-06-15', date_of_birth: '1985-03-15', phone: '+265991234567', status: 'active' },
  { name: 'Grace Mwale', license_number: 'DL-002-2024', license_expiry: '2025-12-20', date_of_birth: '1990-05-20', phone: '+265992234567', status: 'active' },
  { name: 'Samuel Chikwanda', license_number: 'DL-003-2024', license_expiry: '2026-09-10', date_of_birth: '1982-07-22', phone: '+265993234567', status: 'active' },
  { name: 'Martha Phiri', license_number: 'DL-004-2024', license_expiry: '2026-03-05', date_of_birth: '1988-09-18', phone: '+265994234567', status: 'active' },
  { name: 'Christopher Nkhata', license_number: 'DL-005-2024', license_expiry: '2026-11-30', date_of_birth: '1992-02-14', phone: '+265995234567', status: 'active' },
  { name: 'Robert Kapito', license_number: 'DL-006-2024', license_expiry: '2026-05-20', date_of_birth: '1960-11-05', phone: '+265996234567', status: 'retired' },
  { name: 'Susan Chilembwe', license_number: 'DL-007-2024', license_expiry: '2025-08-15', date_of_birth: '1965-04-12', phone: '+265997234567', status: 'retired' },
  { name: 'David Mlambiri', license_number: 'DL-008-2024', license_expiry: '2026-07-25', date_of_birth: '1980-01-08', phone: '+265998234567', status: 'active' },
  { name: 'Thomas Kachali', license_number: 'DL-009-2024', license_expiry: '2025-04-10', date_of_birth: '1978-06-20', phone: '+265999234567', status: 'suspended' },
  { name: 'Lucy Chirwa', license_number: 'DL-010-2024', license_expiry: '2024-12-01', date_of_birth: '1975-09-15', phone: '+265991234568', status: 'suspended' },
  { name: 'James Mwansambo', license_number: 'DL-011-2024', license_expiry: '2026-02-28', date_of_birth: '1987-10-05', phone: '+265992234568', status: 'active' },
  { name: 'Elizabeth Phimbi', license_number: 'DL-012-2024', license_expiry: '2025-10-15', date_of_birth: '1993-12-01', phone: '+265993234568', status: 'active' },
  { name: 'Peter Mapanje', license_number: 'DL-013-2024', license_expiry: '2026-08-22', date_of_birth: '1981-05-20', phone: '+265994234568', status: 'active' },
  { name: 'Victoria Kumwenda', license_number: 'DL-014-2024', license_expiry: '2026-04-10', date_of_birth: '1989-03-10', phone: '+265995234568', status: 'active' },
];

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

async function clearCollections() {
  console.log('🗑️  Clearing existing data...\n');
  const collections = ['drivers', 'vehicles', 'vehicle_assignments', 'maintenance', 'insurance', 'fuel_logs', 'vehicle_disposal', 'notifications'];
  
  for (const col of collections) {
    const snap = await db.collection(col).get();
    let deleted = 0;
    const batch = db.batch();
    snap.forEach((doc) => {
      batch.delete(doc.ref);
      deleted++;
    });
    if (deleted > 0) await batch.commit();
    console.log(`✓ Cleared ${deleted} documents from ${col}`);
  }
  console.log('');
}

async function seedDrivers() {
  console.log('👥 Seeding drivers...\n');
  const col = db.collection('drivers');
  let inserted = 0;
  const driverIds = {};

  for (const d of drivers) {
    const docRef = await col.add({ ...d, created_at: new Date().toISOString() });
    driverIds[d.license_number] = docRef.id;
    inserted++;
    console.log(`✓ ${d.name} (${d.license_number})`);
  }

  console.log(`✅ ${inserted} drivers created\n`);
  return driverIds;
}

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...\n');
  const col = db.collection('vehicles');
  let inserted = 0;
  const vehicleIds = {};

  for (const v of vehicles) {
    const docRef = await col.add({ ...v, created_at: new Date().toISOString() });
    vehicleIds[v.registration_number] = docRef.id;
    inserted++;
    console.log(`✓ ${v.registration_number} - ${v.make} ${v.model}`);
  }

  console.log(`✅ ${inserted} vehicles created\n`);
  return vehicleIds;
}

async function seedAssignments(driverIds, vehicleIds) {
  console.log('🔗 Creating vehicle assignments...\n');
  const col = db.collection('vehicle_assignments');
  const driverArray = Object.values(driverIds);
  const vehicleArray = Object.keys(vehicleIds).map(reg => ({
    reg,
    id: vehicleIds[reg],
  }));

  let inserted = 0;

  // Assign available and in_use vehicles to active drivers
  const in_useVehicles = vehicleArray.filter(v => {
    const vehicle = vehicles.find(vv => vv.registration_number === v.reg);
    return vehicle && (vehicle.status === 'available' || vehicle.status === 'in_use');
  });

  const activeDriverArray = Object.keys(driverIds)
    .filter(license => {
      const driver = drivers.find(d => d.license_number === license);
      return driver && driver.status === 'active';
    })
    .map(license => driverIds[license]);

  for (let i = 0; i < in_useVehicles.length && i < activeDriverArray.length; i++) {
    const startDays = Math.floor(Math.random() * 60) + 1;
    await col.add({
      vehicle_id: in_useVehicles[i].id,
      driver_id: activeDriverArray[i],
      start_date: new Date(Date.now() - startDays * 24 * 60 * 60 * 1000).toISOString(),
      end_date: null,
      status: 'active',
      created_at: new Date().toISOString(),
    });
    inserted++;
    console.log(`✓ ${in_useVehicles[i].reg} → Driver (${activeDriverArray[i].slice(0, 8)}...)`);
  }

  console.log(`✅ ${inserted} assignments created\n`);
}

async function seedMaintenance(vehicleIds) {
  console.log('🔧 Seeding maintenance records...\n');
  const col = db.collection('maintenance');
  const maintenanceTypes = ['service', 'repair', 'inspection'];
  const descriptions = {
    service: ['Oil change and filter replacement', 'Tire rotation and alignment', 'Battery inspection and replacement', 'Fluid top-ups'],
    repair: ['Engine repair', 'Transmission repair', 'Brake system failure', 'Suspension repair', 'Axle replacement'],
    inspection: ['Pre-delivery inspection', 'Safety inspection', 'Annual roadworthiness test'],
  };

  let inserted = 0;
  const vehicleArray = Object.values(vehicleIds);

  for (let i = 0; i < vehicleArray.length; i++) {
    const numRecords = Math.floor(Math.random() * 3) + 1; // 1-3 maintenance records per vehicle

    for (let j = 0; j < numRecords; j++) {
      const type = maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)];
      const typeDescriptions = descriptions[type];
      const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
      const endDays = Math.floor(Math.random() * 120) + 10;
      const status = Math.random() > 0.7 ? 'completed' : 'in_progress';

      await col.add({
        vehicle_id: vehicleArray[i],
        type,
        description,
        cost: Math.floor(Math.random() * 500000) + 50000, // MWK
        start_date: daysAgo(endDays + Math.floor(Math.random() * 30)),
        end_date: daysAgo(endDays),
        status,
        created_at: new Date().toISOString(),
      });
      inserted++;
    }
  }

  console.log(`✅ ${inserted} maintenance records created\n`);
}

async function seedInsurance(vehicleIds) {
  console.log('📋 Seeding insurance policies...\n');
  const col = db.collection('insurance');
  const providers = ['Zanaco Insurance', 'NICO Insurance', 'Alliance Insurance', 'Momentum Insurance', 'Metropolitan Insurance'];
  let inserted = 0;
  const vehicleArray = Object.values(vehicleIds);

  for (const vehicleId of vehicleArray) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const policyNumber = `POL-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const expiryDays = Math.floor(Math.random() * 200) + 50;

    await col.add({
      vehicle_id: vehicleId,
      policy_number: policyNumber,
      provider,
      start_date: daysAgo(180),
      expiry_date: daysFromNow(expiryDays),
      status: 'active',
      coverage_amount: Math.floor(Math.random() * 5000000) + 5000000, // MWK
      premium_amount: Math.floor(Math.random() * 500000) + 100000, // MWK
      created_at: new Date().toISOString(),
    });
    inserted++;
  }

  console.log(`✅ ${inserted} insurance policies created\n`);
}

async function seedFuelLogs(vehicleIds, driverIds) {
  console.log('⛽ Seeding fuel logs...\n');
  const col = db.collection('fuel_logs');
  const stations = ['Puma Energy', 'Total', 'Caltex', 'Sonangol', 'Naftco'];
  const driverArray = Object.values(driverIds);
  let inserted = 0;

  for (const vehicleReg of Object.keys(vehicleIds)) {
    const vehicle = vehicles.find(v => v.registration_number === vehicleReg);
    const vehicleId = vehicleIds[vehicleReg];

    // Skip disposed vehicles
    if (vehicle.status === 'disposed') continue;

    const logsPerVehicle = Math.floor(Math.random() * 5) + 8; // 8-12 logs
    const baseCost = vehicle.fuel_type === 'diesel' ? 1.15 : 0.95;
    let currentOdometer = vehicle.mileage || 10000;

    const logDates = [];
    for (let i = 0; i < logsPerVehicle; i++) {
      const daysInPast = Math.floor(Math.random() * 180) + 5; // Spread over 6 months
      logDates.push(daysAgo(daysInPast));
    }
    logDates.sort();

    for (let i = 0; i < logsPerVehicle; i++) {
      const litres = Math.floor(Math.random() * 40) + 15;
      const cost = parseFloat((litres * baseCost + (Math.random() * 5 - 2.5)).toFixed(2));
      const kmDriven = Math.floor(Math.random() * 300) + 100;
      const driverId = Math.random() > 0.2 ? driverArray[Math.floor(Math.random() * driverArray.length)] : null;

      await col.add({
        vehicle_id: vehicleId,
        driver_id: driverId,
        litres,
        cost,
        station_name: stations[Math.floor(Math.random() * stations.length)],
        odometer: currentOdometer + kmDriven,
        refuel_date: logDates[i],
        receipt_url: null,
        created_at: new Date().toISOString(),
      });

      currentOdometer += kmDriven;
      inserted++;
    }
  }

  console.log(`✅ ${inserted} fuel logs created\n`);
}

async function seedNotifications(driverIds) {
  console.log('🔔 Seeding notifications...\n');
  const col = db.collection('notifications');
  const notificationTypes = ['maintenance', 'insurance', 'fuel', 'general'];
  const messages = {
    maintenance: ['Vehicle due for scheduled maintenance', 'Overdue maintenance detected', 'Service reminder'],
    insurance: ['Insurance policy expiring soon', 'Insurance renewal required', 'Coverage review needed'],
    fuel: ['Unusual fuel consumption detected', 'Fuel efficiency below average', 'Refuel station update'],
    general: ['New system update available', 'Fleet report ready', 'Compliance check needed'],
  };

  let inserted = 0;
  const driverArray = Object.values(driverIds).slice(0, 5); // Create for first 5 drivers

  for (const driverId of driverArray) {
    const numNotifications = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numNotifications; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const typeMessages = messages[type];
      const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];
      const daysAgoCreated = Math.floor(Math.random() * 30);

      await col.add({
        user_id: driverId,
        type,
        message,
        is_read: Math.random() > 0.5,
        created_at: daysAgo(daysAgoCreated),
      });
      inserted++;
    }
  }

  console.log(`✅ ${inserted} notifications created\n`);
}

async function seedDisposal(vehicleIds) {
  console.log('♻️ Seeding vehicle disposals...\n');
  const col = db.collection('vehicle_disposal');
  const disposalMethods = ['scrap', 'auction', 'donation', 'sale'];
  const disposalReasons = [
    'High mileage - economically unviable',
    'Engine failure - major repairs needed',
    'Accident damage - frame bent',
    'Transmission failure - cost exceeds value',
    'Corrosion damage - extensive rust',
    'Policy change - fleet reduction',
  ];
  const buyers = [
    'Green Recyclers Ltd',
    'Auto Auction Malawi',
    'Vehicle Charity Foundation',
    'Regional Transport Co',
    'Scrap Metal Dealers',
    'Used Parts Dismantlers',
    'Government Disposal Agency',
  ];
  const conditions = ['poor', 'fair', 'good', 'excellent'];

  // Get all vehicles and filter only disposed ones
  const vehiclesRef = db.collection('vehicles');
  const vehiclesSnapshot = await vehiclesRef.where('status', '==', 'disposed').get();
  
  let inserted = 0;

  for (const vehicleDoc of vehiclesSnapshot.docs) {
    const vehicle = vehicleDoc.data();
    const disposalMethod = disposalMethods[Math.floor(Math.random() * disposalMethods.length)];
    
    // Determine disposal value based on method
    let disposalValue = 0;
    if (disposalMethod === 'sale') {
      disposalValue = Math.floor(Math.random() * 300000) + 50000; // 50k-350k
    } else if (disposalMethod === 'auction') {
      disposalValue = Math.floor(Math.random() * 200000) + 30000; // 30k-230k
    } else if (disposalMethod === 'scrap') {
      disposalValue = Math.floor(Math.random() * 50000) + 5000; // 5k-55k
    }
    // donation has 0 value

    const disposalDate = daysAgo(Math.floor(Math.random() * 60) + 10); // 10-70 days ago
    const finalMileage = (vehicle.mileage || 150000) + Math.floor(Math.random() * 5000);

    await col.add({
      vehicle_id: vehicleDoc.id,
      disposal_date: disposalDate,
      disposal_method: disposalMethod,
      disposal_value: disposalValue,
      buyer_name: disposalMethod === 'donation' ? null : buyers[Math.floor(Math.random() * buyers.length)],
      final_mileage: finalMileage,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      reason: disposalReasons[Math.floor(Math.random() * disposalReasons.length)],
      notes: disposalMethod === 'scrap' ? 'For parts recovery' : null,
      created_at: new Date().toISOString(),
    });
    inserted++;
  }

  console.log(`✅ ${inserted} disposal records created\n`);
}

async function main() {
  try {
    console.log('\n🌱 Starting comprehensive Firebase seed...\n');
    console.log('='.repeat(50) + '\n');

    await clearCollections();
    const driverIds = await seedDrivers();
    const vehicleIds = await seedVehicles();
    await seedAssignments(driverIds, vehicleIds);
    await seedMaintenance(vehicleIds);
    await seedInsurance(vehicleIds);
    await seedFuelLogs(vehicleIds, driverIds);
    await seedNotifications(driverIds);
    await seedDisposal(vehicleIds);

    console.log('='.repeat(50));
    console.log('\n✅ All seeds completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • ${Object.keys(driverIds).length} drivers created`);
    console.log(`   • ${Object.keys(vehicleIds).length} vehicles created`);
    console.log(`   • Vehicle assignments created`);
    console.log(`   • Maintenance records created`);
    console.log(`   • Insurance policies created`);
    console.log(`   • Fuel logs created`);
    console.log(`   • Notifications created\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

main();
