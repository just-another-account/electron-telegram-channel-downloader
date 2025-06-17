/**
 * Telegram 客户端配置
 */
export const TELEGRAM_CONFIG = {
  // 这些值将从用户输入或本地存储中获取
  apiId: null,
  apiHash: null,
  
  // 连接配置
  connectionRetries: 5,
  timeout: 30000, // 30秒超时
  
  // 会话存储键
  sessionStorageKey: 'telegram_session',
  apiIdStorageKey: 'telegram_api_id',
  apiHashStorageKey: 'telegram_api_hash'
}

/**
 * 设置 API 凭据
 */
export function setApiCredentials(apiId, apiHash) {
  TELEGRAM_CONFIG.apiId = parseInt(apiId)
  TELEGRAM_CONFIG.apiHash = apiHash
  
  // 保存到本地存储
  localStorage.setItem(TELEGRAM_CONFIG.apiIdStorageKey, apiId.toString())
  localStorage.setItem(TELEGRAM_CONFIG.apiHashStorageKey, apiHash)
}

/**
 * 从本地存储加载 API 凭据
 */
export function loadApiCredentials() {
  const apiId = localStorage.getItem(TELEGRAM_CONFIG.apiIdStorageKey)
  const apiHash = localStorage.getItem(TELEGRAM_CONFIG.apiHashStorageKey)
  
  if (apiId && apiHash) {
    TELEGRAM_CONFIG.apiId = parseInt(apiId)
    TELEGRAM_CONFIG.apiHash = apiHash
    return true
  }
  
  return false
}

/**
 * 验证配置是否完整
 */
export function validateConfig() {
  if (!TELEGRAM_CONFIG.apiId || !TELEGRAM_CONFIG.apiHash) {
    throw new Error('API 凭据未设置。请先调用 setApiCredentials() 设置 API ID 和 API Hash。')
  }
  
  if (!window.telegram) {
    throw new Error('Telegram 库未加载。请确保 telegram.js 已正确加载。')
  }
  
  return true
}

/**
 * 清除 API 凭据
 */
export function clearApiCredentials() {
  TELEGRAM_CONFIG.apiId = null
  TELEGRAM_CONFIG.apiHash = null
  
  localStorage.removeItem(TELEGRAM_CONFIG.apiIdStorageKey)
  localStorage.removeItem(TELEGRAM_CONFIG.apiHashStorageKey)
}
