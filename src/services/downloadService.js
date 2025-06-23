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
    const { dialog, downloadTypes, startMessageId, endMessageId, downloadPath, filenameFilter, filterMode, minFileSize, maxFileSize, onProgress } = config
    
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
      // 直接向telegramService传递消息ID范围，让其处理范围过滤
      const messages = await telegramService.getMessages(dialog.entity, 1000, startMessageId, endMessageId)
      console.log(messages)
      
      // 消息已经在telegramService中按范围过滤了，这里直接使用
      let filteredMessages = messages
      
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
          // 检查消息是否符合过滤条件
          const shouldInclude = this.shouldDownloadFile(message, filenameFilter, filterMode, minFileSize, maxFileSize)
          
          let messageInfo = null
          if (shouldInclude) {
            // 提取消息数据
            messageInfo = this.extractMessageData(message)
            allMessageData.push(messageInfo)
          }
          
          // 下载媒体文件
          if (message.media && this.shouldDownloadMedia(message.media, downloadTypes)) {
            // 检查文件名过滤
            if (shouldInclude) {
              const downloadResult = await this.downloadMediaFile(message, channelDir, downloadTypes, onProgress)
              
              // 如果下载成功，更新消息数据中的媒体路径信息
              if (downloadResult && downloadResult.filePath && messageInfo) {
                messageInfo.media.downloadPath = downloadResult.filePath
                messageInfo.media.downloadedAt = new Date().toISOString()
                messageInfo.media.fileExists = true
              }
              
              this.downloadedCount++
              onProgress({ downloaded: this.downloadedCount })
            } else {
              this.skippedCount++
              onProgress({ skipped: this.skippedCount })
            }
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
    
    // 提取详细的媒体信息
    let mediaInfo = null
    if (message.media) {
      mediaInfo = this.extractDetailedMediaInfo(message.media, messageId)
    }
    
    return {
      id: messageId,
      date: message.date ? new Date(message.date * 1000).toISOString() : null,
      text: message.message || message.text || '',
      fromId: typeof fromId === 'bigint' ? Number(fromId) : fromId,
      peerId: typeof peerId === 'bigint' ? Number(peerId) : peerId,
      media: mediaInfo,
      replies: message.replies?.replies || 0,
      views: message.views || 0,
      forwards: message.forwards || 0,
      // 添加原始消息的一些额外信息
      editDate: message.editDate ? new Date(message.editDate * 1000).toISOString() : null,
      groupedId: message.groupedId ? (typeof message.groupedId === 'bigint' ? Number(message.groupedId) : message.groupedId) : null,
      replyToMsgId: message.replyTo?.replyToMsgId || null
    }
  }

  /**
   * 提取简化的媒体信息
   */
  extractDetailedMediaInfo(media, messageId) {
    const mediaType = this.getMediaType(media)
    const fileName = this.getMediaFileName(media, messageId)
    const fileSize = this.getMediaSize(media)
    
    // 返回简化的媒体信息
    return {
      fileName: fileName,
      size: fileSize,
      downloadPath: null  // 实际下载后会更新这个路径
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
   * 检查是否应该下载该文件（基于文件名过滤和文件大小过滤）
   */
  shouldDownloadFile(message, filenameFilter, filterMode = 'include', minFileSize = null, maxFileSize = null) {
    // 调试信息
    console.log(`\n🔍 shouldDownloadFile 被调用:`, {
      messageId: message.id,
      hasMedia: !!message.media,
      filenameFilter,
      filterMode, 
      minFileSize,
      maxFileSize
    })
    // 文件名过滤检查
    let filenameMatched = true
    if (filenameFilter && filenameFilter.trim() !== '') {
      const filterKeyword = filenameFilter.toLowerCase().trim()
      let matchFound = false
      
      // 检查消息文本是否包含关键词
      if (message.message && message.message.toLowerCase().includes(filterKeyword)) {
        matchFound = true
      }
      
      // 检查文件名是否包含关键词
      if (!matchFound && message.media) {
        // 获取原始文件名，优先从attributes获取
        let originalFileName = ''
        
        if (message.media.document) {
          const doc = message.media.document
          
          // 优先从attributes数组中获取文件名
          if (doc.attributes && doc.attributes.length > 0) {
            const firstAttr = doc.attributes[0]
            if (firstAttr.fileName && firstAttr.fileName.trim()) {
              originalFileName = firstAttr.fileName.trim()
            }
          }
          
          // 如果attributes中没有，则尝试document的fileName
          if (!originalFileName && doc.fileName && doc.fileName.trim()) {
            originalFileName = doc.fileName.trim()
          }
        } else if (message.media.photo) {
          originalFileName = 'photo'
        } else if (message.media.video) {
          originalFileName = 'video'
        }
        
        if (originalFileName && originalFileName.toLowerCase().includes(filterKeyword)) {
          matchFound = true
        }
      }
      
      // 根据过滤模式确定文件名是否匹配
      if (filterMode === 'exclude') {
        // 排除模式：如果匹配到关键词，则不下载
        filenameMatched = !matchFound
      } else {
        // 包含模式：如果匹配到关键词，则下载
        filenameMatched = matchFound
      }
    }
      // 文件大小过滤检查
    let sizeMatched = true
    if ((minFileSize !== null && minFileSize > 0) || (maxFileSize !== null && maxFileSize > 0)) {
      let fileSize = 0
      
      // 使用getMediaSize函数获取文件大小
      if (message.media) {
        fileSize = this.getMediaSize(message.media)
      }
      
      console.log('📏 文件大小检查:', {
        hasMedia: !!message.media,
        fileSize: fileSize,
        fileSizeKB: (fileSize / 1024).toFixed(2),
        minFileSize,
        maxFileSize,
        mediaType: message.media ? this.getMediaType(message.media) : 'none'
      })
      
      // 转换为KB
      const fileSizeKB = fileSize / 1024
      
      // 检查最小文件大小
      if (minFileSize !== null && minFileSize > 0 && fileSizeKB < minFileSize) {
        sizeMatched = false
        console.log(`❌ 文件太小: ${fileSizeKB.toFixed(2)} KB < ${minFileSize} KB`)
      }
      
      // 检查最大文件大小
      if (maxFileSize !== null && maxFileSize > 0 && fileSizeKB > maxFileSize) {
        sizeMatched = false
        console.log(`❌ 文件太大: ${fileSizeKB.toFixed(2)} KB > ${maxFileSize} KB`)
      }
        if (sizeMatched && fileSize > 0) {
        console.log(`✅ 文件大小匹配: ${fileSizeKB.toFixed(2)} KB`)
      } else if (fileSize === 0) {
        console.log('⚠️ 无法获取文件大小，允许下载该文件')
        sizeMatched = true  // 如果获取不到文件大小，允许下载
      }
    }    
    const result = filenameMatched && sizeMatched
    console.log('🎯 shouldDownloadFile 结果:', {
      filenameMatched,
      sizeMatched,
      finalResult: result
    })
    
    // 两个条件都要满足
    return result
  }

  /**
   * 获取媒体文件名
   */
  getMediaFileName(media, messageId) {
    const timestamp = Date.now()
    
    if (media.photo || media._ === 'messageMediaPhoto') {
      // 图片没有原始文件名，使用自定义命名
      return `photo_${messageId}_${timestamp}.jpg`
    }
    
    if (media.document) {
      const doc = media.document
      
      // 优先从attributes数组中获取文件名
      let originalFileName = null
      if (doc.attributes && doc.attributes.length > 0) {
        // 遍历所有attributes寻找fileName
        for (const attr of doc.attributes) {
          if (attr.fileName && attr.fileName.trim()) {
            originalFileName = attr.fileName.trim()
            break
          }
        }
      }
      
      // 如果attributes中没有，则尝试document的fileName
      if (!originalFileName && doc.fileName && doc.fileName.trim()) {
        originalFileName = doc.fileName.trim()
      }
      
      // 如果有原始文件名，处理它
      if (originalFileName) {
        const sanitizedName = this.sanitizeFileName(originalFileName)
        
        // 检查文件名是否已有有效扩展名
        const fileExtension = this.getExtensionFromFileName(sanitizedName)
        const hasValidExtension = fileExtension !== null
        
        if (hasValidExtension) {
          return sanitizedName
        } else {
          // 文件名没有扩展名或扩展名无效，根据MIME类型添加
          const mimeExtension = this.getExtensionFromMimeType(doc.mimeType)
          
          if (mimeExtension && mimeExtension !== 'bin') {
            return `${sanitizedName}.${mimeExtension}`
          } else {
            // MIME类型也无法确定扩展名，尝试智能推断
            const inferredExt = this.inferExtensionFromContent(sanitizedName, doc.mimeType)
            return inferredExt ? `${sanitizedName}.${inferredExt}` : sanitizedName
          }
        }
      }
      
      // 如果没有原始文件名，使用自定义命名
      const mimeExtension = this.getExtensionFromMimeType(doc.mimeType)
      if (mimeExtension && mimeExtension !== 'bin') {
        return `document_${messageId}_${timestamp}.${mimeExtension}`
      }
      
      return `document_${messageId}_${timestamp}.bin`
    }
    
    if (media.video) {
      // 视频通常没有原始文件名，使用自定义命名
      return `video_${messageId}_${timestamp}.mp4`
    }
    
    return `file_${messageId}_${timestamp}`
  }

  /**
   * 清理文件名，移除不安全字符
   */
  sanitizeFileName(fileName) {
    // 移除或替换不安全的字符
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')  // 替换Windows不支持的字符
      .replace(/\.\./g, '_')          // 替换双点
      .replace(/^\./, '_')            // 替换开头的点
      .trim()
  }

  /**
   * 根据MIME类型获取文件扩展名
   */
  getExtensionFromMimeType(mimeType) {
    if (!mimeType) return null
    
    const mimeToExt = {
      // 图片
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png', 
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/svg+xml': 'svg',
      'image/tiff': 'tiff',
      'image/x-icon': 'ico',
      
      // 视频
      'video/mp4': 'mp4',
      'video/avi': 'avi',
      'video/mkv': 'mkv',
      'video/mov': 'mov',
      'video/wmv': 'wmv',
      'video/webm': 'webm',
      'video/flv': 'flv',
      'video/3gp': '3gp',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      
      // 音频
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/flac': 'flac',
      'audio/aac': 'aac',
      'audio/ogg': 'ogg',
      'audio/wma': 'wma',
      'audio/m4a': 'm4a',
      'audio/opus': 'opus',
      
      // 文档
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/json': 'json',
      'application/xml': 'xml',
      'text/xml': 'xml',
      'text/csv': 'csv',
      'text/rtf': 'rtf',
      
      // Office文档 - Microsoft
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/msword': 'doc',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.ms-powerpoint': 'ppt',
      
      // Office文档 - OpenDocument
      'application/vnd.oasis.opendocument.text': 'odt',
      'application/vnd.oasis.opendocument.spreadsheet': 'ods',
      'application/vnd.oasis.opendocument.presentation': 'odp',
      
      // 压缩文件
      'application/zip': 'zip',
      'application/rar': 'rar',
      'application/x-rar': 'rar',
      'application/x-rar-compressed': 'rar',
      'application/7z': '7z',
      'application/x-7z-compressed': '7z',
      'application/gzip': 'gz',
      'application/x-gzip': 'gz',
      'application/x-tar': 'tar',
      'application/x-bzip2': 'bz2',
      'application/x-xz': 'xz',
      
      // 编程语言文件
      'text/x-python': 'py',
      'text/x-java-source': 'java',
      'text/x-c': 'c',
      'text/x-c++': 'cpp',
      'text/x-csharp': 'cs',
      'text/javascript': 'js',
      'application/javascript': 'js',
      'text/typescript': 'ts',
      'text/x-php': 'php',
      'text/x-ruby': 'rb',
      'text/x-perl': 'pl',
      'text/x-go': 'go',
      'text/x-rust': 'rs',
      'text/x-kotlin': 'kt',
      'text/x-swift': 'swift',
      
      // Web相关
      'text/html': 'html',
      'text/css': 'css',
      'application/xhtml+xml': 'xhtml',
      'application/rss+xml': 'rss',
      
      // 可执行文件
      'application/x-executable': 'exe',
      'application/x-msdos-program': 'exe',
      'application/x-msdownload': 'exe',
      'application/vnd.microsoft.portable-executable': 'exe',
      'application/x-deb': 'deb',
      'application/x-rpm': 'rpm',
      'application/vnd.android.package-archive': 'apk',
      'application/x-apple-diskimage': 'dmg',
      'application/x-ms-dos-executable': 'exe',
      
      // 数据库
      'application/x-sqlite3': 'sqlite',
      'application/vnd.sqlite3': 'sqlite',
      
      // 配置文件
      'application/toml': 'toml',
      'application/x-yaml': 'yaml',
      'text/yaml': 'yaml',
      'application/x-ini': 'ini',
      
      // 字体文件
      'font/ttf': 'ttf',
      'font/otf': 'otf',
      'font/woff': 'woff',
      'font/woff2': 'woff2',
      
      // 其他常见类型
      'application/epub+zip': 'epub',
      'application/x-shockwave-flash': 'swf',
      'application/vnd.adobe.flash.movie': 'swf',
      'application/x-iso9660-image': 'iso',
      'application/octet-stream': 'bin'
    }
    
    // 首先尝试精确匹配
    if (mimeToExt[mimeType]) {
      return mimeToExt[mimeType]
    }
    
    // 如果没有精确匹配，尝试从MIME类型推断
    const parts = mimeType.split('/')
    if (parts.length === 2) {
      const [type, subtype] = parts
      
      // 特殊处理某些模式
      if (subtype.includes('zip')) return 'zip'
      if (subtype.includes('rar')) return 'rar'
      if (subtype.includes('7z')) return '7z'
      if (subtype.includes('gzip')) return 'gz'
      if (subtype.includes('pdf')) return 'pdf'
      if (subtype.includes('json')) return 'json'
      if (subtype.includes('xml')) return 'xml'
      if (subtype.includes('html')) return 'html'
      if (subtype.includes('css')) return 'css'
      if (subtype.includes('javascript')) return 'js'
      
      // 对于text类型，尝试移除x-前缀
      if (type === 'text' && subtype.startsWith('x-')) {
        return subtype.substring(2)
      }
      
      // 最后才使用subtype作为扩展名，但有长度限制
      if (subtype.length <= 5 && /^[a-zA-Z0-9]+$/.test(subtype)) {
        return subtype
      }
    }
    
    // 默认返回bin
    return 'bin'
  }

  /**
   * 从文件名推断扩展名（当MIME类型不可用或不准确时）
   */
  getExtensionFromFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return null
    
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
      return null
    }
    
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase()
    
    // 验证扩展名（只包含字母数字，且长度合理）
    if (/^[a-z0-9]{1,10}$/.test(extension)) {
      return extension
    }
    
    return null
  }

  /**
   * 智能推断文件扩展名（基于文件名模式和MIME类型）
   */
  inferExtensionFromContent(fileName, mimeType) {
    if (!fileName) return null
    
    const lowerFileName = fileName.toLowerCase()
    
    // 基于文件名模式推断
    const namePatterns = {
      // 文档类型
      'readme': 'txt',
      'changelog': 'txt',
      'license': 'txt',
      'makefile': 'txt',
      'dockerfile': 'txt',
      
      // 配置文件
      'config': 'conf',
      'configuration': 'conf',
      'settings': 'conf',
      
      // 数据文件
      'database': 'db',
      'data': 'dat',
      'backup': 'bak',
      'cache': 'cache',
      
      // 脚本文件
      'script': 'sh',
      'install': 'sh',
      'setup': 'sh',
      'run': 'sh'
    }
    
    // 检查完整文件名匹配
    if (namePatterns[lowerFileName]) {
      return namePatterns[lowerFileName]
    }
    
    // 检查文件名包含的关键词
    for (const [pattern, ext] of Object.entries(namePatterns)) {
      if (lowerFileName.includes(pattern)) {
        return ext
      }
    }
    
    // 基于MIME类型的兜底推断
    if (mimeType) {
      if (mimeType.startsWith('text/')) return 'txt'
      if (mimeType.includes('json')) return 'json'
      if (mimeType.includes('xml')) return 'xml'
      if (mimeType.includes('zip')) return 'zip'
      if (mimeType.includes('rar')) return 'rar'
      if (mimeType.includes('tar')) return 'tar'
      if (mimeType.includes('gzip')) return 'gz'
      if (mimeType.includes('executable')) return 'exe'
      if (mimeType.includes('script')) return 'sh'
    }
    
    return null
  }

  /**
   * 获取媒体文件大小
   */
  getMediaSize(media) {
    // 处理文档类型
    if (media.document?.size) {
      return media.document.size
    }
    
    // 处理照片类型
    if (media.photo?.sizes) {
      const largest = media.photo.sizes[media.photo.sizes.length - 1]
      return largest.size || 0
    }
    
    // 处理视频类型
    if (media.video?.size) {
      return media.video.size
    }
    
    // 处理不同的媒体消息类型
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
    
    // 处理网页类型中的文档
    if (media._ === 'messageMediaWebPage' && media.webpage?.document?.size) {
      return media.webpage.document.size
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
        return null
      }

      const media = message.media
      if (!media) return null

      const mediaType = this.getMediaType(media)
      const fileName = this.getMediaFileName(media, message.id)
      
      // 确定保存目录
      let subDir = 'others'
      if (mediaType === 'photo') subDir = 'images'
      else if (mediaType === 'video') subDir = 'videos'  
      else if (mediaType === 'document') subDir = 'documents'
      
      const filePath = `${channelDir}/${subDir}/${fileName}`
      const relativePath = `${subDir}/${fileName}` // 相对路径，用于JSON记录
      
      // 检查文件是否已存在
      const exists = await fs.exists(filePath)
      if (exists) {
        console.log('📄 文件已存在，跳过:', fileName)
        return {
          success: true,
          filePath: relativePath,
          fileName: fileName,
          alreadyExists: true
        }
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
        return null
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
        
        return {
          success: true,
          filePath: relativePath,
          fileName: fileName,
          fileSize: buffer.byteLength,
          alreadyExists: false
        }
      } else {
        console.warn('⚠️ 下载的文件数据为空:', fileName)
        return null
      }
      
    } catch (error) {
      if (error.message === '下载已取消') {
        console.log('🛑 文件下载被取消:', error)
        return null
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
