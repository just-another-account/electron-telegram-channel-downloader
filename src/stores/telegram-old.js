import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 本地存储键名
const STORAGE_KEYS = {
  API_ID: 'telegram_api_id',
  API_HASH: 'telegram_api_hash',
  SESSION: 'telegram_session'
}

export const useTelegramStore = defineStore('telegram', () => {
  // State
  const client = ref(null)
  const isLoggedIn = ref(false)
  const userInfo = ref(null)
  const apiCredentials = ref({
    apiId: null,
    apiHash: null
  })

  // 从本地存储加载API凭据
  function loadStoredCredentials() {
    try {
      const storedApiId = localStorage.getItem(STORAGE_KEYS.API_ID)
      const storedApiHash = localStorage.getItem(STORAGE_KEYS.API_HASH)
      
      if (storedApiId && storedApiHash) {
        apiCredentials.value = {
          apiId: parseInt(storedApiId),
          apiHash: storedApiHash
        }
        console.log('已从本地存储加载API凭据')
        return true
      }
    } catch (error) {
      console.error('加载本地存储的API凭据失败:', error)
    }
    return false
  }

  // 保存API凭据到本地存储
  function saveCredentials(apiId, apiHash) {
    try {
      localStorage.setItem(STORAGE_KEYS.API_ID, apiId.toString())
      localStorage.setItem(STORAGE_KEYS.API_HASH, apiHash)
      console.log('API凭据已保存到本地存储')
    } catch (error) {
      console.error('保存API凭据到本地存储失败:', error)
    }
  }

  // 清除本地存储的凭据
  function clearStoredCredentials() {
    try {
      localStorage.removeItem(STORAGE_KEYS.API_ID)
      localStorage.removeItem(STORAGE_KEYS.API_HASH)
      localStorage.removeItem(STORAGE_KEYS.SESSION)
      console.log('已清除本地存储的凭据')
    } catch (error) {
      console.error('清除本地存储凭据失败:', error)
    }
  }

  // Getters
  const isClientReady = computed(() => !!client.value)
  const userName = computed(() => userInfo.value?.firstName || 'Unknown User')
  const hasStoredCredentials = computed(() => {
    return !!(apiCredentials.value.apiId && apiCredentials.value.apiHash)
  })

  // Actions
  async function initializeClient(apiId, apiHash) {
    try {
      // 使用全局的 telegram 对象 (从 telegram.js 加载)
      if (!window.telegram) {
        throw new Error('Telegram 库未加载')
      }

      // 存储 API 凭据
      apiCredentials.value = { apiId: parseInt(apiId), apiHash }
      
      // 保存到本地存储
      saveCredentials(apiId, apiHash)
      
      // 创建客户端实例 (根据实际的 gramjs API 调整)
      const { TelegramClient } = window.telegram || {}
      const { StringSession } = window.telegram?.sessions || {}
      
      client.value = new TelegramClient(
        new StringSession(''), // 空的 session string，首次登录
        apiCredentials.value.apiId,
        apiCredentials.value.apiHash,
        {
          connectionRetries: 5,
        }
      )

      // 连接客户端
      await client.value.connect()
      
      console.log('Telegram 客户端初始化成功')
      return true
    } catch (error) {
      console.error('初始化 Telegram 客户端失败:', error)
      throw error
    }
  }

  // 存储 sendCode 返回的信息
  const authInfo = ref({
    phoneCodeHash: null,
    phoneNumber: null
  })

  async function sendCode(phoneNumber) {
    if (!client.value) {
      throw new Error('客户端未初始化')
    }

    try {
      console.log('发送验证码到:', phoneNumber)
      
      // 使用正确的 GramJS API - 两参数调用
      const { phoneCodeHash, isCodeViaApp } = await client.value.sendCode({
        apiId: apiCredentials.value.apiId,
        apiHash: apiCredentials.value.apiHash,
      }, phoneNumber)

      // 保存认证信息供后续使用
      authInfo.value = {
        phoneCodeHash,
        phoneNumber
      }

      console.log('验证码发送成功', { phoneCodeHash, isCodeViaApp })
      return { phoneCodeHash, isCodeViaApp }
    } catch (error) {
      console.error('发送验证码失败:', error)
      throw error
    }
  }

  async function signIn(phoneNumber, code) {
    if (!client.value) {
      throw new Error('客户端未初始化')
    }

    try {
      console.log('开始验证登录，手机号:', phoneNumber, '验证码:', code)
      console.log('使用的 phoneCodeHash:', authInfo.value.phoneCodeHash)
      
      // 使用正确的 GramJS signIn API
      const result = await client.value.signIn({
        apiId: apiCredentials.value.apiId,
        apiHash: apiCredentials.value.apiHash,
      }, {
        phoneNumber: authInfo.value.phoneNumber || phoneNumber,
        phoneCode: code,
        phoneCodeHash: authInfo.value.phoneCodeHash
      })

      console.log('signIn 返回结果:', result)

      // 检查返回结果类型
      if (result && result._) {
        console.log('结果类型:', result._)
        
        if (result._ === 'auth.authorizationSignUpRequired') {
          throw new Error('需要注册新用户')
        } else if (result._ === 'auth.authorization') {
          // 登录成功
          isLoggedIn.value = true
          userInfo.value = result.user
          console.log('登录成功:', result.user)
          return { success: true, user: result.user }
        }
      }
      
      // 如果没有明确的成功标识，检查是否有用户信息
      if (result && result.user) {
        isLoggedIn.value = true
        userInfo.value = result.user
        console.log('登录成功 (通过用户信息判断):', result.user)
        return { success: true, user: result.user }
      }
      
      return result
    } catch (error) {
      console.error('登录失败详细错误:', error)
      
      // 检查是否是需要两步验证的错误
      if (error.message && (
        error.message.includes('SESSION_PASSWORD_NEEDED') ||
        error.message.includes('2FA') ||
        error.code === 401
      )) {
        console.log('需要两步验证密码')
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
    if (!client.value) {
      throw new Error('客户端未初始化')
    }

    try {
      console.log('开始两步验证')
      
      const result = await client.value.signInWithPassword({
        password: password,
      })

      console.log('两步验证返回结果:', result)

      if (result && result._) {
        if (result._ === 'auth.authorization') {
          isLoggedIn.value = true
          userInfo.value = result.user
          console.log('密码验证成功，登录完成:', result.user)
          return result
        }
      }
      
      // 如果没有明确的成功标识，检查是否有用户信息
      if (result && result.user) {
        isLoggedIn.value = true
        userInfo.value = result.user
        console.log('密码验证成功 (通过用户信息判断):', result.user)
        return result
      }
      
      throw new Error('密码验证失败')
    } catch (error) {
      console.error('密码验证失败:', error)
      throw error
    }
  }

  async function logout() {
    try {
      if (client.value) {
        await client.value.logOut()
        await client.value.disconnect()
      }
      
      // 重置状态
      client.value = null
      isLoggedIn.value = false
      userInfo.value = null
      // 注意：不清除 API 凭据，保留给下次使用
      // apiCredentials.value = { apiId: null, apiHash: null }
      
      console.log('退出登录成功')
    } catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  }

  async function getDialogs() {
    if (!client.value || !isLoggedIn.value) {
      throw new Error('未登录或客户端未准备就绪')
    }

    try {
      const dialogs = await client.value.getDialogs({
        limit: 100
      })
      
      return dialogs
    } catch (error) {
      console.error('获取对话列表失败:', error)
      throw error
    }
  }

  async function getChannelHistory(channelId, limit = 100) {
    if (!client.value || !isLoggedIn.value) {
      throw new Error('未登录或客户端未准备就绪')
    }

    try {
      const messages = await client.value.getMessages(channelId, {
        limit: limit
      })
      
      return messages
    } catch (error) {
      console.error('获取频道历史失败:', error)
      throw error
    }
  }

  // 检查登录状态
  async function checkAuthStatus() {
    if (!client.value) {
      return false
    }

    try {
      // 检查是否已连接
      if (!client.value.connected) {
        await client.value.connect()
      }
      
      const me = await client.value.getMe()
      if (me) {
        isLoggedIn.value = true
        userInfo.value = me
        return true
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
    }
    
    return false
  }

  return {
    // State
    client,
    isLoggedIn,
    userInfo,
    apiCredentials,
    authInfo,
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
    // Storage actions
    loadStoredCredentials,
    saveCredentials,
    clearStoredCredentials
  }
})
