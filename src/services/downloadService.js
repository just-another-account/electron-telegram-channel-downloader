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
    let processedGroupIds = new Set() // 用于跟踪已处理的媒体组

    try {
      // 创建基础目录
      const channelDir = `${downloadPath}/${dialog.id}`
      await this.createDirectoryStructure(channelDir, downloadTypes)
      
      // 流式获取和下载消息
      onProgress({ status: '正在初始化流式下载...' })
      
      let totalProcessed = 0
      let currentOffsetId = 0  // 0 表示从最新消息开始
      const batchSize = 100
      let hasMoreMessages = true
      let estimatedTotal = 0
      
      // 如果有消息范围，估算总数
      if (startMessageId && endMessageId) {
        estimatedTotal = Math.abs(endMessageId - startMessageId) + 1
        onProgress({ 
          total: estimatedTotal,
          status: `预计处理 ${estimatedTotal} 条消息，从最新消息开始分批获取...` 
        })
      } else {
        onProgress({ 
          status: '从最新消息开始分批获取和下载消息，总数未知...' 
        })
      }
      
      console.log(`� 开始流式下载，批次大小: ${batchSize}`)
      
      let batchNumber = 1
      
      while (hasMoreMessages && this.isDownloading) {
        try {
          console.log(`\n📦 ===== 批次 ${batchNumber} 开始 =====`)
          console.log(`� 获取消息批次，offsetId: ${currentOffsetId}, 批次大小: ${batchSize}`)
          
          // 获取当前批次的消息
          onProgress({ 
            status: `正在获取第 ${batchNumber} 批消息...` 
          })
          
          const batchOptions = {
            limit: batchSize
          }
          
          // 设置offsetId以获取更早的消息
          if (currentOffsetId > 0) {
            batchOptions.offsetId = currentOffsetId
          }
          
          // 设置消息范围限制
          if (endMessageId) {
            batchOptions.maxId = endMessageId  // 不下载比这个ID更新的消息
          }
          
          if (startMessageId) {
            batchOptions.minId = startMessageId - 1  // 不下载比这个ID更旧的消息
          }
          
          const batchMessages = await telegramService.client.getMessages(dialog.entity, batchOptions)
          
          console.log(`📨 API返回结果:`, {
            batchNumber,
            requestedLimit: batchSize,
            actualReceived: batchMessages.length,
            offsetId: currentOffsetId,
            firstMessageId: batchMessages.length > 0 ? batchMessages[0].id : 'none',
            lastMessageId: batchMessages.length > 0 ? batchMessages[batchMessages.length - 1].id : 'none'
          })
          
          if (batchMessages.length === 0) {
            console.log('📨 没有更多消息可获取，结束下载')
            hasMoreMessages = false
            break
          }
          
          // 过滤消息到指定范围
          const filteredBatch = batchMessages.filter(msg => {
            if (startMessageId && msg.id < startMessageId) return false
            if (endMessageId && msg.id > endMessageId) return false
            return true
          })
          
          console.log(`📨 批次获取到 ${batchMessages.length} 条消息，过滤后 ${filteredBatch.length} 条`)
          
          if (filteredBatch.length === 0) {
            // 如果当前批次没有匹配的消息，使用原始批次的最后一条消息更新偏移ID
            if (batchMessages.length > 0) {
              const oldestMessage = batchMessages[batchMessages.length - 1]
              currentOffsetId = oldestMessage.id
              console.log(`📄 批次无匹配消息，更新 offsetId 为: ${currentOffsetId}`)
            } else {
              // 没有更多消息了
              hasMoreMessages = false
              break
            }
            batchNumber++
            continue
          }
          
          // 按消息ID降序排序，确保从最新到最旧的顺序
          filteredBatch.sort((a, b) => b.id - a.id)
          
          // 不进行总数估算，保持流式下载的动态特性
          // 让界面显示实时的处理数量，不显示误导性的总数
          
          // 处理当前批次的每条消息
          for (let i = 0; i < filteredBatch.length; i++) {
            const message = filteredBatch[i]
            
            if (!this.isDownloading) {
              console.log('🛑 用户取消下载')
              hasMoreMessages = false
              break
            }
            
            totalProcessed++
            
            const progressUpdate = { 
              current: totalProcessed,
              currentFile: `消息 ${message.id}`,
              status: `正在处理第 ${batchNumber} 批第 ${i + 1}/${filteredBatch.length} 条消息 (ID: ${message.id})`
            }
            
            // 只有在有明确总数估算时才传递total参数
            if (estimatedTotal > 0) {
              progressUpdate.total = Math.max(estimatedTotal, totalProcessed)
            }
            
            onProgress(progressUpdate)
            
            try {
              // 检查消息是否符合过滤条件
              const shouldInclude = this.shouldDownloadFile(message, filenameFilter, filterMode, minFileSize, maxFileSize)
              
              console.log(`📋 消息 ${message.id} 过滤检查:`, {
                messageId: message.id,
                hasMedia: !!message.media,
                shouldInclude,
                filenameFilter,
                filterMode
              })
              
              let messageInfo = null
              if (shouldInclude) {
                // 提取消息数据
                messageInfo = this.extractMessageData(message)
                allMessageData.push(messageInfo)
              }
              
              // 下载媒体文件（支持多媒体消息）
              if (message.media && this.shouldDownloadMedia(message.media, downloadTypes)) {
                console.log(`🎬 消息 ${message.id} 媒体类型检查通过，准备下载检查`)
                
                // 检查文件名过滤
                if (shouldInclude) {
                  console.log(`✅ 消息 ${message.id} 开始下载`)
                  
                  // 检查是否是媒体组的一部分
                  if (message.groupedId) {
                    const groupedIdStr = String(message.groupedId)
                    
                    // 检查是否已经处理过这个媒体组
                    if (processedGroupIds.has(groupedIdStr)) {
                      console.log(`📱 媒体组 ${groupedIdStr} 已处理，跳过消息 ${message.id}`)
                    } else {
                      console.log(`📱 消息 ${message.id} 是媒体组的一部分 (groupedId: ${message.groupedId})`)
                      // 获取同一媒体组的所有消息
                      const groupMessages = await this.getGroupedMessages(dialog.entity, message.groupedId, filteredBatch)
                      
                      // 下载媒体组中的所有媒体文件
                      const downloadResults = await this.downloadMediaGroup(groupMessages, channelDir, downloadTypes, onProgress)
                      
                      // 更新消息数据中的媒体路径信息
                      if (downloadResults && downloadResults.length > 0 && messageInfo) {
                        messageInfo.media.downloadPaths = downloadResults.map(result => result.filePath)
                        messageInfo.media.downloadedAt = new Date().toISOString()
                        messageInfo.media.fileExists = true
                        messageInfo.media.isMediaGroup = true
                        messageInfo.media.groupedId = message.groupedId
                      }
                      
                      this.downloadedCount += downloadResults.length
                      onProgress({ downloaded: this.downloadedCount })
                      
                      // 标记该媒体组为已处理
                      processedGroupIds.add(groupedIdStr)
                    }
                  } else {
                    // 单个媒体文件
                    const downloadResult = await this.downloadMediaFile(message, channelDir, downloadTypes, onProgress)
                    
                    // 如果下载成功，更新消息数据中的媒体路径信息
                    if (downloadResult && downloadResult.filePath && messageInfo) {
                      messageInfo.media.downloadPath = downloadResult.filePath
                      messageInfo.media.downloadedAt = new Date().toISOString()
                      messageInfo.media.fileExists = true
                    }
                    
                    this.downloadedCount++
                    onProgress({ downloaded: this.downloadedCount })
                  }
                } else {
                  console.log(`⏭️ 消息 ${message.id} 被过滤器排除，跳过下载`)
                  this.skippedCount++
                  onProgress({ skipped: this.skippedCount })
                }
              } else if (message.media) {
                console.log(`⏭️ 消息 ${message.id} 媒体类型不匹配，跳过`)
                this.skippedCount++
                onProgress({ skipped: this.skippedCount })
              }
              
            } catch (error) {
              console.error(`❌ 处理消息 ${message.id} 失败:`, error)
              this.errorCount++
              onProgress({ errors: this.errorCount })
            }
            
            // 添加小延迟避免请求过快
            await new Promise(resolve => setTimeout(resolve, 50))
          }
          
          // 更新offsetId为当前批次最旧消息的ID（用于下一批次获取更早的消息）
          const oldestInBatch = batchMessages[batchMessages.length - 1]
          
          // 检查是否已到达起始消息ID范围
          if (startMessageId && oldestInBatch.id <= startMessageId) {
            console.log('📨 已到达起始消息ID范围，停止获取')
            hasMoreMessages = false
            break
          }
          
          // 防止无限循环：如果offsetId没有变化，说明可能到达了消息历史的末尾
          if (oldestInBatch.id === currentOffsetId) {
            console.log('📨 偏移ID未变化，可能到达消息历史末尾')
            hasMoreMessages = false
            break
          }
          
          // 更新offsetId为当前批次最旧消息的ID
          currentOffsetId = oldestInBatch.id
          console.log(`📄 更新 offsetId 为: ${currentOffsetId}，准备获取更早的消息`)
          
          // 如果获取的消息数量少于批次限制，说明没有更多消息了
          if (batchMessages.length < batchSize) {
            console.log('📨 获取到的消息少于批次限制，结束获取')
            hasMoreMessages = false
            break
          }
          
          console.log(`✅ 批次 ${batchNumber} 处理完成，准备获取下一批`)
          batchNumber++
          
          // 批次间添加延迟避免请求过频繁
          await new Promise(resolve => setTimeout(resolve, 300))
          
        } catch (error) {
          console.error(`❌ 处理批次 ${batchNumber} 失败:`, error)
          this.errorCount++
          onProgress({ errors: this.errorCount })
          
          // 继续处理下一批次
          batchNumber++
          await new Promise(resolve => setTimeout(resolve, 1000)) // 错误后等待更长时间
        }
      }
      
      console.log(`🎉 流式下载完成，总共处理了 ${totalProcessed} 条消息`)
      
      // 分文件保存消息数据
      await this.saveMessagesJsonByChunks(allMessageData, `${channelDir}/json`)
      
      // 更新下载记录
      await this.updateDownloadRecord(dialog.id, allMessageData)
      recordSaved = true
      
      onProgress({ 
        status: '下载完成！',
        current: totalProcessed 
      })
      
      return {
        success: true,
        totalMessages: totalProcessed,
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
      filenameFilter: filenameFilter ? filenameFilter.split('|') : null,
      filterMode, 
      minFileSize,
      maxFileSize
    })
    // 文件名过滤检查
    let filenameMatched = true
    if (filenameFilter && filenameFilter.trim() !== '') {
      // 支持多个关键字，使用 | 分隔
      const filterKeywords = filenameFilter.toLowerCase().trim().split('|').map(k => k.trim()).filter(k => k.length > 0)
      let matchFound = false
      
      // 检查消息文本是否包含任一关键词
      if (message.message) {
        const messageText = message.message.toLowerCase()
        matchFound = filterKeywords.some(keyword => messageText.includes(keyword))
      }
      
      // 检查文件名是否包含任一关键词（无论消息文本是否匹配都要检查）
      if (message.media) {
        // 获取实际的文件名（使用与getMediaFileName相同的逻辑）
        let originalFileName = ''
        
        if (message.media.document) {
          const doc = message.media.document
          
          // 优先从attributes数组中获取文件名
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
        } else if (message.media.photo) {
          originalFileName = 'photo'
        } else if (message.media.video) {
          originalFileName = 'video'
        }
        
        // 如果还没有匹配，检查文件名
        if (!matchFound && originalFileName) {
          const lowerFileName = originalFileName.toLowerCase()
          matchFound = filterKeywords.some(keyword => lowerFileName.includes(keyword))
          
          // 详细调试输出
          console.log(`🔍 检查文件名过滤:`, {
            originalFileName,
            lowerFileName,
            filterKeywords,
            matchFound: matchFound,
            filterMode
          })
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
      
      // 增强调试信息
      console.log(`🔍 文件名过滤结果:`, {
        messageId: message.id,
        filterKeywords,
        filterMode,
        matchFound,
        filenameMatched,
        messageText: message.message ? message.message.substring(0, 50) + '...' : 'none',
        fileName: message.media && message.media.document ? 
          (message.media.document.attributes?.[0]?.fileName || message.media.document.fileName || 'unknown') : 
          (message.media ? (message.media.photo ? 'photo' : 'video') : 'no media')
      })
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
  getMediaFileName(media, messageId, groupIndex = null) {
    const timestamp = Date.now()
    const groupSuffix = groupIndex ? `_${groupIndex}` : ''
    
    if (media.photo || media._ === 'messageMediaPhoto') {
      // 图片没有原始文件名，使用自定义命名
      return `photo_${messageId}${groupSuffix}_${timestamp}.jpg`
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
        
        // 如果是媒体组，在文件名中添加索引
        if (groupIndex) {
          const fileExtension = this.getExtensionFromFileName(sanitizedName)
          if (fileExtension) {
            const nameWithoutExt = sanitizedName.substring(0, sanitizedName.lastIndexOf('.'))
            return `${nameWithoutExt}${groupSuffix}.${fileExtension}`
          } else {
            return `${sanitizedName}${groupSuffix}`
          }
        }
        
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
        return `document_${messageId}${groupSuffix}_${timestamp}.${mimeExtension}`
      }
      
      return `document_${messageId}${groupSuffix}_${timestamp}.bin`
    }
    
    if (media.video) {
      // 视频通常没有原始文件名，使用自定义命名
      return `video_${messageId}${groupSuffix}_${timestamp}.mp4`
    }
    
    return `file_${messageId}${groupSuffix}_${timestamp}`
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
  async downloadMediaFile(message, channelDir, downloadTypes, onProgress = null, groupIndex = null) {
    try {
      // 检查是否被取消
      if (!this.isDownloading) {
        console.log('🛑 下载已取消，跳过文件下载')
        return null
      }

      const media = message.media
      if (!media) return null

      const mediaType = this.getMediaType(media)
      const fileName = this.getMediaFileName(media, message.id, groupIndex)
      
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

  /**
   * 获取媒体组中的所有消息
   */
  async getGroupedMessages(entity, groupedId, currentBatch = []) {
    try {
      console.log(`🔍 搜索媒体组消息 (groupedId: ${groupedId})`)
      
      // 首先从当前批次中查找相同groupedId的消息
      const groupMessages = currentBatch.filter(msg => 
        msg.groupedId && (
          (typeof msg.groupedId === 'bigint' && typeof groupedId === 'bigint' && msg.groupedId === groupedId) ||
          (typeof msg.groupedId === 'number' && typeof groupedId === 'number' && msg.groupedId === groupedId) ||
          (Number(msg.groupedId) === Number(groupedId))
        )
      )
      
      console.log(`📱 在当前批次中找到 ${groupMessages.length} 条媒体组消息`)
      
      // 如果在当前批次中找到了多条消息，直接返回
      if (groupMessages.length > 0) {
        // 按消息ID排序，确保顺序正确
        groupMessages.sort((a, b) => a.id - b.id)
        console.log(`✅ 媒体组消息ID: ${groupMessages.map(m => m.id).join(', ')}`)
        return groupMessages
      }
      
      // 如果在当前批次中没有找到足够的消息，可能需要额外获取
      // 由于媒体组的消息通常是连续的，我们尝试获取附近的消息
      console.log(`⚠️ 在当前批次中未找到完整的媒体组，返回单条消息`)
      return currentBatch.filter(msg => 
        msg.groupedId && Number(msg.groupedId) === Number(groupedId)
      )
      
    } catch (error) {
      console.error('❌ 获取媒体组消息失败:', error)
      // 如果获取失败，返回空数组
      return []
    }
  }

  /**
   * 下载媒体组中的所有媒体文件
   */
  async downloadMediaGroup(groupMessages, channelDir, downloadTypes, onProgress = null) {
    const downloadResults = []
    
    try {
      console.log(`📱 开始下载媒体组，包含 ${groupMessages.length} 个媒体文件`)
      
      for (let i = 0; i < groupMessages.length; i++) {
        const message = groupMessages[i]
        
        // 检查是否被取消
        if (!this.isDownloading) {
          console.log('🛑 下载已取消，停止媒体组下载')
          break
        }
        
        console.log(`📥 下载媒体组文件 ${i + 1}/${groupMessages.length} (消息ID: ${message.id})`)
        
        if (onProgress) {
          onProgress({
            status: `正在下载媒体组文件 ${i + 1}/${groupMessages.length} (消息ID: ${message.id})`
          })
        }
        
        // 下载单个媒体文件，使用特殊的文件名前缀来标识媒体组
        const downloadResult = await this.downloadMediaFile(message, channelDir, downloadTypes, onProgress, i + 1)
        
        if (downloadResult) {
          downloadResults.push(downloadResult)
          console.log(`✅ 媒体组文件 ${i + 1} 下载完成: ${downloadResult.fileName}`)
        }
        
        // 媒体组文件间添加小延迟
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      console.log(`✅ 媒体组下载完成，成功下载 ${downloadResults.length} 个文件`)
      return downloadResults
      
    } catch (error) {
      console.error('❌ 下载媒体组失败:', error)
      throw error
    }
  }

  // ...existing code...
}

// 创建单例实例
const downloadService = new DownloadService()

export default downloadService
