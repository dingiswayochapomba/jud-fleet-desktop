# Running the Desktop App

## Quick Start (Single Command)

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

### Option 2: Using Scripts

**Windows (Command Prompt/PowerShell):**
```bash
./start.bat
```
or simply double-click `start.bat`

**macOS/Linux (Bash/Terminal):**
```bash
./start.sh
```
or
```bash
bash start.sh
```

## What Happens

When you run any of these commands, the following servers start automatically:

1. **Vite Dev Server** - Running on `http://localhost:5173/`
   - Hot module replacement (HMR) for fast development
   - React components auto-reload on changes

2. **Electron App** - Desktop application window
   - Opens automatically once Vite server is ready
   - Connects to the dev server to load the React app
   - Displays the Judiciary Fleet Management login interface

## Individual Commands

If you need to run servers separately:

```bash
# Only Vite dev server
npm run dev:ui

# Only Electron app
npm run dev:electron
```

## Production Build

To build the app for production:

```bash
npm run build
```

Output files will be in the `dist/` directory.

## Troubleshooting

- **Blank window?** - Make sure the Vite dev server started successfully and is running on port 5173
- **Port already in use?** - Kill the process using port 5173: `lsof -ti:5173 | xargs kill -9` (macOS/Linux) or `netstat -ano | findstr :5173` (Windows)
- **Electron won't start?** - Check that Node.js and npm are installed: `node --version` and `npm --version`

## Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Desktop Framework:** Electron 27
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS
- **Authentication:** Supabase
- **Icons:** Lucide React
