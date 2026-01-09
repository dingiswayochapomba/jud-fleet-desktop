-- ================================================================
-- Judiciary Fleet Management System - Seed Admin User
-- PostgreSQL SQL Script
-- Created: January 9, 2026
-- ================================================================
-- This script creates an admin user for initial system access
-- NOTE: Password should be hashed using bcrypt before production use
-- ================================================================

-- Insert admin user
-- In production, hash the password with bcrypt (e.g., using Node.js bcrypt package)
-- For development: password hash is for '@malawi2017'
INSERT INTO users (name, email, password_hash, role, created_at, updated_at)
VALUES (
  'Admin User',
  'dingiswayochapomba@gmail.com',
  '$2a$10$8XwpNe.8VmvC8qv5TqNvjOvEqZQeKvJGxvOqfQR7qVCFoWfqXZxPa',  -- bcrypt hash of '@malawi2017'
  'admin',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Verify user was created
SELECT id, name, email, role, created_at FROM users WHERE email = 'dingiswayochapomba@gmail.com';
