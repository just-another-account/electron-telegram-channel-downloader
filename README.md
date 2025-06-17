# 📥 Telegram Channel Downloader

<div align="center">

![Logo](build/icon.png)

**A powerful cross-platform Telegram channel content downloader built with Electron and Vue 3**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-28+-blue.svg)](https://electronjs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3+-green.svg)](https://vuejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20|%20macOS%20|%20Linux-lightgrey.svg)]()

📞 **Contact Developer**: [@oooooh_hooooo](https://t.me/oooooh_hooooo) | 💬 **Join Group**: [Telegram Channel Downloader Chat](https://t.me/channel_downloader_chat)

[English](README.md) • [简体中文](docs/README.zh-CN.md) 

</div>

## ✨ Features

- 🔐 **Secure Authentication**: Official Telegram API login with phone verification
- 🌍 **Multi-language Support**: 8 languages (EN, 简中, 繁中, 日本語, 한국어, Français, Deutsch, Español)
- 📱 **2FA Support**: Two-factor authentication with password protection
- 📋 **Channel Management**: Browse and select from all accessible channels/groups
- 📥 **Bulk Download**: Download media files and messages in batch
- 🎯 **Content Filtering**: Filter by media type (images, videos, documents, others)
- 📊 **Real-time Progress**: Live download progress with detailed statistics
- 💾 **Data Export**: Export message data as structured JSON files
- 🎨 **Modern UI**: Material Design 3 with responsive layout
- 🌙 **Theme Support**: Light and dark theme modes
- 📱 **Cross-platform**: Works on Windows, macOS, and Linux
- 🔄 **Resume Downloads**: Continue interrupted downloads
- 📈 **Download History**: Track download sessions and statistics

## 🖼️ Screenshots

<div align="center">

### 登录界面 | Login Interface
<img src="screenshots/1.login.png" alt="Login Interface - Enter Telegram API credentials" width="80%" />

### 主界面 | Main Interface  
<img src="screenshots/2.main.png" alt="Main Interface - Channel selection and configuration" width="80%" />

### 下载配置 | Download Configuration
<img src="screenshots/3.download.png" alt="Download Configuration - Select content types and settings" width="80%" />

### 下载进度 | Download Progress
<img src="screenshots/4.downloading.png" alt="Download Progress - Real-time progress tracking" width="80%" />

</div>

## 🛠️ Tech Stack

- **Framework**: Electron 28+
- **Frontend**: Vue 3 + Composition API + TypeScript
- **UI Library**: Vuetify 3 + Material Design 3
- **State Management**: Pinia
- **Build Tool**: Vite 6
- **Package Manager**: pnpm (recommended)
- **Telegram API**: telegram.js (Web version)
- **Internationalization**: Vue I18n

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Telegram API credentials (see [Getting API Credentials](#-getting-telegram-api-credentials))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/telegram-channel-downloader.git
cd telegram-channel-downloader

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
# Build and package for current platform
pnpm build

# Build for specific platforms
pnpm build:win    # Windows
pnpm build:mac    # macOS
pnpm build:linux  # Linux
```

## 🔑 Getting Telegram API Credentials

1. Visit [my.telegram.org](https://my.telegram.org)
2. Log in with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy your `API ID` and `API Hash`

**Important**: Keep your API credentials secure and never share them publicly.

## 📚 Documentation

- [📖 User Guide](docs/USER_GUIDE.md) - Detailed usage instructions
- [🔧 Developer Guide](docs/DEVELOPER_GUIDE.md) - Setup and development
- [🌍 Internationalization](docs/I18N.md) - Multi-language support
- [❓ FAQ](docs/FAQ.md) - Frequently asked questions
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [🔄 Migration Guide](docs/MIGRATION.md) - Tauri to Electron migration
- [📋 Changelog](CHANGELOG.md) - Version history

## 🏗️ Project Structure

```
telegram-channel-downloader/
├── electron/                 # Electron main process
│   ├── main.js              # Main process entry
│   └── preload.js           # Preload script
├── src/                     # Vue application source
│   ├── components/          # Vue components
│   │   ├── DownloadManager.vue
│   │   ├── TelegramLogin.vue
│   │   └── LanguageSelector.vue
│   ├── services/           # Business logic services
│   │   ├── telegramService.js
│   │   └── downloadService.js
│   ├── stores/             # Pinia state management
│   ├── i18n/               # Internationalization
│   │   ├── index.js
│   │   └── locales/        # Language files
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── docs/                   # Documentation
├── build/                  # Build resources (icons, etc.)
├── dist/                   # Build output
└── public/                 # Static assets
```

## 🎯 Usage

### 1. Initial Setup
- Launch the application
- Enter your Telegram API credentials
- Complete phone verification and 2FA if enabled

### 2. Channel Selection
- Browse available channels in the left sidebar
- Click on a channel to select it
- View channel information and download history

### 3. Download Configuration
- Choose content types to download (images, videos, documents, others)
- Set message ID range (optional)
- Select download destination folder

### 4. Download Process
- Click "Start Download" to begin
- Monitor real-time progress and statistics
- Files are organized in folders by type

## 🔧 Configuration

The application stores configuration in:
- **Windows**: `%APPDATA%/telegram-channel-downloader/`
- **macOS**: `~/Library/Application Support/telegram-channel-downloader/`
- **Linux**: `~/.config/telegram-channel-downloader/`

Stored data includes:
- API credentials (encrypted)
- Session tokens
- User preferences
- Download history

## 🛡️ Security & Privacy

- API credentials are stored securely using OS-level encryption
- Session tokens are encrypted and stored locally
- No data is sent to external servers except Telegram's official API
- All downloads happen directly from Telegram to your device

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Telegram](https://telegram.org/) for the amazing platform
- [Vue.js](https://vuejs.org/) and [Electron](https://electronjs.org/) communities
- [Vuetify](https://vuetifyjs.com/) for the beautiful UI components
- All contributors and users who help improve this project

## 📞 Support

- 💬 **Developer**: [@oooooh_hooooo](https://t.me/oooooh_hooooo)
- 👥 **Group Chat**: [Telegram Channel Downloader Chat](https://t.me/channel_downloader_chat)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/yourusername/telegram-channel-downloader/discussions)
- 📧 **Email**: support@telegram-downloader.example.com

---

<div align="center">
Made with ❤️ by <a href="https://t.me/oooooh_hooooo">@oooooh_hooooo</a>
</div>
