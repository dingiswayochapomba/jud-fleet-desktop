# 🔐 Supabase Authentication Setup

## Quick Start

Your Fleet Management System is now integrated with **Supabase Authentication**! Follow these steps to set it up:

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name:** `fleet-management` (or your choice)
   - **Database Password:** Create a strong password
   - **Region:** Select closest to you
5. Wait for the project to initialize (2-3 minutes)

### Step 2: Get Your Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
4. Save these securely

### Step 3: Configure Environment Variables

```bash
# Copy the template
cp .env.supabase.example backend/.env.supabase

# Edit backend/.env.supabase and paste your credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

Or set environment variables directly:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

### Step 4: Run the Login Server

```bash
cd backend
PORT=3000 node login-server.mjs
```

Then open: **http://localhost:3000**

### Step 5: Test Login

**Try signing in or creating a new account:**
- Email: `test@example.com`
- Password: `securepassword123`

The system will:
- ✅ Create new accounts automatically
- ✅ Store users in Supabase Auth
- ✅ Redirect to dashboard on success
- ✅ Show error messages if something goes wrong

---

## ✨ Features

### Authentication Methods Available:
- 📧 Email/Password (currently implemented)
- 🔑 Magic Link (email only, no password)
- 🔐 OAuth providers (Google, GitHub, etc.)
- 📱 Phone/SMS
- 🆔 Multi-factor authentication (MFA)

### Database Schema (Auto-created):

The `auth.users` table stores:
- User ID (UUID)
- Email
- Encrypted password
- Created/updated timestamps
- Session tokens

### Security Features:
- 🔒 Passwords encrypted with bcrypt
- 🛡️ Row-level security (RLS) policies
- 🔑 JWT tokens for API access
- ⏱️ Automatic token refresh
- 🚫 Rate limiting on auth endpoints

---

## 📱 Integrating with Frontend

### For React/Next.js Web App:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### For React Native/Expo Mobile App:

```typescript
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: {
    storage: SecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 🗄️ Connecting to Database

Once authenticated, access your database:

```typescript
// Fetch user's vehicles
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', user.id);

// Insert new fuel log
await supabase
  .from('fuel_logs')
  .insert({ vehicle_id: 1, liters: 50, cost: 75 });
```

---

## 🔄 User Flow

```
┌─────────────────────────────────────────┐
│         Login Page                      │
│  (http://localhost:3000)                │
└────────────────┬────────────────────────┘
                 │
         Enter Email & Password
                 │
                 ▼
         ┌──────────────────┐
         │ Supabase Auth    │
         │ Validates User   │
         └──────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   Sign In            Sign Up
   Success            (New User)
        │                 │
        └────────┬────────┘
                 │
                 ▼
         ┌──────────────────┐
         │  Dashboard       │
         │  (Logged In)     │
         └──────────────────┘
```

---

## 🚀 Next Steps

1. ✅ **Set up Supabase project** (Step 1-3 above)
2. ✅ **Configure credentials** in `.env.supabase`
3. ✅ **Start login server** and test authentication
4. 📝 Create user profile tables (name, role, department)
5. 📝 Link drivers to Supabase users
6. 📝 Add role-based access control (RBAC)
7. 📝 Implement session management
8. 📝 Add logout functionality

---

## 🐛 Troubleshooting

### "Invalid API key"
- Check `SUPABASE_ANON_KEY` is correct
- Verify it's from the **correct project**

### "User already exists"
- The email is registered in Supabase
- Use a different email or reset password

### "Connection refused"
- Make sure login server is running on port 3000
- Check: `PORT=3000 node login-server.mjs`

### "CORS error in browser"
- Add your domain to Supabase Auth settings
- Go to **Authentication → Providers → Email**
- Add your domain to allowed URLs

---

## 📚 Resources

- 📖 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- 🔐 [PostgreSQL in Supabase](https://supabase.com/docs/guides/database)
- 🚀 [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- 💡 [Auth Examples](https://github.com/supabase/supabase/tree/master/examples)

---

**Your Fleet Management System is now ready for enterprise authentication! 🎉**
