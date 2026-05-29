const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const ini = require('ini')

if (process.platform === 'win32') {
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('disable-software-rasterizer')
  app.commandLine.appendSwitch('disable-gpu-compositing')
}

let mainWindow

const configDir = path.join(app.getPath('appData'), 'classroom-assistant', 'ca')
const configPath = path.join(configDir, 'memory.ini')

const defaultConfig = {
  Random: {
    MaxNumber: 75
  },
  Time: {
    LastSeconds: 300
  }
}

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }
}

function loadConfig() {
  ensureConfigDir()
  if (!fs.existsSync(configPath)) {
    saveConfig(defaultConfig)
    return defaultConfig
  }
  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    const config = ini.parse(content)
    if (!config.Random || typeof config.Random.MaxNumber !== 'number') {
      config.Random = defaultConfig.Random
    }
    if (!config.Time || typeof config.Time.LastSeconds !== 'number') {
      config.Time = defaultConfig.Time
    }
    saveConfig(config)
    return config
  } catch (e) {
    saveConfig(defaultConfig)
    return defaultConfig
  }
}

function saveConfig(config) {
  ensureConfigDir()
  fs.writeFileSync(configPath, ini.stringify(config), 'utf-8')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: '课堂小助手',
    icon: path.join(__dirname, 'assets/icon.ico'),
    frame: false,
    transparent: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  })

  mainWindow.loadFile('index.html')

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function showAbout() {
  const { dialog } = require('electron')
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于课堂小助手',
    message: '课堂小助手 v1.0.0',
    detail: '一款专为课堂教学设计的辅助工具\n支持Windows 7及以上系统'
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-app-name', () => {
  return app.getName()
})

ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window-restore', () => {
  if (mainWindow && mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

ipcMain.handle('get-config', () => {
  return loadConfig()
})

ipcMain.handle('save-config', (event, config) => {
  saveConfig(config)
  return true
})

ipcMain.handle('get-random-max-number', () => {
  const config = loadConfig()
  return config.Random.MaxNumber
})

ipcMain.handle('set-random-max-number', (event, maxNumber) => {
  const config = loadConfig()
  config.Random.MaxNumber = maxNumber
  saveConfig(config)
  return true
})

ipcMain.handle('get-time-last-seconds', () => {
  const config = loadConfig()
  return config.Time.LastSeconds
})

ipcMain.handle('set-time-last-seconds', (event, seconds) => {
  const config = loadConfig()
  config.Time.LastSeconds = seconds
  saveConfig(config)
  return true
})