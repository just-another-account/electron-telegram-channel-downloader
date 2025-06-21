/**
 * 测试实际的文件大小获取功能
 */

// 模拟不同类型的 Telegram 消息结构
const testMessages = [
  // 文档类型 - 直接在 media.document 中
  {
    id: 1,
    message: 'Test document',
    media: {
      _: 'messageMediaDocument',
      document: {
        id: '123',
        size: 1024 * 100, // 100KB
        fileName: 'test.pdf',
        attributes: [{ fileName: 'test.pdf' }]
      }
    }
  },
  
  // 照片类型 - 在 media.photo.sizes 中
  {
    id: 2,
    message: 'Test photo',
    media: {
      _: 'messageMediaPhoto',
      photo: {
        id: '456',
        sizes: [
          { size: 1024 * 50 }, // 50KB
          { size: 1024 * 200 }, // 200KB - 最大的
          { size: 1024 * 150 }  // 150KB
        ]
      }
    }
  },
  
  // 视频类型
  {
    id: 3,
    message: 'Test video',
    media: {
      _: 'messageMediaDocument',
      document: {
        id: '789',
        size: 1024 * 1024 * 2, // 2MB
        videoSizes: [{ type: 'h' }],
        attributes: [{ fileName: 'video.mp4' }]
      }
    }
  },
  
  // 纯文本消息（无媒体）
  {
    id: 4,
    message: 'Just text, no media'
  }
]

class TestDownloadService {
  getMediaType(media) {
    if (media.photo || media._ === 'messageMediaPhoto') return 'photo'
    if (media.video || media._ === 'messageMediaDocument' && media.document?.videoSizes) return 'video'
    if (media.document || media._ === 'messageMediaDocument') return 'document'
    return 'other'
  }

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

  shouldDownloadFile(message, filenameFilter, filterMode = 'include', minFileSize = null, maxFileSize = null) {
    console.log(`\n🔍 检查消息 ${message.id}:`)
    console.log('  消息文本:', message.message)
    console.log('  有媒体:', !!message.media)
    
    // 文件名过滤检查（简化版本）
    let filenameMatched = true
    if (filenameFilter && filenameFilter.trim() !== '') {
      // 简化的文件名检查
      const keyword = filenameFilter.toLowerCase()
      const messageText = (message.message || '').toLowerCase()
      const hasMatch = messageText.includes(keyword)
      
      filenameMatched = filterMode === 'include' ? hasMatch : !hasMatch
      console.log('  文件名过滤:', filenameMatched)
    }
    
    // 文件大小过滤检查
    let sizeMatched = true
    if (message.media && ((minFileSize !== null && minFileSize > 0) || (maxFileSize !== null && maxFileSize > 0))) {
      const fileSize = this.getMediaSize(message.media)
      const fileSizeKB = fileSize / 1024
      const mediaType = this.getMediaType(message.media)
      
      console.log('  媒体类型:', mediaType)
      console.log('  文件大小:', fileSize, 'bytes =', fileSizeKB.toFixed(2), 'KB')
      console.log('  过滤范围:', minFileSize || 'none', '-', maxFileSize || 'none', 'KB')
      
      if (fileSize === 0) {
        console.log('  ❌ 无法获取文件大小')
        sizeMatched = false
      } else {
        // 检查最小文件大小
        if (minFileSize !== null && minFileSize > 0 && fileSizeKB < minFileSize) {
          sizeMatched = false
          console.log(`  ❌ 文件太小: ${fileSizeKB.toFixed(2)} KB < ${minFileSize} KB`)
        }
        
        // 检查最大文件大小
        if (maxFileSize !== null && maxFileSize > 0 && fileSizeKB > maxFileSize) {
          sizeMatched = false
          console.log(`  ❌ 文件太大: ${fileSizeKB.toFixed(2)} KB > ${maxFileSize} KB`)
        }
        
        if (sizeMatched) {
          console.log(`  ✅ 文件大小匹配: ${fileSizeKB.toFixed(2)} KB`)
        }
      }
    } else if (!message.media) {
      console.log('  📝 纯文本消息，跳过文件大小检查')
    }
    
    const result = filenameMatched && sizeMatched
    console.log('  🎯 最终结果:', result ? '✅ 下载' : '❌ 跳过')
    
    return result
  }
}

// 运行测试
const service = new TestDownloadService()

console.log('=== 文件大小获取测试 ===')

testMessages.forEach(msg => {
  console.log(`\n消息 ${msg.id}:`)
  if (msg.media) {
    const size = service.getMediaSize(msg.media)
    const type = service.getMediaType(msg.media)
    console.log(`  类型: ${type}`)
    console.log(`  大小: ${size} bytes (${(size/1024).toFixed(2)} KB)`)
    console.log(`  媒体结构:`, JSON.stringify(msg.media, null, 2))
  } else {
    console.log('  无媒体')
  }
})

console.log('\n=== 文件大小过滤测试 ===')

// 测试场景：只下载大于80KB的文件
console.log('\n测试1: 只下载大于80KB的文件')
testMessages.forEach(msg => {
  service.shouldDownloadFile(msg, null, 'include', 80, null)
})

// 测试场景：只下载小于300KB的文件
console.log('\n测试2: 只下载小于300KB的文件')
testMessages.forEach(msg => {
  service.shouldDownloadFile(msg, null, 'include', null, 300)
})

// 测试场景：下载100KB-1MB的文件
console.log('\n测试3: 只下载100KB-1MB的文件')
testMessages.forEach(msg => {
  service.shouldDownloadFile(msg, null, 'include', 100, 1024)
})

console.log('\n测试完成！')
