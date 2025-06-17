// Electron API 适配层 - 替代 Tauri API

/**
 * 检查是否在 Electron 环境中运行
 */
export function isElectron() {
  return typeof window !== 'undefined' && window.electronAPI
}

/**
 * 文件对话框 API
 */
export const dialog = {
  async save(options = {}) {
    if (!isElectron()) {
      throw new Error('Dialog API 只在 Electron 环境下可用')
    }
    
    const defaultOptions = {
      title: '保存文件',
      defaultPath: '',
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    }
    
    return await window.electronAPI.showSaveDialog({ ...defaultOptions, ...options })
  },

  async open(options = {}) {
    if (!isElectron()) {
      throw new Error('Dialog API 只在 Electron 环境下可用')
    }
    
    const defaultOptions = {
      title: '选择文件',
      defaultPath: '',
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    }
    
    return await window.electronAPI.showOpenDialog({ ...defaultOptions, ...options })
  }
}

/**
 * 文件系统 API
 */
export const fs = {
  async writeTextFile(filePath, data) {
    if (!isElectron()) {
      // 在浏览器环境中，使用下载
      const blob = new Blob([data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filePath.split('/').pop() || 'download.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }
    
    return await window.electronAPI.writeFile(filePath, data)
  },

  async writeBinaryFile(filePath, data) {
    if (!isElectron()) {
      // 在浏览器环境中，使用下载
      let blob
      if (data instanceof ArrayBuffer) {
        blob = new Blob([data])
      } else if (data instanceof Uint8Array) {
        blob = new Blob([data.buffer])
      } else {
        blob = new Blob([data])
      }
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filePath.split('/').pop() || 'download.bin'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return
    }
    
    return await window.electronAPI.writeFile(filePath, data)
  },

  async readTextFile(filePath) {
    if (!isElectron()) {
      throw new Error('文件读取只在 Electron 环境下可用')
    }
    
    const data = await window.electronAPI.readFile(filePath)
    return new TextDecoder().decode(data)
  },

  async readBinaryFile(filePath) {
    if (!isElectron()) {
      throw new Error('文件读取只在 Electron 环境下可用')
    }
    
    return await window.electronAPI.readFile(filePath)
  },

  async exists(filePath) {
    if (!isElectron()) {
      return false
    }
    
    return await window.electronAPI.exists(filePath)
  },

  async createDir(dirPath) {
    if (!isElectron()) {
      console.warn('目录创建只在 Electron 环境下可用')
      return
    }
    
    return await window.electronAPI.createDir(dirPath)
  }
}

/**
 * Shell API
 */
export const shell = {
  async open(url) {
    if (!isElectron()) {
      // 在浏览器环境中，直接打开链接
      window.open(url, '_blank')
      return
    }
    
    return await window.electronAPI.openExternal(url)
  },

  async showItemInFolder(fullPath) {
    if (!isElectron()) {
      console.warn('显示文件夹功能只在 Electron 环境下可用')
      return
    }
    
    return await window.electronAPI.showItemInFolder(fullPath)
  }
}

/**
 * 应用信息 API
 */
export const app = {
  getName() {
    return 'Telegram Channel Downloader'
  },

  getVersion() {
    return '0.1.0'
  }
}

/**
 * 路径工具
 */
export const path = {
  join(...paths) {
    return paths.join('/')
  },

  dirname(filePath) {
    return filePath.substring(0, filePath.lastIndexOf('/'))
  },

  basename(filePath) {
    return filePath.substring(filePath.lastIndexOf('/') + 1)
  },

  extname(filePath) {
    const name = this.basename(filePath)
    const lastDot = name.lastIndexOf('.')
    return lastDot === -1 ? '' : name.substring(lastDot)
  }
}

/**
 * 环境检测
 */
export const env = {
  isElectron: isElectron(),
  isTauri: false, // 明确标识不是 Tauri
  platform: isElectron() ? window.electronAPI.platform : 'web'
}

/**
 * 系统路径 API
 */
export const systemPath = {
  async getDownloadsPath() {
    if (!isElectron()) {
      // 在浏览器环境中返回默认路径
      return '/Downloads'
    }
    
    return await window.electronAPI.getDownloadsPath()
  },

  async getPath(name) {
    if (!isElectron()) {
      // 在浏览器环境中返回默认路径
      const defaultPaths = {
        home: '/Users',
        documents: '/Documents',
        downloads: '/Downloads',
        pictures: '/Pictures',
        videos: '/Videos',
        music: '/Music',
        desktop: '/Desktop'
      }
      return defaultPaths[name] || '/'
    }
    
    return await window.electronAPI.getPath(name)
  }
}

// 默认导出所有 API
export default {
  dialog,
  fs,
  shell,
  app,
  path,
  env,
  systemPath,
  isElectron
} 