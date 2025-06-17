const { contextBridge, ipcRenderer } = require('electron')

// 暴露 Electron API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件系统操作
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  exists: (filePath) => ipcRenderer.invoke('exists', filePath),
  createDir: (dirPath) => ipcRenderer.invoke('create-dir', dirPath),

  // 对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 系统操作
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showItemInFolder: (fullPath) => ipcRenderer.invoke('show-item-in-folder', fullPath),

  // 系统路径
  getDownloadsPath: () => ipcRenderer.invoke('get-downloads-path'),
  getPath: (name) => ipcRenderer.invoke('get-path', name),

  // 环境检测
  isElectron: true,
  platform: process.platform,
  version: process.versions,
})

// 为了兼容性，也暴露一个全局标识
contextBridge.exposeInMainWorld('__ELECTRON__', true)

console.log('🔌 Electron preload script loaded') 