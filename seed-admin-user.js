#!/usr/bin/env node

/**
 * Judiciary Fleet Management System - User Creation Script
 * Usage: node seed-admin-user.js
 * 
 * This script creates an admin user in Supabase
 * Requires: SUPABASE_URL and SUPABASE_ANON_KEY environment variables
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ganrduvdyhlwkeiriaqp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MzAxMDUsImV4cCI6MTc2Nzk2NjEwNX0.NVJhPk5ijwO9MxAaYzMgLGjT8fO-zVADk3n5PvT4zIg';

const USER_EMAIL = 'dingiswayochapomba@gmail.com';
const USER_PASSWORD = '@malawi2017';
const USER_NAME = 'Admin User';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user in Supabase...\n');

    // Step 1: Create auth user via Supabase Auth
    console.log('Step 1: Creating authentication user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: USER_EMAIL,
      password: USER_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('✓ User already exists in auth system');
      } else {
        throw authError;
      }
    } else {
      console.log(`✓ Auth user created: ${authData.user.id}`);
    }

    // Step 2: Create or update user profile in database
    console.log('\nStep 2: Creating user profile in database...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          email: USER_EMAIL,
          name: USER_NAME,
          role: 'admin',
          password_hash: authData?.user?.user_metadata?.password || 'managed_by_auth',
        },
        { onConflict: 'email' }
      )
      .select();

    if (userError) {
      throw userError;
    }

    console.log(`✓ User profile created/updated`);

    // Step 3: Verify user was created
    console.log('\nStep 3: Verifying user...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('email', USER_EMAIL)
      .single();

    if (verifyError) {
      throw verifyError;
    }

    console.log('✓ User verified successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${verifyData.id}`);
    console.log(`   Name: ${verifyData.name}`);
    console.log(`   Email: ${verifyData.email}`);
    console.log(`   Role: ${verifyData.role}`);
    console.log(`   Created: ${verifyData.created_at}\n`);

    console.log('✅ Admin user created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${USER_EMAIL}`);
    console.log(`   Password: ${USER_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
