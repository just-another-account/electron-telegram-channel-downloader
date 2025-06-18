const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')

// 设置开发环境
const isDev = process.env.ELECTRON_IS_DEV === '1' || !app.isPackaged

// 更好的路径处理
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = isDev
  ? path.join(process.env.DIST, '../public')
  : process.env.DIST

let win = null

const VITE_DEV_SERVER_URL = isDev ? 'http://localhost:5173' : null

// 设置单实例应用
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时，将会聚焦到myWindow这个窗口
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

function createWindow() {

  win = new BrowserWindow({
    width: 1600,
    height: 1200,
    minWidth: 800,
    minHeight: 600,
    center: true,
    icon: getAppIcon(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // 允许跨域请求，这对 Telegram API 很重要
      allowRunningInsecureContent: true,
      experimentalFeatures: false
    },
    titleBarStyle: 'default',
    show: false,
    autoHideMenuBar: true, // 隐藏菜单栏
  })

  // 窗口准备好后显示
  win.once('ready-to-show', () => {
    win.show()
    win.focus()
    
    if (isDev) {
      console.log('🔥 开发模式启动完成')
      // win.webContents.openDevTools()
    } else {
      console.log('📦 生产模式启动完成')
    }
  })

  // 处理页面加载失败
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('页面加载失败:', errorCode, errorDescription, validatedURL)
    
    if (!isDev) {
      // 在生产模式下，如果加载失败，尝试重新加载
      setTimeout(() => {
        const fallbackPath = path.join(process.env.DIST, 'index.html')
        console.log('尝试加载备用路径:', fallbackPath)
        win.loadFile(fallbackPath)
      }, 1000)
    }
  })

  // 加载应用
  if (VITE_DEV_SERVER_URL) {
    console.log('🔥 开发模式: 加载开发服务器', VITE_DEV_SERVER_URL)
    win.loadURL(VITE_DEV_SERVER_URL).catch(err => {
      console.error('开发服务器加载失败:', err)
    })
  } else {
    const indexPath = path.join(process.env.DIST, 'index.html')
    console.log('📦 生产模式: 加载构建文件', indexPath)
    
    // 检查文件是否存在
    if (fs.existsSync(indexPath)) {
      win.loadFile(indexPath).catch(err => {
        console.error('构建文件加载失败:', err)
      })
    } else {
      console.error('构建文件不存在:', indexPath)
      // 显示错误页面
      win.loadURL(`data:text/html,<h1>应用启动失败</h1><p>找不到应用文件: ${indexPath}</p>`)
    }
  }

  // 处理外部链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // 阻止新窗口
  win.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    if (navigationUrl.startsWith('http://') || navigationUrl.startsWith('https://')) {
      shell.openExternal(navigationUrl)
    }
  })

  // 窗口关闭事件
  win.on('closed', () => {
    win = null
  })

  // 防止应用退出时出现错误
  win.on('unresponsive', () => {
    console.warn('窗口无响应')
  })

  win.webContents.on('crashed', () => {
    console.error('渲染进程崩溃')
  })
}

// 获取应用图标
function getAppIcon() {
  if (process.platform === 'win32') {
    return path.join(__dirname, '../build/icon.ico')
  } else if (process.platform === 'darwin') {
    return path.join(__dirname, '../build/icon.icns')
  } else {
    return path.join(__dirname, '../build/icon.png')
  }
}

// 设置应用安全策略（仅在开发环境）
if (isDev) {
  app.commandLine.appendSwitch('disable-web-security')
}

// Windows特定设置
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true')
  app.commandLine.appendSwitch('force-device-scale-factor', '1')
  // 防止Windows Defender阻止
  app.commandLine.appendSwitch('no-sandbox')
}

// 应用准备就绪
app.whenReady().then(async () => {
  console.log('Electron应用已准备就绪')
  console.log('应用路径:', app.getAppPath())
  console.log('用户数据路径:', app.getPath('userData'))
  console.log('是否开发模式:', isDev)
  console.log('DIST路径:', process.env.DIST)
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用即将退出
app.on('before-quit', () => {
  console.log('应用即将退出')
})

// IPC 处理器 - 获取系统路径
ipcMain.handle('get-downloads-path', async () => {
  try {
    const downloadsPath = app.getPath('downloads')
    console.log('获取下载路径:', downloadsPath)
    return downloadsPath
  } catch (error) {
    console.error('Get downloads path error:', error)
    throw error
  }
})

// IPC 处理器 - 获取系统路径
ipcMain.handle('get-path', async (event, name) => {
  try {
    const pathResult = app.getPath(name)
    console.log(`获取系统路径 ${name}:`, pathResult)
    return pathResult
  } catch (error) {
    console.error(`Get path ${name} error:`, error)
    throw error
  }
})

// IPC 处理器 - 文件对话框
ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(win, {
      title: '保存文件',
      defaultPath: app.getPath('downloads'),
      ...options
    })
    return result
  } catch (error) {
    console.error('Save dialog error:', error)
    throw error
  }
})

// IPC 处理器 - 打开文件夹对话框
ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(win, {
      title: '选择文件夹',
      defaultPath: app.getPath('downloads'),
      properties: ['openDirectory'],
      ...options
    })
    return result
  } catch (error) {
    console.error('Open dialog error:', error)
    throw error
  }
})

// IPC 处理器 - 写入文件
ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    // 确保目录存在
    const dir = path.dirname(filePath)
    await fs.promises.mkdir(dir, { recursive: true })
    
    await fs.promises.writeFile(filePath, data, 'utf8')
    console.log('文件写入成功:', filePath)
    return { success: true }
  } catch (error) {
    console.error('Write file error:', error)
    throw error
  }
})

// IPC 处理器 - 读取文件
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8')
    console.log('文件读取成功:', filePath)
    return data
  } catch (error) {
    console.error('Read file error:', error)
    throw error
  }
})

// IPC 处理器 - 检查文件是否存在
ipcMain.handle('exists', async (event, filePath) => {
  try {
    await fs.promises.access(filePath)
    return true
  } catch (error) {
    return false
  }
})

// IPC 处理器 - 创建目录
ipcMain.handle('create-dir', async (event, dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
    console.log('目录创建成功:', dirPath)
    return { success: true }
  } catch (error) {
    console.error('Create directory error:', error)
    throw error
  }
})

// IPC 处理器 - 打开外部链接
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url)
    console.log('外部链接打开成功:', url)
    return { success: true }
  } catch (error) {
    console.error('Open external error:', error)
    throw error
  }
})

// IPC 处理器 - 显示文件夹
ipcMain.handle('show-item-in-folder', async (event, fullPath) => {
  try {
    shell.showItemInFolder(fullPath)
    console.log('在文件夹中显示:', fullPath)
    return { success: true }
  } catch (error) {
    console.error('Show in folder error:', error)
    throw error
  }
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // 不要退出应用，只记录错误
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // 不要退出应用，只记录错误
}) 