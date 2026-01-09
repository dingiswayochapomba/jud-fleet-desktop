import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function waitForServer(url, timeout = 10000) {
  const start = Date.now()
  // Node 18+ has global fetch
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return true
    } catch (err) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  return false
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  const devUrl = process.env.DEV_URL || 'http://localhost:5173'
  if (process.env.NODE_ENV === 'development') {
    const ok = await waitForServer(devUrl, 20000)
    if (!ok) {
      console.warn(`Dev server not responding at ${devUrl} after timeout`)
    }
    win.loadURL(devUrl)
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
