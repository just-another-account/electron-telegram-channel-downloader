# 多线程下载功能说明

## 概述

本项目已经实现了多线程下载功能，包括同一个文件的分块下载和多个文件的并发下载，最大支持5个文件同时下载。

## 主要特性

### 1. 并发下载管理
- **最大并发数**: 同时下载最多5个文件
- **队列管理**: 超过并发限制的任务自动排队等待
- **自动重试**: 失败的下载任务会自动重试（最多3次）

### 2. 文件分块下载
- **智能分块**: 大于2MB的文件自动分块下载
- **最大分块数**: 每个文件最多分为4块
- **块大小**: 每块默认1MB
- **并行处理**: 多个分块同时下载，下载完成后自动合并

### 3. 实时进度监控
- **总体进度**: 显示所有下载任务的整体进度
- **单文件进度**: 显示当前正在下载文件的详细进度
- **下载速度**: 实时显示下载速度和剩余时间
- **状态统计**: 显示并发数量、队列长度、完成/失败数量

## 核心组件

### 1. MultiThreadDownloadManager
位置: `src/services/multiThreadDownloadManager.js`

主要职责:
- 管理下载队列和并发控制
- 处理文件分块和合并
- 提供进度回调和状态更新
- 支持下载取消和重试

关键方法:
```javascript
// 添加下载任务
addDownloadTask(message, channelDir, downloadTypes, groupIndex)

// 处理下载队列
processQueue()

// 单文件分块下载
downloadWithChunks(task)

// 停止所有下载
stopAllDownloads()
```

### 2. DownloadService 集成
位置: `src/services/downloadService.js`

更新内容:
- 集成多线程下载管理器
- 支持用户选择下载模式（单线程/多线程）
- 处理多线程下载结果收集
- 提供进度格式化工具

### 3. UI界面更新
位置: `src/components/DownloadManager.vue`

新增功能:
- 多线程下载开关设置
- 多线程下载状态面板
- 并发下载数量显示
- 队列状态和下载速度显示

## 使用方法

### 1. 启用多线程下载

在下载配置页面中，找到"下载设置"部分：

```vue
<v-switch v-model="useMultiThreadDownload">
  启用多线程下载
</v-switch>
```

默认情况下多线程下载是启用的。

### 2. 监控下载进度

下载进度对话框会显示以下信息：

**总体进度**
- 当前处理的文件数量
- 总体下载进度条

**多线程状态（启用时）**
- 并发下载: 当前同时下载的文件数
- 队列等待: 排队等待下载的文件数
- 总速度: 所有并发下载的总速度
- 已下载: 总下载量

**当前文件进度**
- 文件名和下载百分比
- 文件大小和下载速度
- 分块进度（如果适用）

### 3. 配置参数调整

可以在 `MultiThreadDownloadManager` 构造函数中调整以下参数：

```javascript
this.maxConcurrentDownloads = 5  // 最大并发下载数
this.maxChunksPerFile = 4        // 每个文件最大分块数
this.chunkSize = 1024 * 1024     // 每块大小 1MB
```

## 技术实现

### 1. 队列管理算法

```javascript
async processQueue() {
  while (队列有任务 || 有活动下载) {
    // 启动新下载（不超过并发限制）
    while (活动下载 < 最大并发数 && 队列不为空) {
      启动下载任务()
    }
    
    // 等待并更新进度
    await sleep(100ms)
    更新总体进度()
  }
}
```

### 2. 分块下载流程

```javascript
async downloadWithChunks(task) {
  // 1. 计算分块数量和大小
  const chunkCount = Math.min(
    Math.ceil(fileSize / chunkSize),
    maxChunksPerFile
  )
  
  // 2. 创建分块任务
  const chunks = createChunks(fileSize, chunkCount)
  
  // 3. 并行下载所有分块
  await Promise.all(chunks.map(downloadChunk))
  
  // 4. 合并分块数据
  await mergeChunks(chunks)
}
```

### 3. 进度回调机制

```javascript
// 多种类型的进度更新
emitProgress({
  type: 'overall',    // 总体进度
  type: 'task',       // 单任务进度
  type: 'completed',  // 任务完成
  type: 'failed'      // 任务失败
})
```

## 性能优化

### 1. 内存管理
- 分块数据及时释放
- 避免大文件全量加载到内存
- 合并完成后清理分块缓存

### 2. 网络优化
- 智能重试机制
- 连接池复用
- 请求间隔控制

### 3. 并发控制
- 限制最大并发数避免资源耗尽
- 队列优先级管理
- 取消机制防止资源泄露

## 兼容性

### 1. Telegram API 限制
由于Telegram API不直接支持HTTP Range请求，分块下载通过以下方式实现：
- 完整下载文件后分块处理
- 并发下载不同文件
- 模拟分块进度显示

### 2. 浏览器兼容性
- 支持现代浏览器的Web Workers
- 兼容Electron环境
- 支持文件系统API

## 错误处理

### 1. 网络错误
- 自动重试机制（最多3次）
- 指数退避策略
- 失败任务重新排队

### 2. 文件系统错误
- 目录创建失败处理
- 磁盘空间不足检测
- 权限错误提示

### 3. 内存错误
- 大文件分块处理
- 内存使用监控
- 垃圾回收优化

## 测试验证

项目包含测试文件 `src/services/multiThreadDownloadManager.test.js`，提供以下测试功能：

```javascript
// 在浏览器控制台中运行
testMultiThreadDownload()  // 测试多线程下载
testFormatUtils()          // 测试格式化工具
testQueueManagement()      // 测试队列管理
```

## 未来改进

### 1. 功能扩展
- [ ] 支持断点续传
- [ ] 动态调整并发数
- [ ] 下载任务优先级
- [ ] 带宽限制设置

### 2. 性能优化
- [ ] 更智能的分块策略
- [ ] 网络状况自适应
- [ ] 缓存机制优化
- [ ] 预测性下载

### 3. 用户体验
- [ ] 下载历史记录
- [ ] 失败任务管理
- [ ] 下载统计分析
- [ ] 自定义下载策略

## 故障排除

### 常见问题

**Q: 多线程下载比单线程慢？**
A: 可能原因：
- 网络带宽限制
- 服务器并发限制
- 本地磁盘I/O瓶颈
- 可尝试调整并发数量

**Q: 下载经常失败？**
A: 可能原因：
- 网络不稳定
- Telegram API限制
- 磁盘空间不足
- 检查网络连接和存储空间

**Q: 内存占用过高？**
A: 可能原因：
- 同时下载大文件过多
- 分块数量设置过大
- 可减少并发数量或分块大小

### 调试技巧

1. 打开浏览器开发者工具查看控制台日志
2. 检查网络面板的请求状态
3. 监控内存使用情况
4. 查看文件系统错误信息

## 总结

多线程下载功能大幅提升了下载效率，特别是在下载多个文件时。通过智能的队列管理和分块策略，在保证系统稳定性的同时最大化下载性能。用户可以根据自己的网络环境和需求选择启用或关闭该功能。 