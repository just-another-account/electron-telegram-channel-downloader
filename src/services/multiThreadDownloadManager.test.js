// 多线程下载管理器测试文件
// 这是一个简单的功能验证文件，用于开发时测试

import multiThreadDownloadManager from './multiThreadDownloadManager.js'

// 模拟测试数据
const mockMessage = {
  id: 12345,
  media: {
    document: {
      size: 5 * 1024 * 1024, // 5MB
      fileName: 'test_video.mp4',
      mimeType: 'video/mp4'
    }
  }
}

const mockChannelDir = '/tmp/test_channel'
const mockDownloadTypes = ['videos']

// 测试函数
export async function testMultiThreadDownload() {
  console.log('🧪 开始测试多线程下载管理器...')
  
  try {
    // 添加进度回调
    const progressCallback = (data) => {
      console.log('📊 进度更新:', data)
    }
    
    multiThreadDownloadManager.addProgressCallback(progressCallback)
    
    // 添加多个下载任务测试并发
    console.log('📝 添加下载任务...')
    
    for (let i = 0; i < 8; i++) {
      const testMessage = {
        ...mockMessage,
        id: mockMessage.id + i
      }
      
      await multiThreadDownloadManager.addDownloadTask(
        testMessage,
        mockChannelDir,
        mockDownloadTypes
      )
    }
    
    // 获取统计信息
    const stats = multiThreadDownloadManager.getStats()
    console.log('📈 当前统计:', stats)
    
    // 等待一段时间观察进度
    console.log('⏳ 等待下载进度...')
    setTimeout(() => {
      const finalStats = multiThreadDownloadManager.getStats()
      console.log('📈 最终统计:', finalStats)
      
      // 停止所有下载
      multiThreadDownloadManager.stopAllDownloads()
      console.log('🛑 测试完成，已停止所有下载')
    }, 5000)
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 测试文件大小格式化
export function testFormatUtils() {
  console.log('🧪 测试工具函数...')
  
  const testSizes = [0, 1024, 1024 * 1024, 1024 * 1024 * 1024]
  
  // 由于formatFileSize是私有方法，我们创建一个公共版本测试
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  testSizes.forEach(size => {
    console.log(`${size} bytes = ${formatFileSize(size)}`)
  })
}

// 测试队列管理
export function testQueueManagement() {
  console.log('🧪 测试队列管理...')
  
  const manager = multiThreadDownloadManager
  
  console.log('📊 初始状态:', {
    maxConcurrent: manager.maxConcurrentDownloads,
    maxChunks: manager.maxChunksPerFile,
    chunkSize: manager.chunkSize / 1024 / 1024 + 'MB'
  })
  
  console.log('✅ 队列管理测试完成')
}

// 如果在浏览器环境中运行，可以通过控制台调用这些测试
if (typeof window !== 'undefined') {
  window.testMultiThreadDownload = testMultiThreadDownload
  window.testFormatUtils = testFormatUtils
  window.testQueueManagement = testQueueManagement
  
  console.log('🔧 多线程下载测试函数已加载到 window 对象')
  console.log('可以使用以下命令测试:')
  console.log('- testMultiThreadDownload() // 测试多线程下载')
  console.log('- testFormatUtils() // 测试格式化工具')
  console.log('- testQueueManagement() // 测试队列管理')
}

export default {
  testMultiThreadDownload,
  testFormatUtils,
  testQueueManagement
} 