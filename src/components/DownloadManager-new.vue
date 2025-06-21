<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters style="height: calc(100vh - 64px);">
      <!-- 左侧对话列表 -->
      <v-col cols="4" class="border-e">
        <v-card flat class="h-100">
          <v-card-title class="pa-4 bg-primary text-white">
            <v-icon class="mr-2">mdi-chat</v-icon>
            对话列表
            <v-spacer></v-spacer>
            <v-btn icon variant="text" @click="refreshDialogs" :loading="loadingDialogs">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pa-0">
            <v-list class="py-0">
              <template v-if="loadingDialogs">
                <v-list-item v-for="i in 5" :key="i">
                  <v-list-item-content>
                    <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
                  </v-list-item-content>
                </v-list-item>
              </template>
              
              <template v-else>
                <v-list-item
                  v-for="dialog in dialogs"
                  :key="dialog.id"
                  :class="{ 'bg-blue-grey-lighten-5': selectedDialog?.id === dialog.id }"
                  @click="selectDialog(dialog)"
                  class="cursor-pointer"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getDialogColor(dialog)">
                      <v-icon v-if="dialog.isChannel">mdi-bullhorn</v-icon>
                      <v-icon v-else-if="dialog.isGroup">mdi-account-group</v-icon>
                      <v-icon v-else>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-list-item-content>
                    <v-list-item-title class="text-subtitle-2">
                      {{ dialog.title || dialog.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip size="x-small" :color="getTypeColor(dialog)" class="mr-1">
                        {{ getDialogType(dialog) }}
                      </v-chip>
                      ID: {{ dialog.id }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <template v-slot:append>
                    <v-icon v-if="selectedDialog?.id === dialog.id" color="primary">
                      mdi-check-circle
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
              
              <v-list-item v-if="!loadingDialogs && dialogs.length === 0">
                <v-list-item-content>
                  <v-list-item-title class="text-center text-grey">
                    暂无对话
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <!-- 右侧下载配置 -->
      <v-col cols="8">
        <v-card flat class="h-100">
          <v-card-title class="pa-4 bg-secondary text-white">
            <v-icon class="mr-2">mdi-download</v-icon>
            下载配置
            <v-spacer></v-spacer>
            <v-chip v-if="selectedDialog" color="white" text-color="secondary" size="small">
              {{ selectedDialog.title || selectedDialog.name }}
            </v-chip>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-form v-model="formValid" @submit.prevent="startDownload">
              <!-- 选中的对话信息 -->
              <v-alert
                v-if="selectedDialog"
                type="info"
                variant="tonal"
                class="mb-6"
              >
                <div class="d-flex align-center">
                  <v-avatar :color="getDialogColor(selectedDialog)" size="small" class="mr-3">
                    <v-icon v-if="selectedDialog.isChannel">mdi-bullhorn</v-icon>
                    <v-icon v-else-if="selectedDialog.isGroup">mdi-account-group</v-icon>
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ selectedDialog.title || selectedDialog.name }}</div>
                    <div class="text-caption">{{ getDialogType(selectedDialog) }} • ID: {{ selectedDialog.id }}</div>
                  </div>
                </div>
              </v-alert>
              
              <v-alert
                v-else
                type="warning"
                variant="tonal"
                class="mb-6"
              >
                请先从左侧选择一个对话
              </v-alert>
              
              <!-- 下载类型选择 -->
              <v-select
                v-model="downloadTypes"
                :items="downloadTypeOptions"
                label="下载类型"
                multiple
                variant="outlined"
                :rules="[v => v.length > 0 || '请至少选择一种下载类型']"
                class="mb-4"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    v-if="index < 2"
                    :key="item.value"
                    size="small"
                    closable
                    @click:close="removeDownloadType(item.value)"
                  >
                    <v-icon start :icon="item.raw.icon"></v-icon>
                    {{ item.title }}
                  </v-chip>
                  <span
                    v-if="index === 2"
                    class="text-grey text-caption align-self-center"
                  >
                    (+{{ downloadTypes.length - 2 }} 其他)
                  </span>
                </template>
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :icon="item.raw.icon" :color="item.raw.color"></v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              
              <!-- 消息ID范围 -->
              <v-row class="mb-4">
                <v-col cols="6">
                  <v-text-field
                    v-model="startMessageId"
                    label="开始消息ID (可选)"
                    type="number"
                    variant="outlined"
                    hint="留空表示从最早消息开始"
                    persistent-hint
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-message-text-outline</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="endMessageId"
                    label="结束消息ID (可选)"
                    type="number"
                    variant="outlined"
                    hint="留空表示到最新消息"
                    persistent-hint
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-message-text</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
              
              <!-- 下载路径 -->
              <v-text-field
                v-model="downloadPath"
                label="下载路径"
                variant="outlined"
                :rules="[v => !!v || '下载路径是必填项']"
                class="mb-4"
                readonly
                @click="selectDownloadPath"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-folder</v-icon>
                </template>
                <template v-slot:append-inner>
                  <v-btn icon variant="text" @click="selectDownloadPath">
                    <v-icon>mdi-folder-open</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
              
              <!-- 下载路径说明 -->
              <v-alert type="info" variant="tonal" class="mb-6">
                <strong>下载目录结构：</strong>
                <div class="mt-2">
                  <code>{{ downloadPath }}/{{ selectedDialog?.id || '[频道ID]' }}/</code>
                  <ul class="mt-2 ml-4">
                    <li><code>messages.json</code> - 消息文本数据</li>
                    <li><code>images/</code> - 图片文件</li>
                    <li><code>videos/</code> - 视频文件</li>
                    <li><code>documents/</code> - 文档文件</li>
                    <li><code>others/</code> - 其他类型文件</li>
                  </ul>
                </div>
              </v-alert>
              
              <!-- 下载按钮 -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :disabled="!selectedDialog || !formValid || isDownloading"
                :loading="isDownloading"
              >
                <v-icon start>mdi-download</v-icon>
                {{ isDownloading ? '下载中...' : '开始下载' }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 下载进度对话框 -->
    <v-dialog v-model="showProgressDialog" persistent width="600">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-download</v-icon>
          下载进度
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="mb-4">
            <div class="d-flex justify-space-between text-subtitle-2 mb-2">
              <span>总体进度</span>
              <span>{{ downloadProgress.current }} / {{ downloadProgress.total }}</span>
            </div>
            <v-progress-linear
              :model-value="(downloadProgress.current / downloadProgress.total) * 100"
              height="8"
              color="primary"
            ></v-progress-linear>
          </div>
          
          <div class="mb-4">
            <div class="text-body-2 mb-2">当前: {{ downloadProgress.currentFile }}</div>
            <div class="text-caption text-grey">{{ downloadProgress.status }}</div>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="text-caption">
            <div>已下载: {{ downloadProgress.downloaded }} 个文件</div>
            <div>跳过: {{ downloadProgress.skipped }} 个文件</div>
            <div>错误: {{ downloadProgress.errors }} 个文件</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancelDownload" color="error" variant="text">
            取消下载
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTelegramStore } from '../stores/telegram'

const telegramStore = useTelegramStore()

// 响应式数据
const dialogs = ref([])
const selectedDialog = ref(null)
const loadingDialogs = ref(false)
const formValid = ref(false)
const isDownloading = ref(false)
const showProgressDialog = ref(false)

// 表单数据
const downloadTypes = ref(['images', 'videos'])
const startMessageId = ref('')
const endMessageId = ref('')
const downloadPath = ref('')

// 下载进度
const downloadProgress = ref({
  current: 0,
  total: 0,
  currentFile: '',
  status: '',
  downloaded: 0,
  skipped: 0,
  errors: 0
})

// 下载类型选项
const downloadTypeOptions = [
  {
    title: '图片',
    value: 'images',
    icon: 'mdi-image',
    color: 'green'
  },
  {
    title: '视频',
    value: 'videos',
    icon: 'mdi-video',
    color: 'red'
  },
  {
    title: '文档',
    value: 'documents',
    icon: 'mdi-file-document',
    color: 'blue'
  },
  {
    title: '其他',
    value: 'others',
    icon: 'mdi-file',
    color: 'grey'
  }
]

// 方法
async function refreshDialogs() {
  loadingDialogs.value = true
  try {
    const dialogsList = await telegramStore.getDialogs()
    dialogs.value = dialogsList.map(dialog => ({
      id: dialog.id,
      title: dialog.title || dialog.name,
      name: dialog.name,
      isChannel: dialog.isChannel || false,
      isGroup: dialog.isGroup || false,
      isUser: dialog.isUser || false,
      entity: dialog
    }))
    console.log('✅ 获取到对话列表:', dialogs.value.length)
  } catch (error) {
    console.error('❌ 获取对话列表失败:', error)
  } finally {
    loadingDialogs.value = false
  }
}

function selectDialog(dialog) {
  selectedDialog.value = dialog
  console.log('✅ 选中对话:', dialog.title || dialog.name)
}

function getDialogColor(dialog) {
  if (dialog.isChannel) return 'red'
  if (dialog.isGroup) return 'blue'
  return 'green'
}

function getTypeColor(dialog) {
  if (dialog.isChannel) return 'red'
  if (dialog.isGroup) return 'blue'
  return 'green'
}

function getDialogType(dialog) {
  if (dialog.isChannel) return '频道'
  if (dialog.isGroup) return '群组'
  return '私聊'
}

function removeDownloadType(type) {
  const index = downloadTypes.value.indexOf(type)
  if (index > -1) {
    downloadTypes.value.splice(index, 1)
  }
}

async function selectDownloadPath() {
  try {
    const { dialog } = await import('../utils/electronAPI.js')
    
    const result = await dialog.open({
      title: '选择下载目录',
      properties: ['openDirectory'],
      defaultPath: downloadPath.value || ''
    })

    if (!result.canceled && result.filePaths.length > 0) {
      downloadPath.value = result.filePaths[0]
      console.log('✅ 已选择下载目录:', downloadPath.value)
    }
  } catch (error) {
    console.error('❌ 选择目录失败:', error)
    // 如果不是 Electron 环境，使用简单的输入
    const path = prompt('请输入下载路径:')
    if (path) {
      downloadPath.value = path
    }
  }
}

async function startDownload() {
  if (!selectedDialog.value || !formValid.value) {
    return
  }
  
  isDownloading.value = true
  showProgressDialog.value = true
  
  try {
    // 重置进度
    downloadProgress.value = {
      current: 0,
      total: 0,
      currentFile: '',
      status: '准备下载...',
      downloaded: 0,
      skipped: 0,
      errors: 0
    }
    
    // 创建下载配置
    const config = {
      dialog: selectedDialog.value,
      downloadTypes: downloadTypes.value,
      startMessageId: startMessageId.value ? parseInt(startMessageId.value) : null,
      endMessageId: endMessageId.value ? parseInt(endMessageId.value) : null,
      downloadPath: downloadPath.value,
      onProgress: (progress) => {
        downloadProgress.value = { ...downloadProgress.value, ...progress }
      }
    }
    
    console.log('🚀 开始下载，配置:', config)
    
    // 调用下载服务
    await downloadChannelContent(config)
    
    console.log('✅ 下载完成')
    
  } catch (error) {
    console.error('❌ 下载失败:', error)
  } finally {
    isDownloading.value = false
  }
}

function cancelDownload() {
  isDownloading.value = false
  showProgressDialog.value = false
  console.log('🛑 下载已取消')
}

// 下载频道内容的核心函数
async function downloadChannelContent(config) {
  const { dialog, downloadTypes, startMessageId, endMessageId, downloadPath, onProgress } = config
  
  try {
    // 创建目录结构
    const channelDir = `${downloadPath}/${dialog.id}`
    await createDirectoryStructure(channelDir, downloadTypes)
    
    // 获取消息
    onProgress({ status: '正在获取消息列表...' })
    const messages = await telegramStore.getChannelHistory(dialog.entity, 1000)

    console.log(messages)
    
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
      status: `找到 ${filteredMessages.length} 条消息` 
    })
    
    // 处理消息
    const messageData = []
    let current = 0
    
    for (const message of filteredMessages) {
      current++
      onProgress({ 
        current,
        currentFile: `消息 ${message.id}`,
        status: '正在处理消息...'
      })
      
      // 保存消息文本数据
      messageData.push({
        id: message.id,
        date: message.date,
        text: message.text,
        fromId: message.fromId,
        media: message.media ? {
          type: getMediaType(message.media),
          fileName: getMediaFileName(message.media)
        } : null
      })
      
      // 下载媒体文件
      if (message.media && shouldDownloadMedia(message.media, downloadTypes)) {
        await downloadMediaFile(message, channelDir)
        onProgress({ downloaded: downloadProgress.value.downloaded + 1 })
      }
    }
    
    // 保存消息数据为 JSON
    const messagesJson = JSON.stringify(messageData, null, 2)
    await saveTextFile(`${channelDir}/messages.json`, messagesJson)
    
    onProgress({ 
      status: '下载完成！',
      current: filteredMessages.length 
    })
    
  } catch (error) {
    console.error('❌ 下载过程中出错:', error)
    throw error
  }
}

