const { contextBridge } = require('electron');

// Expose a safe API to the renderer if needed in future
contextBridge.exposeInMainWorld('electron', {
  // placeholder
});
