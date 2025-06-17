import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [vue()],
  
  base: './', // 确保资源路径是相对的，适合 Electron

  // 构建配置
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext', // 使用现代浏览器特性，Electron支持
    minify: mode === 'production' ? 'esbuild' : false,
    sourcemap: mode === 'development',
    rollupOptions: {
      external: ['electron'],
      output: {
        // 确保文件名在Windows下兼容
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = path.extname(assetInfo.name)
          if (ext === '.css') {
            return 'assets/[name]-[hash][extname]'
          }
          // 图片和其他静态资源
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // 优化打包体积
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096 // 小于4kb的文件内联为base64
  },

  // 开发服务器配置
  server: {
    port: 5173,
    strictPort: false, // 如果端口被占用，自动尝试下一个
    host: 'localhost',
    cors: true, // 允许跨域，对 Telegram API 很重要
    fs: {
      // 允许访问项目根目录之外的文件
      allow: ['..']
    }
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    strictPort: false,
    host: 'localhost'
  },

  // 解析配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // 针对 Electron 的特殊配置
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.platform': JSON.stringify(process.platform),
    global: 'globalThis'
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        charset: false
      }
    },
    postcss: {
      plugins: []
    }
  },

  // 优化依赖
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'vuetify',
      'vue-i18n'
    ],
    exclude: ['electron']
  },

  // ESBuild配置
  esbuild: {
    target: 'esnext',
    platform: 'neutral'
  }
}));
