const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: ipcRenderer,
  startTelegramBot: () => ipcRenderer.invoke('start-telegram-bot'),
  getQRCode: () => ipcRenderer.invoke('get-qr-code'),
  submitPhoneNumber: (data) => ipcRenderer.invoke('submit-phone-number', data),
  waitForLogin: () => ipcRenderer.invoke('wait-for-login'),
  send2FACode: (code) => ipcRenderer.send('submit-2fa-code', code),
  startTelegramBot: () => ipcRenderer.invoke('start-telegram-bot'),
  onUpdateLogs: (callback) => ipcRenderer.on('update-logs', (event, message) => callback(message)),
  onShow2FAInput: (callback) => ipcRenderer.on('show-2fa-input', () => callback()),
  onShowOtherVerification: (callback) => ipcRenderer.on('show-other-verification', () => callback()),
  loginWithQR: () => ipcRenderer.invoke('login-with-qr'),
  onShowQRCode: (callback) => ipcRenderer.on('show-qrcode', callback),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  onLogMessage: (callback) => ipcRenderer.on('update-logs', callback),
  showVerificationInput: (callback) => ipcRenderer.on('show-verification-input', callback),
  startTwitterBot: (data) => ipcRenderer.invoke('start-twitter-bot', data),
  onLogMessage: (callback) => ipcRenderer.on('log-message', (event, message) => callback(event, message)),
  onShowQRCode: (callback) => ipcRenderer.on('show-qr-code', (event, qrCodeDataUrl) => callback(event, qrCodeDataUrl)),
  qrCodeScanned: () => ipcRenderer.send('qr-code-scanned'),
  submitVerification: (info) => ipcRenderer.send('submit-verification', info)
});