import telegramService from './telegramService.js'
import { fs } from '../utils/electronAPI.js'

class MultiThreadDownloadManager {
  constructor() {
    this.maxConcurrentDownloads = 5  // 最大并发下载数
    this.maxChunksPerFile = 4        // 每个文件最大分块数
    this.chunkSize = 1024 * 1024     // 每块大小 1MB
    this.activeDownloads = new Map() // 正在下载的文件
    this.downloadQueue = []          // 下载队列
    this.isProcessing = false        // 是否正在处理队列
    this.downloadStats = {
      total: 0,
      completed: 0,
      failed: 0,
      speed: 0
    }
    this.progressCallbacks = new Set() // 进度回调函数集合
  }

  /**
   * 添加进度回调
   */
  addProgressCallback(callback) {
    this.progressCallbacks.add(callback)
  }

  /**
   * 移除进度回调
   */
  removeProgressCallback(callback) {
    this.progressCallbacks.delete(callback)
  }

  /**
   * 触发进度更新
   */
  emitProgress(data) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('进度回调执行失败:', error)
      }
    })
  }

  /**
   * 添加下载任务到队列
   */
  async addDownloadTask(message, channelDir, downloadTypes, groupIndex = null) {
    const task = {
      id: `${message.id}_${groupIndex || 0}`,
      message,
      channelDir,
      downloadTypes,
      groupIndex,
      status: 'queued',
      progress: {
        downloaded: 0,
        total: 0,
        speed: 0,
        chunks: []
      },
      startTime: null,
      chunks: [], // 分块信息
      retryCount: 0,
      maxRetries: 3
    }

    this.downloadQueue.push(task)
    this.downloadStats.total++
    
    console.log(`📝 添加下载任务: ${task.id}`)
    
    // 开始处理队列
    if (!this.isProcessing) {
      this.processQueue()
    }
    
    return task
  }

  /**
   * 处理下载队列
   */
  async processQueue() {
    if (this.isProcessing) return
    
    this.isProcessing = true
    console.log('🚀 开始处理下载队列')
    
    while (this.downloadQueue.length > 0 || this.activeDownloads.size > 0) {
      // 检查是否可以启动新的下载
      while (this.activeDownloads.size < this.maxConcurrentDownloads && this.downloadQueue.length > 0) {
        const task = this.downloadQueue.shift()
        this.startDownload(task)
      }
      
      // 等待一段时间后再检查
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 更新总体进度
      this.updateOverallProgress()
    }
    
    this.isProcessing = false
    console.log('✅ 下载队列处理完成')
  }

  /**
   * 开始单个文件下载
   */
  async startDownload(task) {
    try {
      task.status = 'downloading'
      task.startTime = Date.now()
      this.activeDownloads.set(task.id, task)
      
      console.log(`⬇️ 开始下载: ${task.id}`)
      
      // 获取文件信息
      const media = task.message.media
      if (!media) {
        throw new Error('消息中没有媒体文件')
      }

      const fileName = this.getMediaFileName(media, task.message.id, task.groupIndex)
      const mediaType = this.getMediaType(media)
      const fileSize = this.getMediaSize(media)
      
      // 确定保存目录
      let subDir = 'others'
      if (mediaType === 'photo') subDir = 'images'
      else if (mediaType === 'video') subDir = 'videos'  
      else if (mediaType === 'document') subDir = 'documents'
      
      const filePath = `${task.channelDir}/${subDir}/${fileName}`
      
      // 检查文件是否已存在
      const exists = await fs.exists(filePath)
      if (exists) {
        console.log('📄 文件已存在，跳过:', fileName)
        this.completeDownload(task, {
          success: true,
          filePath: `${subDir}/${fileName}`,
          fileName: fileName,
          alreadyExists: true
        })
        return
      }
      
      // 更新任务信息
      task.fileName = fileName
      task.filePath = filePath
      task.fileSize = fileSize
      task.progress.total = fileSize
      
      // 决定是否使用分块下载
      const shouldChunk = fileSize > this.chunkSize * 2 && this.supportsRangeRequests(media)
      
      if (shouldChunk) {
        await this.downloadWithChunks(task)
      } else {
        await this.downloadSingleChunk(task)
      }
      
    } catch (error) {
      console.error(`❌ 下载失败: ${task.id}`, error)
      this.failDownload(task, error)
    }
  }

  /**
   * 分块下载
   */
  async downloadWithChunks(task) {
    try {
      const chunkCount = Math.min(
        Math.ceil(task.fileSize / this.chunkSize),
        this.maxChunksPerFile
      )
      
      const actualChunkSize = Math.ceil(task.fileSize / chunkCount)
      
      console.log(`📦 使用分块下载: ${task.fileName}, 块数: ${chunkCount}, 每块大小: ${(actualChunkSize / 1024 / 1024).toFixed(2)}MB`)
      
      // 创建分块任务
      const chunks = []
      for (let i = 0; i < chunkCount; i++) {
        const start = i * actualChunkSize
        const end = Math.min(start + actualChunkSize - 1, task.fileSize - 1)
        
        chunks.push({
          index: i,
          start,
          end,
          size: end - start + 1,
          downloaded: 0,
          data: null,
          status: 'pending' // pending, downloading, completed, failed
        })
      }
      
      task.chunks = chunks
      
      // 并行下载所有分块
      const downloadPromises = chunks.map(chunk => this.downloadChunk(task, chunk))
      
      // 等待所有分块完成
      await Promise.all(downloadPromises)
      
      // 合并分块
      await this.mergeChunks(task)
      
      this.completeDownload(task, {
        success: true,
        filePath: task.filePath.replace(task.channelDir + '/', ''),
        fileName: task.fileName,
        fileSize: task.fileSize,
        alreadyExists: false,
        chunks: chunks.length
      })
      
    } catch (error) {
      console.error(`❌ 分块下载失败: ${task.fileName}`, error)
      throw error
    }
  }

  /**
   * 下载单个分块
   */
  async downloadChunk(task, chunk) {
    try {
      chunk.status = 'downloading'
      
      console.log(`📥 下载分块 ${chunk.index + 1}/${task.chunks.length}: ${task.fileName}`)
      
      // 使用 Telegram API 下载指定范围的数据
      // 注意：Telegram API 可能不直接支持 Range 请求，这里模拟分块下载
      const buffer = await telegramService.client.downloadMedia(task.message, {
        progressCallback: (downloaded, total) => {
          // 计算当前分块的实际下载进度
          const chunkProgress = Math.min(downloaded, chunk.size)
          chunk.downloaded = chunkProgress
          
          // 更新任务总进度
          this.updateTaskProgress(task)
        }
      })
      
      if (!buffer) {
        throw new Error('下载数据为空')
      }
      
      // 由于 Telegram API 限制，我们需要模拟分块
      // 实际上是下载完整文件然后截取对应部分
      const start = chunk.start
      const end = Math.min(chunk.end + 1, buffer.length)
      chunk.data = buffer.slice(start, end)
      chunk.downloaded = chunk.data.length
      chunk.status = 'completed'
      
      console.log(`✅ 分块 ${chunk.index + 1} 下载完成: ${(chunk.data.length / 1024 / 1024).toFixed(2)}MB`)
      
    } catch (error) {
      chunk.status = 'failed'
      console.error(`❌ 分块 ${chunk.index + 1} 下载失败:`, error)
      throw error
    }
  }

  /**
   * 单块下载（非分块）
   */
  async downloadSingleChunk(task) {
    try {
      console.log(`⬇️ 单块下载: ${task.fileName}`)
      
      const buffer = await telegramService.client.downloadMedia(task.message, {
        progressCallback: (downloaded, total) => {
          task.progress.downloaded = downloaded
          task.progress.total = total
          this.updateTaskProgress(task)
        }
      })
      
      if (!buffer) {
        throw new Error('下载数据为空')
      }
      
      // 保存文件
      await fs.writeBinaryFile(task.filePath, buffer)
      
      this.completeDownload(task, {
        success: true,
        filePath: task.filePath.replace(task.channelDir + '/', ''),
        fileName: task.fileName,
        fileSize: buffer.byteLength,
        alreadyExists: false
      })
      
    } catch (error) {
      console.error(`❌ 单块下载失败: ${task.fileName}`, error)
      throw error
    }
  }

  /**
   * 合并分块数据
   */
  async mergeChunks(task) {
    try {
      console.log(`🔧 合并分块: ${task.fileName}`)
      
      // 按索引排序分块
      task.chunks.sort((a, b) => a.index - b.index)
      
      // 计算总大小
      const totalSize = task.chunks.reduce((sum, chunk) => sum + chunk.data.length, 0)
      
      // 创建合并后的缓冲区
      const mergedBuffer = new Uint8Array(totalSize)
      let offset = 0
      
      for (const chunk of task.chunks) {
        if (chunk.status !== 'completed' || !chunk.data) {
          throw new Error(`分块 ${chunk.index + 1} 未完成或数据丢失`)
        }
        
        mergedBuffer.set(new Uint8Array(chunk.data), offset)
        offset += chunk.data.length
      }
      
      // 保存合并后的文件
      await fs.writeBinaryFile(task.filePath, mergedBuffer)
      
      console.log(`✅ 文件合并完成: ${task.fileName}, 大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`)
      
    } catch (error) {
      console.error(`❌ 合并分块失败: ${task.fileName}`, error)
      throw error
    }
  }

  /**
   * 更新任务进度
   */
  updateTaskProgress(task) {
    if (task.chunks && task.chunks.length > 0) {
      // 分块下载进度计算
      const totalDownloaded = task.chunks.reduce((sum, chunk) => sum + chunk.downloaded, 0)
      task.progress.downloaded = totalDownloaded
    }
    
    // 计算下载速度
    if (task.startTime && task.progress.downloaded > 0) {
      const elapsedTime = (Date.now() - task.startTime) / 1000 // 秒
      task.progress.speed = task.progress.downloaded / elapsedTime // 字节/秒
    }
    
    // 触发进度更新
    this.emitProgress({
      type: 'task',
      taskId: task.id,
      fileName: task.fileName,
      progress: task.progress,
      status: task.status
    })
  }

  /**
   * 更新总体进度
   */
  updateOverallProgress() {
    const allTasks = [...this.activeDownloads.values(), ...this.downloadQueue]
    
    const totalDownloaded = Array.from(this.activeDownloads.values())
      .reduce((sum, task) => sum + task.progress.downloaded, 0)
    
    const totalSize = allTasks
      .reduce((sum, task) => sum + (task.progress.total || 0), 0)
    
    const averageSpeed = Array.from(this.activeDownloads.values())
      .reduce((sum, task) => sum + task.progress.speed, 0)
    
    this.downloadStats.speed = averageSpeed
    
    this.emitProgress({
      type: 'overall',
      stats: {
        ...this.downloadStats,
        totalDownloaded,
        totalSize,
        activeDownloads: this.activeDownloads.size,
        queueLength: this.downloadQueue.length
      }
    })
  }

  /**
   * 完成下载
   */
  completeDownload(task, result) {
    task.status = 'completed'
    task.result = result
    this.activeDownloads.delete(task.id)
    this.downloadStats.completed++
    
    console.log(`✅ 下载完成: ${task.fileName}`)
    
    this.emitProgress({
      type: 'completed',
      taskId: task.id,
      fileName: task.fileName,
      result
    })
  }

  /**
   * 下载失败
   */
  failDownload(task, error) {
    task.status = 'failed'
    task.error = error
    
    // 检查是否可以重试
    if (task.retryCount < task.maxRetries) {
      task.retryCount++
      task.status = 'queued'
      this.downloadQueue.unshift(task) // 重新添加到队列前面
      console.log(`🔄 重试下载 (${task.retryCount}/${task.maxRetries}): ${task.fileName}`)
    } else {
      this.activeDownloads.delete(task.id)
      this.downloadStats.failed++
      console.error(`❌ 下载最终失败: ${task.fileName}`, error)
    }
    
    this.emitProgress({
      type: 'failed',
      taskId: task.id,
      fileName: task.fileName,
      error: error.message,
      canRetry: task.retryCount < task.maxRetries
    })
  }

  /**
   * 检查是否支持范围请求
   */
  supportsRangeRequests(media) {
    // Telegram API 通常不支持 HTTP Range 请求
    // 但我们可以通过其他方式模拟分块下载
    return media.document && media.document.size > this.chunkSize * 2
  }

  /**
   * 获取媒体文件名 (从 downloadService 复制)
   */
  getMediaFileName(media, messageId, groupIndex = null) {
    const timestamp = Date.now()
    const groupSuffix = groupIndex ? `_${groupIndex}` : ''
    
    if (media.photo || media._ === 'messageMediaPhoto') {
      return `photo_${messageId}${groupSuffix}_${timestamp}.jpg`
    }
    
    if (media.document) {
      const doc = media.document
      let originalFileName = null
      
      if (doc.attributes && doc.attributes.length > 0) {
        for (const attr of doc.attributes) {
          if (attr.fileName && attr.fileName.trim()) {
            originalFileName = attr.fileName.trim()
            break
          }
        }
      }
      
      if (!originalFileName && doc.fileName && doc.fileName.trim()) {
        originalFileName = doc.fileName.trim()
      }
      
      if (originalFileName) {
        const sanitizedName = this.sanitizeFileName(originalFileName)
        if (groupIndex) {
          const fileExtension = this.getExtensionFromFileName(sanitizedName)
          if (fileExtension) {
            const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'))
            return `${nameWithoutExt}${groupSuffix}.${fileExtension}`
          } else {
            return `${sanitizedName}${groupSuffix}`
          }
        }
        return sanitizedName
      }
      
      const mimeExtension = this.getExtensionFromMimeType(doc.mimeType)
      if (mimeExtension && mimeExtension !== 'bin') {
        return `document_${messageId}${groupSuffix}_${timestamp}.${mimeExtension}`
      }
      
      return `document_${messageId}${groupSuffix}_${timestamp}.bin`
    }
    
    if (media.video) {
      return `video_${messageId}${groupSuffix}_${timestamp}.mp4`
    }
    
    return `file_${messageId}${groupSuffix}_${timestamp}`
  }

  /**
   * 获取媒体类型 (从 downloadService 复制)
   */
  getMediaType(media) {
    if (media.photo || media._ === 'messageMediaPhoto') return 'photo'
    if (media.video || media._ === 'messageMediaDocument' && media.document?.videoSizes) return 'video'
    if (media.document || media._ === 'messageMediaDocument') return 'document'
    return 'other'
  }

  /**
   * 获取媒体大小 (从 downloadService 复制)
   */
  getMediaSize(media) {
    if (media.document?.size) {
      return media.document.size
    }
    
    if (media.photo?.sizes) {
      const largest = media.photo.sizes[media.photo.sizes.length - 1]
      return largest.size || 0
    }
    
    if (media.video?.size) {
      return media.video.size
    }
    
    if (media._ === 'messageMediaDocument' && media.document?.size) {
      return media.document.size
    }
    
    if (media._ === 'messageMediaPhoto' && media.photo?.sizes) {
      const largest = media.photo.sizes[media.photo.sizes.length - 1]
      return largest.size || 0
    }
    
    if (media._ === 'messageMediaVideo' && media.video?.size) {
      return media.video.size
    }
    
    if (media._ === 'messageMediaWebPage' && media.webpage?.document?.size) {
      return media.webpage.document.size
    }
    
    return 0
  }

  /**
   * 清理文件名 (从 downloadService 复制)
   */
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\./, '_')
      .trim()
  }

  /**
   * 从文件名获取扩展名 (从 downloadService 复制)
   */
  getExtensionFromFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return null
    
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return null
    }
    
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase()
    
    if (/^[a-z0-9]{1,10}$/.test(extension)) {
      return extension
    }
    
    return null
  }

  /**
   * 从MIME类型获取扩展名 (从 downloadService 复制，简化版)
   */
  getExtensionFromMimeType(mimeType) {
    if (!mimeType) return null
    
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/avi': 'avi',
      'audio/mpeg': 'mp3',
      'application/pdf': 'pdf',
      'application/zip': 'zip',
      'text/plain': 'txt'
    }
    
    return mimeToExt[mimeType] || 'bin'
  }

  /**
   * 停止所有下载
   */
  stopAllDownloads() {
    console.log('🛑 停止所有下载')
    
    // 清空队列
    this.downloadQueue.length = 0
    
    // 标记所有活动下载为已取消
    for (const task of this.activeDownloads.values()) {
      task.status = 'cancelled'
    }
    
    this.activeDownloads.clear()
    this.isProcessing = false
    
    this.emitProgress({
      type: 'stopped'
    })
  }

  /**
   * 获取下载统计
   */
  getStats() {
    return {
      ...this.downloadStats,
      activeDownloads: this.activeDownloads.size,
      queueLength: this.downloadQueue.length
    }
  }
}

// 创建单例
const multiThreadDownloadManager = new MultiThreadDownloadManager()

export default multiThreadDownloadManager 