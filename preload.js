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
  setTimeLastSeconds: (seconds) => ipcRenderer.invoke('set-time-last-seconds', seconds),
  getTimeFillMode: () => ipcRenderer.invoke('get-time-fill-mode'),
  setTimeFillMode: (mode) => ipcRenderer.invoke('set-time-fill-mode', mode),
  getTimeCustomSeconds: () => ipcRenderer.invoke('get-time-custom-seconds'),
  setTimeCustomSeconds: (seconds) => ipcRenderer.invoke('set-time-custom-seconds', seconds),
  getRandomSkipAnimation: () => ipcRenderer.invoke('get-random-skip-animation'),
  setRandomSkipAnimation: (skip) => ipcRenderer.invoke('set-random-skip-animation', skip),
  getSmartMatch: () => ipcRenderer.invoke('get-smart-match'),
  setSmartMatch: (enabled) => ipcRenderer.invoke('set-smart-match', enabled),
  pickWeightedRandom: () => ipcRenderer.invoke('pick-weighted-random'),
  resetSmartMatchWeights: () => ipcRenderer.invoke('reset-smart-match-weights'),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url)
})