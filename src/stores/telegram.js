import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import telegramService from '../services/telegramService.js'
import { setApiCredentials, loadApiCredentials, clearApiCredentials } from '../config/telegram.js'

export const useTelegramStore = defineStore('telegram', () => {
  // State
  const isLoggedIn = ref(false)
  const userInfo = ref(null)
  const apiCredentials = ref({
    apiId: null,
    apiHash: null
  })

  // 从本地存储加载API凭据
  function loadStoredCredentials() {
    try {
      const loaded = loadApiCredentials()
      if (loaded) {
        const storedApiId = localStorage.getItem('telegram_api_id')
        const storedApiHash = localStorage.getItem('telegram_api_hash')
        apiCredentials.value = {
          apiId: parseInt(storedApiId),
          apiHash: storedApiHash
        }
        console.log('✅ 已从本地存储加载API凭据')
        return true
      }
    } catch (error) {
      console.error('❌ 加载本地存储的API凭据失败:', error)
    }
    return false
  }

  // 保存API凭据到本地存储
  function saveCredentials(apiId, apiHash) {
    try {
      setApiCredentials(apiId, apiHash)
      apiCredentials.value = {
        apiId: parseInt(apiId),
        apiHash: apiHash
      }
      console.log('✅ API凭据已保存到本地存储')
    } catch (error) {
      console.error('❌ 保存API凭据到本地存储失败:', error)
    }
  }

  // 清除本地存储的凭据
  function clearStoredCredentials() {
    try {
      clearApiCredentials()
      apiCredentials.value = { apiId: null, apiHash: null }
      console.log('✅ 已清除本地存储的凭据')
    } catch (error) {
      console.error('❌ 清除本地存储凭据失败:', error)
    }
  }

  // Getters
  const isClientReady = computed(() => !!telegramService.client)
  const userName = computed(() => userInfo.value?.firstName || 'Unknown User')
  const hasStoredCredentials = computed(() => {
    return !!(apiCredentials.value.apiId && apiCredentials.value.apiHash)
  })

  // Actions
  async function initializeClient(apiId, apiHash) {
    try {
      // 保存 API 凭据
      saveCredentials(apiId, apiHash)
      
      // 初始化 telegram 服务
      await telegramService.initialize()
      
      console.log('✅ Telegram 客户端初始化成功')
      return true
    } catch (error) {
      console.error('❌ 初始化 Telegram 客户端失败:', error)
      throw error
    }
  }

  async function sendCode(phoneNumber) {
    try {
      console.log('📱 发送验证码到:', phoneNumber)
      const result = await telegramService.sendCode(phoneNumber)
      console.log('✅ 验证码发送成功', result)
      return result
    } catch (error) {
      console.error('❌ 发送验证码失败:', error)
      throw error
    }
  }

  async function signIn(phoneNumber, code) {
    try {
      console.log('🔐 开始验证登录，手机号:', phoneNumber, '验证码:', code)
      
      const result = await telegramService.signInWithCode(phoneNumber, code)
      
      // 登录成功，获取用户信息
      const me = await telegramService.getMe()
      isLoggedIn.value = true
      userInfo.value = me
      
      console.log('✅ 登录成功:', me.firstName, me.lastName)
      return { success: true, user: me }
      
    } catch (error) {
      console.error('❌ 登录失败详细错误:', error)
      
      // 检查是否是需要两步验证的错误
      if (error.code === 'SESSION_PASSWORD_NEEDED' || 
          error.message.includes('SESSION_PASSWORD_NEEDED')) {
        console.log('🔒 需要两步验证密码')
        return { needPassword: true }
      }
      
      // 检查其他常见错误
      if (error.message && error.message.includes('PHONE_CODE_INVALID')) {
        throw new Error('验证码无效')
      }
      
      if (error.message && error.message.includes('PHONE_CODE_EXPIRED')) {
        throw new Error('验证码已过期')
      }
      
      throw error
    }
  }

  async function signInWithPassword(password) {
    try {
      console.log('🔐 开始两步验证')
      
      const result = await telegramService.signInWithPassword(password)
      
      // 登录成功，获取用户信息
      const me = await telegramService.getMe()
      isLoggedIn.value = true
      userInfo.value = me
      
      console.log('✅ 密码验证成功，登录完成:', me.firstName, me.lastName)
      return result
    } catch (error) {
      console.error('❌ 密码验证失败:', error)
      throw error
    }
  }

  async function logout() {
    try {
      await telegramService.logout()
      
      // 重置状态
      isLoggedIn.value = false
      userInfo.value = null
      // 注意：不清除 API 凭据，保留给下次使用
      
      console.log('✅ 退出登录成功')
    } catch (error) {
      console.error('❌ 退出登录失败:', error)
      throw error
    }
  }

  async function getDialogs() {
    try {
      if (!isLoggedIn.value) {
        throw new Error('未登录或客户端未准备就绪')
      }
      
      const dialogs = await telegramService.getDialogs(1000)
      return dialogs
    } catch (error) {
      console.error('❌ 获取对话列表失败:', error)
      throw error
    }
  }

  async function getChannelHistory(channelId, limit = 100) {
    try {
      if (!isLoggedIn.value) {
        throw new Error('未登录或客户端未准备就绪')
      }
      
      const messages = await telegramService.getMessages(channelId, limit)
      return messages
    } catch (error) {
      console.error('❌ 获取频道历史失败:', error)
      throw error
    }
  }

  // 检查登录状态
  async function checkAuthStatus() {
    try {
      // 先尝试使用存储的完整会话自动初始化
      const autoInitSuccess = await autoInitializeWithStoredSession()
      if (autoInitSuccess) {
        return true
      }
      
      // 如果自动初始化失败，按原来的流程检查
      // 先加载本地凭据
      loadStoredCredentials()
      
      // 如果没有API凭据，直接返回false，不尝试初始化
      if (!hasStoredCredentials.value) {
        console.log('📝 没有保存的API凭据，跳过认证状态检查')
        return false
      }
      
      const isAuth = await telegramService.isAuthorized()
      if (isAuth) {
        const me = await telegramService.getMe()
        isLoggedIn.value = true
        userInfo.value = me
        return true
      }
    } catch (error) {
      console.error('❌ 检查认证状态失败:', error)
    }
    
    return false
  }

  // 使用存储的会话自动初始化
  async function autoInitializeWithStoredSession() {
    try {
      console.log('🔄 尝试自动初始化客户端')
      
      const success = await telegramService.initializeWithStoredSession()
      
      if (success) {
        // 自动初始化成功，获取用户信息并设置状态
        const me = await telegramService.getMe()
        isLoggedIn.value = true
        userInfo.value = me
        
        // 同步API凭据到store
        const storedApiId = localStorage.getItem('telegram_api_id')
        const storedApiHash = localStorage.getItem('telegram_api_hash')
        if (storedApiId && storedApiHash) {
          apiCredentials.value = {
            apiId: parseInt(storedApiId),
            apiHash: storedApiHash
          }
        }
        
        console.log('✅ 自动初始化成功，用户已登录:', me.firstName, me.lastName)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ 自动初始化失败:', error)
      return false
    }
  }

  // Token相关功能
  async function signInWithToken(sessionToken) {
    try {
      console.log('🔑 使用Token登录')
      
      // 检查是否已设置API凭据
      if (!hasStoredCredentials.value) {
        throw new Error('请先设置API凭据')
      }
      
      // 使用token初始化客户端并检查授权
      await telegramService.initializeWithToken(sessionToken)
      
      // 获取用户信息
      const me = await telegramService.getMe()
      isLoggedIn.value = true
      userInfo.value = me
      
      console.log('✅ Token登录成功:', me.firstName, me.lastName)
      return { success: true, user: me }
    } catch (error) {
      console.error('❌ Token登录失败:', error)
      throw error
    }
  }

  function getCurrentToken() {
    try {
      return telegramService.getCurrentSessionToken()
    } catch (error) {
      console.error('❌ 获取当前Token失败:', error)
      return null
    }
  }

  function saveToken(token) {
    try {
      localStorage.setItem('telegram_session', token)
      console.log('✅ Token已保存到本地存储')
    } catch (error) {
      console.error('❌ 保存Token失败:', error)
    }
  }

  function loadSavedToken() {
    try {
      return localStorage.getItem('telegram_session')
    } catch (error) {
      console.error('❌ 加载保存的Token失败:', error)
      return null
    }
  }

  function clearSavedToken() {
    try {
      localStorage.removeItem('telegram_session')
      console.log('✅ 已清除保存的Token')
    } catch (error) {
      console.error('❌ 清除Token失败:', error)
    }
  }

  return {
    // State
    isLoggedIn,
    userInfo,
    apiCredentials,
    // Getters
    isClientReady,
    userName,
    hasStoredCredentials,
    // Actions
    initializeClient,
    sendCode,
    signIn,
    signInWithPassword,
    logout,
    getDialogs,
    getChannelHistory,
    checkAuthStatus,
    autoInitializeWithStoredSession,
    // Storage actions
    loadStoredCredentials,
    saveCredentials,
    clearStoredCredentials,
    // Token actions
    signInWithToken,
    getCurrentToken,
    saveToken,
    loadSavedToken,
    clearSavedToken
  }
})
