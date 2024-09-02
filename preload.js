const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send2FACode: (code) => ipcRenderer.send('submit-2fa-code', code),
  onUpdateLogs: (callback) => ipcRenderer.on('update-logs', (event, message) => callback(message)),
  onShow2FAInput: (callback) => ipcRenderer.on('show-2fa-input', () => callback()),
  onShowOtherVerification: (callback) => ipcRenderer.on('show-other-verification', () => callback()),
  loginWithQR: () => ipcRenderer.invoke('login-with-qr'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status')
});