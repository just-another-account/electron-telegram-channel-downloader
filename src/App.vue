<script setup>
import { ref, onMounted, watch } from "vue"
import { useI18n } from 'vue-i18n'
import { useTelegramStore } from "./stores/telegram"
import TelegramLogin from "./components/TelegramLogin.vue"
import DownloadManager from "./components/DownloadManager.vue"
import LanguageSelector from "./components/LanguageSelector.vue"

const { t } = useI18n()

const telegramStore = useTelegramStore()
const showDownloader = ref(false)

// Token查看相关
const showTokenDialog = ref(false)
const currentToken = ref('')

// 检查登录状态
onMounted(async () => {
  showDownloader.value = await telegramStore.checkAuthStatus()
})

// 监听token对话框的打开，更新当前token
watch(showTokenDialog, (newValue) => {
  if (newValue) {
    updateCurrentToken()
  }
})

// 登录成功处理
function handleLoginSuccess() {
  showDownloader.value = true
}

// 退出登录处理
async function handleLogout() {
  try {
    await telegramStore.logout()
    showDownloader.value = false
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// Token相关方法
function updateCurrentToken() {
  try {
    const token = telegramStore.getCurrentToken()
    currentToken.value = token || ''
  } catch (error) {
    console.error('获取当前Token失败:', error)
    currentToken.value = ''
  }
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(currentToken.value)
    // 这里可以添加一个成功提示
    console.log('Token已复制到剪贴板')
  } catch (error) {
    console.error('复制Token失败:', error)
    // 降级方案：选择文本
    try {
      const textArea = document.createElement('textarea')
      textArea.value = currentToken.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      console.log('Token已复制到剪贴板（降级方案）')
    } catch (fallbackError) {
      console.error('复制Token失败（降级方案也失败）:', fallbackError)
    }
  }
}
</script>

<template>
  <v-app>
    <!-- 现代渐变应用栏 -->
    <v-app-bar 
      v-if="showDownloader" 
      class="gradient-app-bar"
      dark
      elevation="0"
      height="72"
    >
      <v-container class="d-flex align-center pa-0" fluid>
        <div class="d-flex align-center">
          <v-avatar class="me-3" size="40">
            <v-icon size="24" color="white">mdi-telegram</v-icon>
          </v-avatar>
          <div>
            <v-app-bar-title class="text-h6 font-weight-bold">
              {{ $t('app.title') }}
            </v-app-bar-title>
            <div class="text-caption opacity-80">
              {{ $t('app.description') }}
            </div>
          </div>
        </div>
        
        <v-spacer></v-spacer>
        
        <div class="d-flex align-center">
          <!-- 语言选择器 -->
          <LanguageSelector class="me-2" />
          
          <v-btn 
            icon 
            variant="text" 
            @click="showTokenDialog = true" 
            class="me-2"
            size="large"
          >
            <v-icon>mdi-key-variant</v-icon>
            <v-tooltip activator="parent" location="bottom">
              {{ $t('common.viewToken') }}
            </v-tooltip>
          </v-btn>
          
          <v-btn 
            icon 
            variant="text" 
            @click="handleLogout"
            size="large"
          >
            <v-icon>mdi-logout-variant</v-icon>
            <v-tooltip activator="parent" location="bottom">
              {{ $t('common.logout') }}
            </v-tooltip>
          </v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <!-- 主内容区域 -->
    <v-main class="modern-main">
      <!-- 登录界面 -->
      <div v-if="!showDownloader" class="login-container">
        <TelegramLogin @login-success="handleLoginSuccess" />
      </div>
      
      <!-- 下载管理界面 -->
      <div v-else class="main-content">
        <DownloadManager />
      </div>
    </v-main>

    <!-- Token查看对话框 -->
    <v-dialog 
      v-model="showTokenDialog" 
      max-width="700" 
      class="token-view-dialog"
    >
      <v-card class="token-view-card" rounded="xl" elevation="24">
        <v-card-title class="token-view-header">
          <div class="d-flex align-center">
            <v-avatar class="me-3" size="40" color="primary">
              <v-icon color="white">mdi-key-variant</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 mb-1">{{ $t('common.currentToken') }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ $t('common.tokenDescription') }}
              </p>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pa-6">
          <v-alert 
            type="info" 
            variant="tonal" 
            class="mb-6"
            rounded="lg"
          >
            <div class="font-weight-medium">{{ $t('common.securityTip') }}</div>
            <div class="text-caption mt-1">
              {{ $t('common.tokenSecurityMessage') }}
            </div>
          </v-alert>

          <div class="token-display-container">
            <v-textarea
              :model-value="currentToken"
              :label="$t('common.sessionToken')"
              variant="solo"
              bg-color="surface-variant"
              readonly
              rows="6"
              class="token-display"
              prepend-inner-icon="mdi-key-variant"
              hide-details
            ></v-textarea>
            
            <v-btn
              v-if="currentToken"
              color="primary"
              variant="tonal"
              @click="copyToken"
              class="mt-4"
              block
              rounded="lg"
            >
              <v-icon start>mdi-content-copy</v-icon>
              {{ $t('common.copyToken') }}
            </v-btn>
            
            <v-alert 
              v-if="!currentToken" 
              type="warning" 
              variant="tonal" 
              class="mt-4"
              rounded="lg"
            >
              <div class="d-flex align-center">
                <v-icon class="me-3">mdi-alert-outline</v-icon>
                <div>
                  <div class="font-weight-medium">{{ $t('common.tokenUnavailable') }}</div>
                  <div class="text-caption mt-1">
                    {{ $t('common.tokenUnavailableMessage') }}
                  </div>
                </div>
              </div>
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showTokenDialog = false"
            rounded="lg"
          >
            {{ $t('common.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
/* 现代渐变应用栏 */
.gradient-app-bar {
  background: linear-gradient(135deg, rgb(var(--v-theme-gradient-start)) 0%, rgb(var(--v-theme-gradient-end)) 100%) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* 现代主内容区域 */
.modern-main {
  background: linear-gradient(180deg, rgb(var(--v-theme-background)) 0%, rgb(var(--v-theme-surface-variant)) 100%);
  min-height: 100vh;
}

/* 登录容器 */
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, rgb(var(--v-theme-gradient-start)) 0%, rgb(var(--v-theme-gradient-end)) 100%);
}

/* 主内容区域 */
.main-content {
  background: rgb(var(--v-theme-background));
  min-height: calc(100vh - 72px);
}

/* 响应式设计 */
@media (max-width: 960px) {
  .login-container {
    padding: 16px;
  }
  
  .gradient-app-bar .v-container {
    padding: 0 16px;
  }
}

/* 添加细腻的动画效果 */
.v-app-bar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Token查看对话框样式 */
.token-view-dialog .v-overlay__content {
  margin: 24px;
}

.token-view-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.token-view-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-gradient-start)) 0%, rgb(var(--v-theme-gradient-end)) 100%);
  color: white;
  padding: 24px !important;
  border-radius: 12px 12px 0 0 !important;
}

.token-display .v-field {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 12px !important;
  line-height: 1.4 !important;
}

.token-display .v-field__input {
  word-break: break-all !important;
  white-space: pre-wrap !important;
}

.v-theme--dark .token-view-card {
  background: rgba(30, 41, 59, 0.98) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
