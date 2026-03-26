# Judiciary Fleet Desktop - Executable Guide

## ✅ Executable Created Successfully!

Your Windows executable has been created and is ready to use.

### Location
```
c:\mantle\DevOps\fleet desktop\release\win-unpacked\electron.exe
```

### File Details
- **Filename:** `electron.exe`
- **Size:** ~165 MB (includes all dependencies and Electron runtime)
- **Type:** Standalone Windows executable
- **Architecture:** x64 (Windows 10/11 compatible)

### How to Use

#### Option 1: Direct Execution
Simply double-click `electron.exe` to launch the Judiciary Fleet Desktop application.

#### Option 2: Command Line
```bash
cd "c:\mantle\DevOps\fleet desktop\release\win-unpacked"
./electron.exe
```

---

## 🚀 Building Executables Yourself

### For Development/Testing  
```bash
npm run build:exe
```
This creates an unpacked executable in `release/win-unpacked/electron.exe`

### Production Build (NSIS Installer + Portable)
Update `package.json` build config to include:
```json
"win": {
  "target": ["nsis", "portable"]
}
```
Then run:
```bash
npm run build:exe
```

---

## 📋 Available Build Commands

| Command | Output | Purpose |
|---------|--------|---------|
| `npm run build:exe` | `release/win-unpacked/` | Unpacked executable |
| `npm run dev` | N/A (dev server) | Development mode |
| `npm run build` | `dist/` | React production bundle only |

---

## 🔧 Installation Methods (Coming Soon)

Future versions can include:
- **NSIS Installer** (.msi) - Full installation wizard
- **Portable ZIP** - Extract and run
- **Auto-updater** - Automatic updates

To enable these, update `package.json` `build.win.target` array.

---

## ❌ Troubleshooting

### "electron.exe not found"
Run `npm run build:exe` first to create the executable.

### "Cannot find dist/ folder"  
Run `npm run build` to generate the production bundle.

### Application won't start
- Ensure `main.js` and `preload.js` are in the root directory
- Check that `dist/` folder exists with `index.html`
- Check Windows Defender didn't block it (check notifications)

---

## 📦 Current Setup

- ✅ **electron-builder** installed and configured
- ✅ **Build scripts** added to package.json
- ✅ **Executable created** and ready to distribute
- ⏳ **Code signing** currently disabled (unsigned executable)
- ⏳ **NSIS installer** not yet configured

---

## 🎯 Next Steps

If you want a **complete distribution package** with installer:
1. Add author to `package.json`
2. Configure icon in `public/assets/images/icon.ico`
3. Update `build.win` config to include `"nsis"` target
4. Run `npm run build:exe` again

For now, you have a **fully functional standalone executable** ready to test!
