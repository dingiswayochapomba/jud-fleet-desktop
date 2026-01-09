# Judiciary Fleet Management System - User Seeding Guide

**Created:** January 9, 2026

---

## 📝 Overview

This guide explains how to create users in the Judiciary Fleet Management System using Supabase.

---

## 👤 Admin User

**Email:** `dingiswayochapomba@gmail.com`  
**Password:** `@malawi2017`  
**Role:** `admin`

---

## 🚀 Option 1: Supabase Dashboard (Easiest)

### Step 1: Go to Supabase Auth
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select project `jud-fleet-desktop` (or your project)
3. Go to **Authentication** → **Users**

### Step 2: Create User
1. Click **"New user"** or **"Invite user"**
2. Enter email: `dingiswayochapomba@gmail.com`
3. Enter password: `@malawi2017`
4. Click **"Send invite"** or **"Create user"**

### Step 3: Verify User
1. User should appear in the Users list
2. Copy the user ID (UUID)

### Step 4: Create Database Profile
1. Go to **SQL Editor**
2. Run this query:
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin User',
  'dingiswayochapomba@gmail.com',
  'managed_by_supabase_auth',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
```

---

## 🛠️ Option 2: SQL Script (Direct Database)

### Using `seed-admin-user.sql`

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open `seed-admin-user.sql`
3. Copy all content
4. Paste in SQL Editor
5. Click **"Run"**

**Output:**
```
Successfully created 1 row
```

**Note:** This method creates the user profile but NOT the auth account. You'll need to create the auth user separately in Supabase Dashboard.

---

## 🤖 Option 3: Node.js Script (Recommended)

### Prerequisites
```bash
npm install @supabase/supabase-js
```

### Step 1: Set Environment Variables
Create a `.env` file in the project root:
```
SUPABASE_URL=https://ganrduvdyhlwkeiriaqp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MzAxMDUsImV4cCI6MTc2Nzk2NjEwNX0.NVJhPk5ijwO9MxAaYzMgLGjT8fO-zVADk3n5PvT4zIg
```

### Step 2: Run Script
```bash
node seed-admin-user.js
```

**Output:**
```
🔐 Creating admin user in Supabase...

Step 1: Creating authentication user...
✓ Auth user created: [UUID]

Step 2: Creating user profile in database...
✓ User profile created/updated

Step 3: Verifying user...
✓ User verified successfully!

📋 User Details:
   ID: [UUID]
   Name: Admin User
   Email: dingiswayochapomba@gmail.com
   Role: admin
   Created: 2026-01-09T...

✅ Admin user created successfully!

🔑 Login Credentials:
   Email: dingiswayochapomba@gmail.com
   Password: @malawi2017
```

---

## 🔐 Security Notes

### Password Hashing
- **In Development:** Passwords are stored in plain text in SQL scripts (not recommended)
- **In Production:** Always use bcrypt or Argon2 to hash passwords
- **Recommendation:** Use Supabase Auth to manage authentication - it handles password hashing automatically

### Best Practice Workflow
1. Create auth user in Supabase Dashboard (passwords hashed automatically)
2. Create database profile separately
3. Never store plain text passwords in version control

---

## 📋 Creating Additional Users

### Via Supabase Dashboard
Repeat the "Option 1" steps above.

### Via SQL Script
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Fleet Manager',
  'manager@judiciary.gov.mw',
  'managed_by_supabase_auth',
  'manager'
);

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Driver One',
  'driver1@judiciary.gov.mw',
  'managed_by_supabase_auth',
  'driver'
);
```

### Via Node.js Script
Modify `seed-admin-user.js`:
```javascript
const USERS = [
  {
    email: 'admin@judiciary.gov.mw',
    password: '@admin2017',
    name: 'Admin User',
    role: 'admin',
  },
  {
    email: 'manager@judiciary.gov.mw',
    password: '@manager2017',
    name: 'Fleet Manager',
    role: 'manager',
  },
];

// Loop through users and create each one
for (const user of USERS) {
  await createUser(user);
}
```

---

## ✅ Verification Checklist

After creating a user, verify:

- [ ] User appears in Supabase Auth → Users
- [ ] User email confirmed (if required)
- [ ] User profile exists in `users` table
- [ ] Role is correctly set (`admin`, `manager`, or `driver`)
- [ ] User can log in with email and password
- [ ] Timestamps (`created_at`, `updated_at`) are set

---

## 🔍 Testing Login

### Via API
```bash
curl -X POST "https://ganrduvdyhlwkeiriaqp.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dingiswayochapomba@gmail.com",
    "password": "@malawi2017"
  }'
```

### Via Frontend
The login form in the app should work:
1. Email: `dingiswayochapomba@gmail.com`
2. Password: `@malawi2017`
3. Click "Log in"

---

## 🐛 Troubleshooting

### "User already registered"
- User already exists in Supabase Auth
- **Solution:** Use a different email or delete the user first

### "Invalid email"
- Email format is incorrect
- **Solution:** Use valid email format (e.g., `name@domain.com`)

### "Password too weak"
- Password doesn't meet requirements
- **Solution:** Use a stronger password (min 6 characters recommended)

### "No database profile"
- User created in Auth but not in `users` table
- **Solution:** Run the SQL insert query manually

### "Cannot log in"
- Email not confirmed in Supabase Auth
- **Solution:** Check Supabase Dashboard → Auth → Users → user status

---

## 📚 Related Files

- `seed-admin-user.sql` - SQL script for creating admin user
- `seed-admin-user.js` - Node.js script for creating user via Supabase client
- `database-schema.sql` - Database schema (includes users table)
- `src/components/Login.tsx` - Frontend login form

---

**Last Updated:** January 9, 2026