// 辅助函数
async function createDirectoryStructure(baseDir, downloadTypes) {
  try {
    const { fs } = await import('../utils/electronAPI.js')
    
    // 创建主目录
    await fs.createDir(baseDir)
    
    // 根据下载类型创建子目录
    if (downloadTypes.includes('images')) {
      await fs.createDir(`${baseDir}/images`)
    }
    if (downloadTypes.includes('videos')) {
      await fs.createDir(`${baseDir}/videos`)
    }
    if (downloadTypes.includes('documents')) {
      await fs.createDir(`${baseDir}/documents`)
    }
    if (downloadTypes.includes('others')) {
      await fs.createDir(`${baseDir}/others`)
    }
    
    console.log('📁 目录结构创建完成:', baseDir)
  } catch (error) {
    console.error('❌ 创建目录结构失败:', error)
    throw error
  }
}

function getMediaType(media) {
  if (media.photo) return 'image'
  if (media.video) return 'video'
  if (media.document) return 'document'
  return 'other'
}

function getMediaFileName(media) {
  // 根据媒体类型生成文件名
  if (media.photo) return `photo_${Date.now()}.jpg`
  if (media.video) return `video_${Date.now()}.mp4`
  if (media.document) return media.document.fileName || `document_${Date.now()}`
  return `file_${Date.now()}`
}

