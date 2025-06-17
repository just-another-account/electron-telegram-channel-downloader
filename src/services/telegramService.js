// 从全局对象中获取 telegram
const { TelegramClient } = window.telegram || {}
const { StringSession } = window.telegram?.sessions || {}

console.log(111, StringSession)

import { TELEGRAM_CONFIG, validateConfig, loadApiCredentials } from '../config/telegram.js'

class TelegramService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.sessionString = localStorage.getItem('telegram_session') || ''
    this.phoneCodeHash = null
    this.currentPhoneNumber = null
  }

  /**
   * 初始化 Telegram 客户端
   */
  async initialize() {
    try {
      validateConfig()
      
      // 从本地存储读取会话
      this.sessionString = localStorage.getItem('telegram_session') || ''
      console.log('🔑 Session 字符串长度:', this.sessionString.length)
      
      const session = new StringSession(this.sessionString)
      
      // 检测是否在 Electron 环境中
      const isElectron = window.__ELECTRON__ !== undefined
      
      // 为 Electron 环境配置连接选项
      const connectionOptions = {
        connectionRetries: TELEGRAM_CONFIG.connectionRetries,
        timeout: TELEGRAM_CONFIG.timeout,
      }
      
      // Electron 环境支持 WebSocket，无需强制 TCP
      if (isElectron) {
        console.log('🔧 检测到 Electron 环境，使用原生 WebSocket 连接')
        // Electron 环境下 WebSocket 工作正常
        connectionOptions.useWSS = true
        connectionOptions.testServers = false
      } else {
        console.log('🌐 检测到浏览器环境')
        // 浏览器环境也支持 WebSocket
        connectionOptions.useWSS = true
      }
      
      this.client = new TelegramClient(
        session,
        TELEGRAM_CONFIG.apiId,
        TELEGRAM_CONFIG.apiHash,
        connectionOptions
      )

      console.log('✅ Telegram 客户端已初始化')
      return true
    } catch (error) {
      console.error('❌ 初始化 Telegram 客户端失败:', error)
      throw error
    }
  }

  /**
   * 检查是否已授权
   */
  async isAuthorized() {
    // 如果客户端未初始化，不尝试自动初始化，直接返回false
    if (!this.client) {
      console.log('📝 客户端未初始化，无法检查授权状态')
      return false
    }
    
    try {
      console.log('🔌 尝试连接到 Telegram...')
      await this.client.connect()
      
      console.log('🔍 检查用户授权状态...')
      const isAuth = await this.client.isUserAuthorized()
      console.log('✅ 授权状态检查完成:', isAuth)
      
      if (isAuth) {
        this.isConnected = true
      }
      
      return isAuth
    } catch (error) {
      console.error('❌ 检查授权状态失败:', error)
      return false
    }
  }

  /**
   * 发送验证码
   */
  async sendCode(phoneNumber) {
    if (!this.client) {
      await this.initialize()
    }

    try {
      await this.client.connect()
      
      // sendCode 方法需要 apiCredentials 和 phoneNumber
      const result = await this.client.sendCode(
        {
          apiId: TELEGRAM_CONFIG.apiId,
          apiHash: TELEGRAM_CONFIG.apiHash
        },
        phoneNumber
      )

      // 保存验证码hash和手机号，供后续登录使用
      this.phoneCodeHash = result.phoneCodeHash
      this.currentPhoneNumber = phoneNumber

      console.log('📱 验证码已发送到:', phoneNumber)
      return result
    } catch (error) {
      console.error('❌ 发送验证码失败:', error)
      throw error
    }
  }

  /**
   * 使用验证码登录
   */
  async signInWithCode(phoneNumber, phoneCode) {
    if (!this.client) {
      await this.initialize()
    }

    try {
      console.log('🔐 开始验证码登录，手机号:', phoneNumber, '验证码:', phoneCode)
      
      // 使用 GramJS 内置的 signInUser 方法
      const result = await this.client.signInUser(
        {
          apiId: TELEGRAM_CONFIG.apiId,
          apiHash: TELEGRAM_CONFIG.apiHash
        },
        {
          phoneNumber: () => Promise.resolve(phoneNumber || this.currentPhoneNumber),
          phoneCode: () => Promise.resolve(phoneCode),
          password: () => {
            // 如果需要密码，抛出特定错误让上层处理
            const passwordError = new Error('SESSION_PASSWORD_NEEDED')
            passwordError.code = 'SESSION_PASSWORD_NEEDED'
            throw passwordError
          },
          onError: (err) => {
            console.error('❌ 登录验证码错误:', err)
            // 检查是否是两步验证错误
            if (err.message && (
              err.message.includes('SESSION_PASSWORD_NEEDED') ||
              err.message.includes('2FA enabled') ||
              err.message.includes('password')
            )) {
              // 抛出特定的两步验证错误
              const passwordError = new Error('SESSION_PASSWORD_NEEDED')
              passwordError.code = 'SESSION_PASSWORD_NEEDED'
              throw passwordError
            }
            throw err
          }
        }
      )

      // 登录成功，保存会话
      const sessionString = this.client.session.save()
      localStorage.setItem('telegram_session', sessionString)
      this.sessionString = sessionString
      this.isConnected = true

      console.log('✅ 验证码登录成功')
      return result

    } catch (error) {
      console.error('❌ 验证码登录失败:', error)
      
      // 检查是否是两步验证错误
      if (error.code === 'SESSION_PASSWORD_NEEDED' || 
          error.message?.includes('SESSION_PASSWORD_NEEDED')) {
        
        console.log('🔒 检测到需要两步验证')
        throw error
      }
      
      throw error
    }
  }

  /**
   * 使用密码登录（如果账号设置了两步验证）
   */
  async signInWithPassword(password) {
    if (!this.client) {
      await this.initialize()
    }

    try {
      console.log('🔐 开始两步验证密码登录')
      
      // 使用 GramJS 内置的 signInWithPassword 方法
      const result = await this.client.signInWithPassword(
        {
          apiId: TELEGRAM_CONFIG.apiId,
          apiHash: TELEGRAM_CONFIG.apiHash
        },
        {
          password: () => Promise.resolve(password),
          onError: (err) => {
            console.error('❌ 密码验证错误:', err)
            throw err
          }
        }
      )

      // 密码验证成功，保存会话
      const sessionString = this.client.session.save()
      localStorage.setItem('telegram_session', sessionString)
      this.sessionString = sessionString
      this.isConnected = true

      console.log('✅ 两步验证密码验证成功')
      return result

    } catch (error) {
      console.error('❌ 密码验证失败:', error)
      throw error
    }
  }

  /**
   * 获取当前用户信息
   */
  async getMe() {
    if (!this.client) {
      await this.initialize()
    }

    try {
      // 确保客户端已连接
      if (!this.isConnected) {
        await this.client.connect()
        this.isConnected = true
      }
      
      console.log('👤 获取用户信息...')
      const me = await this.client.getMe()
      console.log('✅ 用户信息获取成功:', me.firstName, me.lastName)
      return me
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error)
      throw error
    }
  }

  /**
   * 获取对话列表
   */
  async getDialogs(limit = 100) {
    if (!this.client) {
      await this.initialize()
    }

    try {
      // 确保客户端已连接
      if (!this.isConnected) {
        console.log('🔌 客户端未连接，正在连接...')
        await this.client.connect()
        this.isConnected = true
      }
      
      console.log('💬 获取对话列表，限制数量:', limit)
      const dialogs = await this.client.getDialogs({ limit })
      console.log(`✅ 成功获取 ${dialogs.length} 个对话`)
      return dialogs
    } catch (error) {
      console.error('❌ 获取对话列表失败:', error)
      throw error
    }
  }

  /**
   * 获取消息历史
   */
  async getMessages(entity, limit = 50) {
    if (!this.client || !this.isConnected) {
      throw new Error('客户端未连接')
    }

    try {
      console.log('📨 从 Telegram 获取消息，entity:', entity.className, 'ID:', entity.id, '限制:', limit)
      const messages = await this.client.getMessages(entity, { limit })
      console.log(`✅ 成功从 Telegram 获取 ${messages.length} 条消息`)
      return messages
    } catch (error) {
      console.error('❌ 获取消息失败:', error)
      throw error
    }
  }

  /**
   * 连接客户端
   */
  async connect() {
    if (!this.client) {
      await this.initialize()
    }

    try {
      await this.client.connect()
      this.isConnected = true
      console.log('✅ 已连接到 Telegram')
      return true
    } catch (error) {
      console.error('❌ 连接失败:', error)
      throw error
    }
  }

  /**
   * 断开连接
   */
  async disconnect() {
    if (this.client) {
      await this.client.disconnect()
      this.isConnected = false
      console.log('🔌 已断开连接')
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      if (this.client && this.isConnected) {
        // 使用正确的 GramJS API 调用
        const { Api } = window.telegram || {}
        if (Api) {
          await this.client.invoke(new Api.auth.LogOut({}))
        }
      }
      
      // 只清除会话，保留 API 凭据
      localStorage.removeItem('telegram_session')
      localStorage.removeItem('telegram_session_token')
      this.sessionString = ''
      this.isConnected = false
      this.phoneCodeHash = null
      this.currentPhoneNumber = null
      
      console.log('✅ 已登出')
    } catch (error) {
      console.error('❌ 登出失败:', error)
      
      // 即使登出 API 调用失败，仍然清除本地数据
      localStorage.removeItem('telegram_session')
      localStorage.removeItem('telegram_session_token')
      this.sessionString = ''
      this.isConnected = false
      this.phoneCodeHash = null
      this.currentPhoneNumber = null
      
      console.log('✅ 已清除本地会话数据')
    }
  }

  /**
   * 使用Token初始化客户端并检查授权
   */
  async initializeWithToken(sessionToken) {
    try {
      console.log('🔑 使用Token初始化客户端')

      
      
      // 使用提供的token创建session
      const session = new StringSession(sessionToken)
      
      // Token登录需要使用已设置的API凭据
      loadApiCredentials()
      validateConfig()
      
      // 检测是否在 Electron 环境中
      const isElectron = window.__ELECTRON__ !== undefined
      
      // 为 Electron 环境配置连接选项
      const connectionOptions = {
        connectionRetries: TELEGRAM_CONFIG.connectionRetries,
        timeout: TELEGRAM_CONFIG.timeout,
      }
      
      // Electron 环境支持 WebSocket，无需强制 TCP
      if (isElectron) {
        console.log('🔧 检测到 Electron 环境，使用原生 WebSocket 连接')
        // Electron 环境下 WebSocket 工作正常
        connectionOptions.useWSS = true
        connectionOptions.testServers = false
      } else {
        console.log('🌐 检测到浏览器环境')
        // 浏览器环境也支持 WebSocket
        connectionOptions.useWSS = true
      }
      
      this.client = new TelegramClient(
        session,
        TELEGRAM_CONFIG.apiId,
        TELEGRAM_CONFIG.apiHash,
        connectionOptions
      )

      // 连接客户端
      await this.client.connect()
      
      // 检查授权状态
      const isAuth = await this.client.isUserAuthorized()
      
      if (!isAuth) {
        throw new Error('提供的Token无效或已过期')
      }

      // 保存会话信息
      this.sessionString = sessionToken
      localStorage.setItem('telegram_session', sessionToken)
      localStorage.setItem('telegram_session_token', sessionToken)
      this.isConnected = true

      console.log('✅ Token验证成功，客户端已就绪')
      return true
    } catch (error) {
      console.error('❌ Token初始化失败:', error)
      throw error
    }
  }

  /**
   * 使用存储的会话自动初始化客户端
   * 如果localStorage中存在API凭据和session，直接初始化
   */
  async initializeWithStoredSession() {
    try {
      console.log('🔄 尝试使用存储的会话自动初始化')
      
      // 检查是否有存储的API凭据
      const storedApiId = localStorage.getItem('telegram_api_id')
      const storedApiHash = localStorage.getItem('telegram_api_hash')
      const storedSession = localStorage.getItem('telegram_session')
      
      if (!storedApiId || !storedApiHash || !storedSession) {
        console.log('📝 缺少必要的存储凭据，无法自动初始化')
        return false
      }
      
      console.log('✅ 发现完整的存储凭据，开始自动初始化')

      console.log(111, StringSession)
      
      // 设置API凭据
      TELEGRAM_CONFIG.apiId = parseInt(storedApiId)
      TELEGRAM_CONFIG.apiHash = storedApiHash
      
      // 使用存储的session创建客户端
      const session = new StringSession(storedSession)
      
      // 检测是否在 Electron 环境中
      const isElectron = window.__ELECTRON__ !== undefined
      
      // 为 Electron 环境配置连接选项
      const connectionOptions = {
        connectionRetries: TELEGRAM_CONFIG.connectionRetries,
        timeout: TELEGRAM_CONFIG.timeout,
      }
      
      // Electron 环境支持 WebSocket，无需强制 TCP
      if (isElectron) {
        console.log('🔧 检测到 Electron 环境，使用原生 WebSocket 连接')
        // Electron 环境下 WebSocket 工作正常
        connectionOptions.useWSS = true
        connectionOptions.testServers = false
      } else {
        console.log('🌐 检测到浏览器环境')
        // 浏览器环境也支持 WebSocket
        connectionOptions.useWSS = true
      }
      
      this.client = new TelegramClient(
        session,
        TELEGRAM_CONFIG.apiId,
        TELEGRAM_CONFIG.apiHash,
        connectionOptions
      )

      // 使用start()方法自动处理连接和授权检查
      // 如果session有效，start()会自动连接并验证授权状态
      await this.client.start({
        // 提供空的回调函数，因为我们使用的是已有的session
        phoneNumber: async () => '',
        password: async () => '',
        phoneCode: async () => '',
        onError: (err) => {
          console.log('自动初始化过程中的错误:', err)
          throw err
        },
      })
      
      // 如果start()成功完成，说明session有效且已授权
      // 保存状态
      this.sessionString = storedSession
      this.isConnected = true

      console.log('✅ 自动初始化成功，客户端已就绪')
      return true
    } catch (error) {
      console.error('❌ 自动初始化失败:', error)
      return false
    }
  }

  /**
   * 获取当前会话Token
   */
  getCurrentSessionToken() {
    if (!this.client || !this.client.session) {
      return null
    }
    
    try {
      const sessionString = this.client.session.save()
      return sessionString
    } catch (error) {
      console.error('❌ 获取当前Token失败:', error)
      return null
    }
  }
}

// 创建单例实例
const telegramService = new TelegramService()

export default telegramService
