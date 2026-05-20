const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setClickThrough: (enabled) => ipcRenderer.invoke('set-click-through', enabled),
  moveWindow: (x, y, w, h) => ipcRenderer.invoke('move-window', x, y, w, h),
  getAllDisplays: () => ipcRenderer.invoke('get-all-displays'),
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  openSettings: (data) => ipcRenderer.invoke('open-settings', data),
  onCursor: (cb) => ipcRenderer.on('cursor', (_e, d) => cb(d)),
  onSettingsAct: (cb) => ipcRenderer.on('settings-act', (_e, d) => cb(d)),
  logError: (msg) => ipcRenderer.invoke('log-error', msg),
});