function shouldDownloadMedia(media, downloadTypes) {
  const mediaType = getMediaType(media)
  const typeMap = {
    'image': 'images',
    'video': 'videos', 
    'document': 'documents',
    'other': 'others'
  }
  return downloadTypes.includes(typeMap[mediaType])
}

async function downloadMediaFile(message, channelDir) {
  try {
    const { fs } = await import('../utils/electronAPI.js')
    const media = message.media
    if (!media) return

    const mediaType = getMediaType(media)
    const fileName = getMediaFileName(media)
    
    // 确定保存目录
    let subDir = 'others'
    if (mediaType === 'image') subDir = 'images'
    else if (mediaType === 'video') subDir = 'videos'  
    else if (mediaType === 'document') subDir = 'documents'
    
    const filePath = `${channelDir}/${subDir}/${fileName}`
    
    // 检查文件是否已存在
    const exists = await fs.exists(filePath)
    if (exists) {
      console.log('📄 文件已存在，跳过:', fileName)
      return
    }
    
    // 使用 Telegram 客户端下载文件
    console.log('⬇️ 开始下载:', fileName)
    
    // 这里需要实际的 Telegram API 调用来下载媒体
    // 暂时模拟下载过程
    console.log('📁 下载媒体文件 (模拟):', message.id)
    
  } catch (error) {
    console.error('❌ 下载媒体文件失败:', error)
    throw error
  }
}

async function saveTextFile(filePath, content) {
  try {
    const { fs } = await import('../utils/electronAPI.js')
    await fs.writeTextFile(filePath, content)
    console.log('💾 文件已保存:', filePath)
  } catch (error) {
    console.error('❌ 保存文件失败:', error)
    throw error
  }
}

// 组件挂载时获取对话列表
onMounted(() => {
  refreshDialogs()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.border-e {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.h-100 {
  height: 100%;
}
</style>
