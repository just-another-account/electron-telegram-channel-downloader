import telegramService from './telegramService.js'
import { fs } from '../utils/electronAPI.js'

class DownloadService {
  constructor() {
    this.isDownloading = false
    this.currentDownloadConfig = null
    this.downloadedCount = 0
    this.errorCount = 0
    this.skippedCount = 0
    this.messagesPerFile = 500 // 每个文件500条消息
  }

  /**
   * 下载频道内容
   */
  async downloadChannelContent(config) {
    const { dialog, downloadTypes, startMessageId, endMessageId, downloadPath, onProgress } = config
    
    this.isDownloading = true
    this.currentDownloadConfig = config
    this.downloadedCount = 0
    this.errorCount = 0
    this.skippedCount = 0

    // 移到外面，确保finally块能访问
    let allMessageData = []
    let recordSaved = false

    try {
      // 创建基础目录
      const channelDir = `${downloadPath}/${dialog.id}`
      await this.createDirectoryStructure(channelDir, downloadTypes)
      
      // 获取消息
      onProgress({ status: '正在获取消息列表...' })
      const messages = await telegramService.getMessages(dialog.entity, 1000)
      
      // 过滤消息
      let filteredMessages = messages
      if (startMessageId || endMessageId) {
        filteredMessages = messages.filter(msg => {
          if (startMessageId && msg.id < startMessageId) return false
          if (endMessageId && msg.id > endMessageId) return false
          return true
        })
      }
      
      onProgress({ 
        total: filteredMessages.length,
        status: `找到 ${filteredMessages.length} 条消息，开始处理...` 
      })
      
      // 按消息ID排序，确保连续性
      filteredMessages.sort((a, b) => a.id - b.id)
      
      // 处理消息
      let current = 0
      
      for (const message of filteredMessages) {
        if (!this.isDownloading) {
          break // 用户取消下载
        }
        
        current++
        onProgress({ 
          current,
          currentFile: `消息 ${message.id}`,
          status: `正在处理消息 ${message.id}...`
        })
        
        try {
          // 提取消息数据
          const messageInfo = this.extractMessageData(message)
          allMessageData.push(messageInfo)
          
          // 下载媒体文件
          if (message.media && this.shouldDownloadMedia(message.media, downloadTypes)) {
            await this.downloadMediaFile(message, channelDir, downloadTypes, onProgress)
            this.downloadedCount++
            onProgress({ downloaded: this.downloadedCount })
          } else if (message.media) {
            this.skippedCount++
            onProgress({ skipped: this.skippedCount })
          }
          
        } catch (error) {
          console.error(`❌ 处理消息 ${message.id} 失败:`, error)
          this.errorCount++
          onProgress({ errors: this.errorCount })
        }
        
        // 添加小延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 分文件保存消息数据
      await this.saveMessagesJsonByChunks(allMessageData, `${channelDir}/json`)
      
      // 更新下载记录
      await this.updateDownloadRecord(dialog.id, allMessageData)
      recordSaved = true
      
      onProgress({ 
        status: '下载完成！',
        current: filteredMessages.length 
      })
      
      return {
        success: true,
        totalMessages: filteredMessages.length,
        downloaded: this.downloadedCount,
        skipped: this.skippedCount,
        errors: this.errorCount,
        messageRange: allMessageData.length > 0 ? {
          min: Math.min(...allMessageData.map(m => m.id)),
          max: Math.max(...allMessageData.map(m => m.id))
        } : null
      }
      
    } catch (error) {
      console.error('❌ 下载过程中出错:', error)
      throw error
    } finally {
      this.isDownloading = false
      
      // 如果有已处理的消息数据，且尚未记录，则记录（适用于取消或错误情况）
      if (allMessageData && allMessageData.length > 0 && !recordSaved) {
        try {
          // 完全避免this上下文，直接使用localStorage操作
          const channelId = dialog.id
          const key = `download_record_${channelId}`
          
          // 获取现有记录
          let existingRecord
          try {
            const rawRecord = localStorage.getItem(key)
            existingRecord = rawRecord ? JSON.parse(rawRecord) : null
          } catch (e) {
            existingRecord = null
          }
          
          if (!existingRecord) {
            existingRecord = {
              channelId: String(dialog.id), // 确保channelId是字符串
              downloadSessions: []
            }
          }

          // 处理消息ID，确保是数字类型
          const validMessageIds = allMessageData
            .map(m => {
              if (typeof m.id === 'bigint') {
                return Number(m.id)
              }
              return typeof m.id === 'number' ? m.id : parseInt(m.id)
            })
            .filter(id => !isNaN(id) && id != null)

          // 创建新会话记录
          const newSession = {
            timestamp: new Date().toISOString(),
            totalMessages: allMessageData.length,
            downloaded: this.downloadedCount || 0,
            skipped: this.skippedCount || 0,
            errors: this.errorCount || 0,
            messageRange: validMessageIds.length > 0 ? {
              min: Math.min(...validMessageIds),
              max: Math.max(...validMessageIds)
            } : null
          }

          existingRecord.downloadSessions.push(newSession)
          
          // 计算总的消息范围
          const allRanges = existingRecord.downloadSessions
            .filter(session => session.messageRange)
            .map(session => session.messageRange)
          
          if (allRanges.length > 0) {
            existingRecord.totalRange = {
              min: Math.min(...allRanges.map(r => r.min)),
              max: Math.max(...allRanges.map(r => r.max))
            }
          }

          // 使用自定义序列化函数处理BigInt
          const jsonData = JSON.stringify(existingRecord, (key, value) => {
            if (typeof value === 'bigint') {
              return Number(value)
            }
            return value
          })

          // 直接保存到localStorage
          localStorage.setItem(key, jsonData)
          console.log('✅ 已记录部分下载的消息数据')
        } catch (recordError) {
          console.error('❌ 记录部分下载数据失败:', recordError)
        }
      }
    }
  }

  /**
   * 取消下载
   */
  cancelDownload() {
    this.isDownloading = false
    console.log('🛑 下载已取消')
  }

  /**
   * 创建目录结构
   */
  async createDirectoryStructure(baseDir, downloadTypes) {
    try {
      // 创建主目录
      await this.createDirectory(baseDir)
      
      // 创建JSON目录
      await this.createDirectory(`${baseDir}/json`)
      
      // 根据下载类型创建子目录
      if (downloadTypes.includes('images')) {
        await this.createDirectory(`${baseDir}/images`)
      }
      if (downloadTypes.includes('videos')) {
        await this.createDirectory(`${baseDir}/videos`)
      }
      if (downloadTypes.includes('documents')) {
        await this.createDirectory(`${baseDir}/documents`)
      }
      if (downloadTypes.includes('others')) {
        await this.createDirectory(`${baseDir}/others`)
      }
      
      console.log('📁 目录结构创建完成:', baseDir)
    } catch (error) {
      console.error('❌ 创建目录结构失败:', error)
      throw error
    }
  }

  /**
   * 创建单个目录
   */
  async createDirectory(dirPath) {
    try {
      await fs.createDir(dirPath)
      console.log('📁 目录创建成功:', dirPath)
    } catch (error) {
      // 目录可能已存在，忽略错误
      console.log('📁 目录已存在或创建失败:', dirPath, error.message)
    }
  }

  /**
   * 提取消息数据
   */
  extractMessageData(message) {
    // 处理BigInt类型的ID
    const messageId = typeof message.id === 'bigint' ? Number(message.id) : message.id
    const fromId = message.fromId?.value || message.fromId
    const peerId = message.peerId?.value || message.peerId
    
    return {
      id: messageId,
      date: message.date ? new Date(message.date * 1000).toISOString() : null,
      text: message.message || message.text || '',
      fromId: typeof fromId === 'bigint' ? Number(fromId) : fromId,
      peerId: typeof peerId === 'bigint' ? Number(peerId) : peerId,
      media: message.media ? {
        type: this.getMediaType(message.media),
        fileName: this.getMediaFileName(message.media, messageId),
        size: this.getMediaSize(message.media)
      } : null,
      replies: message.replies?.replies || 0,
      views: message.views || 0,
      forwards: message.forwards || 0
    }
  }

  /**
   * 判断是否应该下载媒体
   */
  shouldDownloadMedia(media, downloadTypes) {
    const mediaType = this.getMediaType(media)
    const typeMap = {
      'photo': 'images',
      'video': 'videos',
      'document': 'documents',
      'other': 'others'
    }
    return downloadTypes.includes(typeMap[mediaType] || 'others')
  }

  /**
   * 获取媒体类型
   */
  getMediaType(media) {
    if (media.photo || media._ === 'messageMediaPhoto') return 'photo'
    if (media.video || media._ === 'messageMediaDocument' && media.document?.videoSizes) return 'video'
    if (media.document || media._ === 'messageMediaDocument') return 'document'
    return 'other'
  }

  /**
   * 获取媒体文件名
   */
  getMediaFileName(media, messageId) {
    const timestamp = Date.now()
    
    if (media.photo || media._ === 'messageMediaPhoto') {
      return `photo_${messageId}_${timestamp}.jpg`
    }
    
    if (media.document) {
      const doc = media.document
      if (doc.fileName) {
        const ext = doc.fileName.split('.').pop()
        return `${doc.fileName.replace(/\.[^/.]+$/, "")}_${messageId}_${timestamp}.${ext}`
      }
      
      if (doc.mimeType) {
        const ext = doc.mimeType.split('/').pop()
        return `document_${messageId}_${timestamp}.${ext}`
      }
      
      return `document_${messageId}_${timestamp}`
    }
    
    if (media.video) {
      return `video_${messageId}_${timestamp}.mp4`
    }
    
    return `file_${messageId}_${timestamp}`
  }

  /**
   * 获取媒体文件大小
   */
  getMediaSize(media) {
    if (media.document?.size) return media.document.size
    if (media.photo?.sizes) {
      const largest = media.photo.sizes[media.photo.sizes.length - 1]
      return largest.size || 0
    }
    return 0
  }

  /**
   * 下载媒体文件
   */
  async downloadMediaFile(message, channelDir, downloadTypes, onProgress = null) {
    try {
      // 检查是否被取消
      if (!this.isDownloading) {
        console.log('🛑 下载已取消，跳过文件下载')
        return
      }

      const media = message.media
      if (!media) return

      const mediaType = this.getMediaType(media)
      const fileName = this.getMediaFileName(media, message.id)
      
      // 确定保存目录
      let subDir = 'others'
      if (mediaType === 'photo') subDir = 'images'
      else if (mediaType === 'video') subDir = 'videos'  
      else if (mediaType === 'document') subDir = 'documents'
      
      const filePath = `${channelDir}/${subDir}/${fileName}`
      
      // 检查文件是否已存在
      const exists = await fs.exists(filePath)
      if (exists) {
        console.log('📄 文件已存在，跳过:', fileName)
        return
      }
      
      // 报告开始下载文件
      if (onProgress) {
        onProgress({
          currentFile: fileName,
          fileProgress: 0,
          status: `正在下载文件: ${fileName}`
        })
      }
      
      // 使用 Telegram 客户端下载文件
      console.log('⬇️ 开始下载:', fileName)
      const buffer = await telegramService.client.downloadMedia(message, {
        progressCallback: (downloaded, total) => {
          // 再次检查是否被取消
          if (!this.isDownloading) {
            console.log('🛑 下载已取消，停止文件下载')
            throw new Error('下载已取消')
          }
          
          const percent = total > 0 ? (downloaded / total * 100) : 0
          console.log(`📥 下载进度 ${fileName}: ${percent.toFixed(1)}%`)
          
          // 报告文件下载进度
          if (onProgress) {
            onProgress({
              currentFile: fileName,
              fileProgress: percent,
              status: `正在下载文件: ${fileName} (${percent.toFixed(1)}%)`
            })
          }
        }
      })
      
      // 最后检查是否被取消
      if (!this.isDownloading) {
        console.log('🛑 下载已取消，跳过文件保存')
        return
      }
      
      // 保存文件
      if (buffer) {
        await fs.writeBinaryFile(filePath, buffer)
        console.log('✅ 文件下载完成:', fileName)
        
        if (onProgress) {
          onProgress({
            currentFile: fileName,
            fileProgress: 100,
            status: `文件下载完成: ${fileName}`
          })
        }
      } else {
        console.warn('⚠️ 下载的文件数据为空:', fileName)
      }
      
    } catch (error) {
      if (error.message === '下载已取消') {
        console.log('🛑 文件下载被取消:', error)
        return
      }
      console.error('❌ 下载媒体文件失败:', error)
      throw error
    }
  }

  /**
   * 保存消息数据为 JSON 文件
   */
  async saveMessagesJson(messageData, filePath) {
    try {
      const jsonData = JSON.stringify(messageData, null, 2)
      await fs.writeTextFile(filePath, jsonData)
      console.log('💾 消息数据已保存:', filePath)
    } catch (error) {
      console.error('❌ 保存消息数据失败:', error)
      throw error
    }
  }

  /**
   * 获取频道下载记录
   */
  getChannelDownloadRecord(channelId) {
    try {
      const key = `download_record_${channelId}`
      const record = localStorage.getItem(key)
      
      if (!record) {
        return null
      }
      
      const parsed = JSON.parse(record)
      
      // 简化验证 - 只要是对象且有downloadSessions数组就接受
      if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.downloadSessions)) {
        return parsed
      } else {
        console.warn('⚠️ 下载记录结构无效')
        return null
      }
    } catch (error) {
      console.error('❌ 获取下载记录失败:', error)
      return null
    }
  }

  /**
   * 保存频道下载记录到 localStorage
   */
  saveChannelDownloadRecord(channelId, record) {
    try {
      const key = `download_record_${channelId}`
      const jsonData = JSON.stringify(record)
      localStorage.setItem(key, jsonData)
      console.log('✅ 下载记录已保存')
    } catch (error) {
      console.error('❌ 保存下载记录失败:', error)
    }
  }

  /**
   * 更新下载记录 (修正版本)
   */
  async updateDownloadRecord(channelId, messageData) {
    try {
      // 直接使用localStorage操作，避免this上下文问题
      const key = `download_record_${channelId}`
      
      // 获取现有记录
      let existingRecord
      try {
        const rawRecord = localStorage.getItem(key)
        existingRecord = rawRecord ? JSON.parse(rawRecord) : null
      } catch (e) {
        existingRecord = null
      }
      
      if (!existingRecord) {
        existingRecord = {
          channelId: String(channelId), // 确保channelId是字符串
          downloadSessions: []
        }
      }

      // 处理消息ID，确保是数字类型
      const validMessageIds = messageData
        .map(m => {
          if (typeof m.id === 'bigint') {
            return Number(m.id)
          }
          return typeof m.id === 'number' ? m.id : parseInt(m.id)
        })
        .filter(id => !isNaN(id) && id != null)

      const newSession = {
        timestamp: new Date().toISOString(),
        totalMessages: messageData.length,
        downloaded: this.downloadedCount || 0,
        skipped: this.skippedCount || 0,
        errors: this.errorCount || 0,
        messageRange: validMessageIds.length > 0 ? {
          min: Math.min(...validMessageIds),
          max: Math.max(...validMessageIds)
        } : null
      }

      existingRecord.downloadSessions.push(newSession)
      
      // 计算总的消息范围
      const allRanges = existingRecord.downloadSessions
        .filter(session => session.messageRange)
        .map(session => session.messageRange)
      
      if (allRanges.length > 0) {
        existingRecord.totalRange = {
          min: Math.min(...allRanges.map(r => r.min)),
          max: Math.max(...allRanges.map(r => r.max))
        }
      }

      // 使用自定义序列化函数处理BigInt
      const jsonData = JSON.stringify(existingRecord, (key, value) => {
        if (typeof value === 'bigint') {
          return Number(value)
        }
        return value
      })
      
      // 直接保存到localStorage
      localStorage.setItem(key, jsonData)
      console.log('✅ 下载记录已更新')
    } catch (error) {
      console.error('❌ 更新下载记录失败:', error)
    }
  }

  /**
   * 分文件保存消息数据
   */
  async saveMessagesJsonByChunks(messageData, baseDir) {
    try {
      const chunkSize = this.messagesPerFile
      const totalChunks = Math.ceil(messageData.length / chunkSize)
      
      for (let i = 0; i < totalChunks; i++) {
        const chunk = messageData.slice(i * chunkSize, (i + 1) * chunkSize)
        
        if (chunk.length === 0) continue
        
        // 使用消息ID范围命名文件
        const messageIds = chunk.map(msg => msg.id).filter(id => id != null && !isNaN(id))
        if (messageIds.length === 0) {
          console.warn('⚠️ 跳过无效消息块 (没有有效的消息ID)')
          continue
        }
        
        const minId = Math.min(...messageIds)
        const maxId = Math.max(...messageIds)
        const fileName = `messages_${minId}-${maxId}.json`
        const filePath = `${baseDir}/${fileName}`
        
        await this.saveMessagesJson(chunk, filePath)
        console.log(`💾 已保存消息文件: ${fileName} (${chunk.length} 条消息)`)
      }
      
      console.log('💾 消息数据已分文件保存:', baseDir)
    } catch (error) {
      console.error('❌ 分文件保存消息数据失败:', error)
      throw error
    }
  }

  
}

// 创建单例实例
const downloadService = new DownloadService()

export default downloadService
