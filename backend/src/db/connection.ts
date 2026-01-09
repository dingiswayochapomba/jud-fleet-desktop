import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fleet_management',
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

export async function initializePool() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Database connected at:', res.rows[0].now);
    await createTables();
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
}

async function createTables() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'viewer',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drivers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        license_number VARCHAR(50) UNIQUE NOT NULL,
        license_expiry DATE,
        retirement_date DATE,
        phone VARCHAR(20),
        address TEXT,
        assigned_vehicle_id INTEGER,
        status VARCHAR(20) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Vehicles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        registration_number VARCHAR(50) UNIQUE NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        chassis_number VARCHAR(50),
        engine_number VARCHAR(50),
        status VARCHAR(20) DEFAULT 'available',
        mileage INTEGER DEFAULT 0,
        fuel_type VARCHAR(20),
        tank_capacity DECIMAL(5, 2),
        purchase_date DATE,
        insurance_expiry DATE,
        next_service_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Fuel logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS fuel_logs (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        driver_id INTEGER REFERENCES drivers(id),
        liters DECIMAL(8, 2) NOT NULL,
        cost DECIMAL(10, 2),
        odometer INTEGER,
        date_refueled TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        receipt_url VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Maintenance logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        service_type VARCHAR(100),
        description TEXT,
        cost DECIMAL(10, 2),
        service_date DATE,
        next_service_date DATE,
        completed_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insurance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS insurance (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
        provider VARCHAR(100),
        policy_number VARCHAR(100) UNIQUE,
        cover_amount DECIMAL(15, 2),
        start_date DATE,
        expiry_date DATE,
        document_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ All tables created/verified successfully');
  } catch (err) {
    console.error('❌ Error creating tables:', err);
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}
