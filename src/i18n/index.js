import { createI18n } from 'vue-i18n'

// 导入语言包
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import es from './locales/es.json'

// 获取浏览器语言
function getBrowserLocale() {
  const navigatorLocale = navigator.language || navigator.userLanguage
  
  if (navigatorLocale.startsWith('zh')) {
    return navigatorLocale.includes('TW') || navigatorLocale.includes('HK') || navigatorLocale.includes('Hant') 
      ? 'zh-TW' 
      : 'zh-CN'
  }
  
  const locale = navigatorLocale.substring(0, 2)
  const supportedLocales = ['en', 'ja', 'ko', 'fr', 'de', 'es']
  
  return supportedLocales.includes(locale) ? locale : 'zh-CN'
}

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
  'ja': ja,
  'ko': ko,
  'fr': fr,
  'de': de,
  'es': es
}

// 从localStorage获取保存的语言设置，如果没有则使用浏览器语言
const savedLocale = localStorage.getItem('app-locale')
const defaultLocale = savedLocale || getBrowserLocale()

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true
})

export default i18n

// 切换语言的工具函数
export function switchLanguage(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('app-locale', locale)
  document.documentElement.setAttribute('lang', locale)
}

// 获取当前语言
export function getCurrentLanguage() {
  return i18n.global.locale.value
}

// 获取支持的语言列表
export function getSupportedLanguages() {
  return [
    { code: 'zh-CN', name: '简体中文', native: '简体中文' },
    { code: 'zh-TW', name: '繁體中文', native: '繁體中文' },
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ja', name: '日本語', native: '日本語' },
    { code: 'ko', name: '한국어', native: '한국어' },
    { code: 'fr', name: 'Français', native: 'Français' },
    { code: 'de', name: 'Deutsch', native: 'Deutsch' },
    { code: 'es', name: 'Español', native: 'Español' }
  ]
} 