const { app, BrowserWindow, ipcMain, shell } = require('electron')
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
const settingsPath = path.join(configDir, 'setting.ini')
const goodRandomPath = path.join(configDir, 'goodrandom.json')

const defaultConfig = {
  Random: {
    MaxNumber: 75
  },
  Time: {
    LastSeconds: 300
  }
}

const defaultSettings = {
  Timer: {
    FillMode: 'last',
    CustomSeconds: 300
  },
  Random: {
    SkipAnimation: false,
    SmartMatch: true
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
    if (!config.Random) {
      config.Random = defaultConfig.Random
    } else {
      config.Random.MaxNumber = parseInt(config.Random.MaxNumber) || defaultConfig.Random.MaxNumber
    }
    if (!config.Time) {
      config.Time = defaultConfig.Time
    } else {
      config.Time.LastSeconds = parseInt(config.Time.LastSeconds) || defaultConfig.Time.LastSeconds
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

function loadSettings() {
  ensureConfigDir()
  if (!fs.existsSync(settingsPath)) {
    saveSettings(defaultSettings)
    return defaultSettings
  }
  try {
    const content = fs.readFileSync(settingsPath, 'utf-8')
    const settings = ini.parse(content)
    if (!settings.Timer) {
      settings.Timer = defaultSettings.Timer
    } else {
      settings.Timer.FillMode = settings.Timer.FillMode || 'last'
      settings.Timer.CustomSeconds = parseInt(settings.Timer.CustomSeconds) || defaultSettings.Timer.CustomSeconds
    }
    if (!settings.Random) {
      settings.Random = defaultSettings.Random
    } else {
      settings.Random.SkipAnimation = settings.Random.SkipAnimation === 'true' || settings.Random.SkipAnimation === true
      settings.Random.SmartMatch = settings.Random.SmartMatch === 'true' || settings.Random.SmartMatch === true || settings.Random.SmartMatch === undefined
    }
    return settings
  } catch (e) {
    saveSettings(defaultSettings)
    return defaultSettings
  }
}

function saveSettings(settings) {
  ensureConfigDir()
  fs.writeFileSync(settingsPath, ini.stringify(settings), 'utf-8')
}

function generateWeights(maxNumber) {
  const weights = {}
  const base = maxNumber
  for (let i = 1; i <= maxNumber; i++) {
    weights[i] = parseFloat(base.toFixed(3))
  }
  return weights
}

function loadGoodRandom() {
  ensureConfigDir()
  if (!fs.existsSync(goodRandomPath)) {
    const config = loadConfig()
    const maxNumber = config.Random.MaxNumber
    const data = {
      maxNumber: maxNumber,
      weights: generateWeights(maxNumber)
    }
    saveGoodRandom(data)
    return data
  }
  try {
    const content = fs.readFileSync(goodRandomPath, 'utf-8')
    const data = JSON.parse(content)
    const config = loadConfig()
    const currentMax = config.Random.MaxNumber
    if (data.maxNumber !== currentMax) {
      data.maxNumber = currentMax
      data.weights = generateWeights(currentMax)
      saveGoodRandom(data)
    }
    return data
  } catch (e) {
    const config = loadConfig()
    const maxNumber = config.Random.MaxNumber
    const data = {
      maxNumber: maxNumber,
      weights: generateWeights(maxNumber)
    }
    saveGoodRandom(data)
    return data
  }
}

function saveGoodRandom(data) {
  ensureConfigDir()
  fs.writeFileSync(goodRandomPath, JSON.stringify(data, null, 2), 'utf-8')
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
    message: '课堂小助手 v1.0.1',
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

ipcMain.handle('get-time-fill-mode', () => {
  const settings = loadSettings()
  return settings.Timer.FillMode
})

ipcMain.handle('set-time-fill-mode', (event, mode) => {
  const settings = loadSettings()
  settings.Timer.FillMode = mode
  saveSettings(settings)
  return true
})

ipcMain.handle('get-time-custom-seconds', () => {
  const settings = loadSettings()
  return settings.Timer.CustomSeconds
})

ipcMain.handle('set-time-custom-seconds', (event, seconds) => {
  const settings = loadSettings()
  settings.Timer.CustomSeconds = seconds
  saveSettings(settings)
  return true
})

ipcMain.handle('get-random-skip-animation', () => {
  const settings = loadSettings()
  return settings.Random.SkipAnimation
})

ipcMain.handle('set-random-skip-animation', (event, skip) => {
  const settings = loadSettings()
  settings.Random.SkipAnimation = skip
  saveSettings(settings)
  return true
})

ipcMain.handle('get-smart-match', () => {
  const settings = loadSettings()
  return settings.Random.SmartMatch
})

ipcMain.handle('set-smart-match', (event, enabled) => {
  const settings = loadSettings()
  settings.Random.SmartMatch = enabled
  saveSettings(settings)
  return true
})

ipcMain.handle('pick-weighted-random', () => {
  const data = loadGoodRandom()
  const maxNumber = data.maxNumber
  const fixedWeight = parseFloat((maxNumber * 0.3).toFixed(3))
  const effectiveWeights = {}
  let totalWeight = 0
  for (let i = 1; i <= maxNumber; i++) {
    effectiveWeights[i] = Math.round(data.weights[i]) ** 2 + fixedWeight
    totalWeight += effectiveWeights[i]
  }
  let rand = Math.random() * totalWeight
  let picked = 1
  for (let i = 1; i <= maxNumber; i++) {
    rand -= effectiveWeights[i]
    if (rand <= 0) {
      picked = i
      break
    }
  }
  for (let i = 1; i <= maxNumber; i++) {
    if (i === picked) {
      data.weights[i] = 0.5
    } else {
      data.weights[i] = parseFloat(Math.min(data.weights[i] + 1, maxNumber).toFixed(3))
    }
  }
  saveGoodRandom(data)
  return picked
})

ipcMain.handle('reset-smart-match-weights', () => {
  const config = loadConfig()
  const maxNumber = config.Random.MaxNumber
  const data = {
    maxNumber: maxNumber,
    weights: generateWeights(maxNumber)
  }
  saveGoodRandom(data)
  return true
})

ipcMain.handle('open-external-url', (event, url) => {
  shell.openExternal(url)
  return true
})