const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  send: (act) => ipcRenderer.send('settings-act', act),
  onInit: (cb) => ipcRenderer.on('init', (_e, d) => cb(d)),
});
