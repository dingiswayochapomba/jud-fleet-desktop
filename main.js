const { app, BrowserWindow } = require('electron');
const path = require('path');

async function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  console.log(`Checking server availability at ${url}...`);
  
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { method: 'HEAD', timeout: 5000 });
      if (res.ok || res.status === 304) {
        console.log('Server is ready!');
        return true;
      }
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`Retry ${Math.round(elapsed / 500)}: Server not ready yet...`);
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.error(`Server not responding after ${timeout}ms`);
  return false;
}

// Try multiple ports in case one is in use
async function findAvailableServer(timeout = 10000) {
  const ports = [5173, 5174, 5175, 5176];
  for (const port of ports) {
    const url = `http://localhost:${port}`;
    if (await waitForServer(url, 2000)) {
      return url;
    }
  }
  return null;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const devUrl = process.env.DEV_URL || 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development') {
    console.log('Looking for dev server...');
    const serverUrl = await findAvailableServer(30000);
    
    if (!serverUrl) {
      console.error(`Dev server not found on any port`);
      win.loadURL('data:text/html,<h1>Dev server not responding. Check console.</h1>');
      return win;
    }
    
    console.log('Dev server found at:', serverUrl);
    win.loadURL(serverUrl);
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
  
  // Handle failed loads
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  
  // Handle window close
  win.on('closed', () => {
    console.log('Window closed, cleaning up...');
    // Window object will be garbage collected
  });
  
  return win;
}

let mainWindow = null;

app.whenReady().then(() => {
  mainWindow = createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  mainWindow = null;
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app before quit
app.on('before-quit', () => {
  console.log('App quitting...');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
