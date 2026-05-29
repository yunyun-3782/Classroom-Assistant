const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  onMessage: (callback) => ipcRenderer.on('message', callback),
  sendMessage: (channel, data) => {
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowRestore: () => ipcRenderer.send('window-restore'),
  windowClose: () => ipcRenderer.send('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getRandomMaxNumber: () => ipcRenderer.invoke('get-random-max-number'),
  setRandomMaxNumber: (maxNumber) => ipcRenderer.invoke('set-random-max-number', maxNumber),
  getTimeLastSeconds: () => ipcRenderer.invoke('get-time-last-seconds'),
  setTimeLastSeconds: (seconds) => ipcRenderer.invoke('set-time-last-seconds', seconds)
})