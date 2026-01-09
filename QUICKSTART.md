# 🚀 Quick Start Guide - Fleet Management System

## 5-Minute Setup

### Step 1: Prerequisites
Make sure you have installed:
- **Node.js** >= 18.0.0 ([download](https://nodejs.org))
- **PostgreSQL** >= 12 ([download](https://www.postgresql.org/download))
- **Git** ([download](https://git-scm.com/downloads))

### Step 2: Clone & Install
```bash
cd c:\mantle\DevOps\fleet\ desktop
npm install
npm run install-workspaces
```

### Step 3: Create Database
```bash
createdb fleet_management
```

### Step 4: Set Environment Variables
Copy `.env.example` to each workspace:
```bash
# Backend
cp .env.example backend/.env

# Web (optional, uses defaults)
# Mobile (optional, uses defaults)
```

Edit `backend/.env` with your PostgreSQL credentials:
```env
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Step 5: Start Development
```bash
npm run dev
```

This will start:
- ✅ **Backend API** at `http://localhost:3000`
- ✅ **Web Dashboard** at `http://localhost:3001`
- ✅ **Mobile App** (Expo - follow terminal)

### Step 6: Test
Visit `http://localhost:3000/health` to verify the API is running.

---

## 📁 Project Structure

```
fleet-management-system/
├── backend/          # Node.js Express API
├── web/              # Next.js Admin Dashboard  
├── mobile/           # React Native Driver App
├── README.md         # Full documentation
└── package.json      # Monorepo root
```

---

## 🔧 Useful Commands

```bash
# Start all services
npm run dev

# Start individual services
npm run dev:backend
npm run dev:web
npm run dev:mobile

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📚 Next Steps

1. **Read the full [README.md](./README.md)** for comprehensive documentation
2. **Check `.github/copilot-instructions.md`** for AI agent guidelines
3. **Review database schema** in `backend/src/db/connection.ts`
4. **Explore API routes** in `backend/src/routes/`
5. **Test API endpoints** using Postman or curl

---

## 🐛 Troubleshooting

**❌ Port 3000/3001 already in use?**
```bash
# Change the port in package.json scripts
npm run dev:backend -- --port 3002
```

**❌ PostgreSQL connection failed?**
```bash
# Check your .env file credentials
# Ensure PostgreSQL service is running
psql -U postgres  # Test connection
```

**❌ Module not found errors?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm run install-workspaces
```

---

## 📖 Documentation

- **[Full README](./README.md)** - Complete project guide
- **[Copilot Instructions](./.github/copilot-instructions.md)** - AI development guide
- **[API Routes](./backend/src/routes/)** - REST API endpoints
- **[Database Schema](./backend/src/db/connection.ts)** - PostgreSQL tables

---

## 🎯 Current Status

✅ **Phase 1** - Requirements & Design (Complete)
🔄 **Phase 2** - Backend & Database (In Progress)
⏳ **Phase 3** - Web Dashboard (Pending)
⏳ **Phase 4** - Mobile App (Pending)
⏳ **Phase 5** - Notifications (Pending)

---

## 💡 Need Help?

Check the [FAQ section in README.md](./README.md#-common-questions) or create an issue on GitHub.

**Happy coding! 🚗**
