// Vuetify configuration - 现代简约大气主题
export const vuetifyConfig = {
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          // 现代渐变蓝紫色系
          primary: '#667eea',
          'primary-darken-1': '#5a6fd8',
          'primary-lighten-1': '#7c8df0',
          secondary: '#764ba2',
          'secondary-darken-1': '#5d3c7b',
          'secondary-lighten-1': '#8b5fbf',
          accent: '#f093fb',
          error: '#ff6b6b',
          info: '#4ecdc4',
          success: '#45b7d1',
          warning: '#f7b731',
          // 现代背景色
          background: '#f8fafc',
          surface: '#ffffff',
          'surface-variant': '#f1f5f9',
          'on-surface': '#1e293b',
          'on-surface-variant': '#64748b',
          // 自定义渐变色
          'gradient-start': '#667eea',
          'gradient-end': '#764ba2',
          'telegram-blue': '#0088cc',
          'telegram-dark': '#0066aa'
        }
      },
      dark: {
        colors: {
          primary: '#7c8df0',
          'primary-darken-1': '#667eea',
          'primary-lighten-1': '#9ca5f4',
          secondary: '#8b5fbf',
          'secondary-darken-1': '#764ba2',
          'secondary-lighten-1': '#a06fd1',
          accent: '#f093fb',
          error: '#ff6b6b',
          info: '#4ecdc4',
          success: '#45b7d1',
          warning: '#f7b731',
          background: '#0f172a',
          surface: '#1e293b',
          'surface-variant': '#334155',
          'on-surface': '#f8fafc',
          'on-surface-variant': '#cbd5e1',
          'gradient-start': '#7c8df0',
          'gradient-end': '#8b5fbf',
          'telegram-blue': '#2196f3',
          'telegram-dark': '#1976d2'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi'
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  },
  defaults: {
    VCard: {
      elevation: 0,
      variant: 'elevated',
      rounded: 'lg'
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0
    },
    VAlert: {
      rounded: 'lg',
      elevation: 0
    },
    VTextField: {
      rounded: 'lg',
      variant: 'outlined',
      hideDetails: 'auto'
    },
    VSelect: {
      rounded: 'lg',
      variant: 'outlined',
      hideDetails: 'auto'
    }
  }
}

export default vuetifyConfig
