# 版本更新日志

## [v1.2.0] - 2024-01-XX

### 🚀 重大新功能
- **多线程下载系统**: 全新的多线程下载架构，大幅提升下载效率
  - 支持最多5个文件并发下载
  - 智能文件分块下载（大于2MB文件自动分为最多4块）
  - 实时下载速度监控和进度显示
  - 自动重试机制（最多3次重试）

### ✨ 功能增强
- **下载设置面板**: 新增下载配置选项
  - 可选择启用/禁用多线程下载
  - 用户友好的设置界面
  - 实时设置切换，无需重启

- **增强的进度监控**: 全新的多层级进度显示
  - 总体下载进度
  - 单文件详细进度
  - 多线程状态面板（并发数、队列长度、总速度）
  - 文件下载速度和大小格式化显示

### 🎨 界面改进
- **多线程状态面板**: 实时显示下载状态
  - 并发下载数量
  - 队列等待数量
  - 总下载速度
  - 已下载数据量
- **优化的进度对话框**: 更清晰的进度信息展示
- **响应式设计**: 适配不同屏幕尺寸的多线程状态显示

### 🔧 技术改进
- **新增 MultiThreadDownloadManager**: 专门的多线程下载管理器
  - 智能队列管理
  - 并发控制和资源管理
  - 分块下载和自动合并
  - 进度回调系统

- **增强的 DownloadService**: 集成多线程下载支持
  - 多线程/单线程模式切换
  - 统一的进度处理接口
  - 改进的错误处理机制

### 📚 文档更新
- **多线程下载说明文档**: 详细的功能说明和使用指南
- **测试文件**: 提供功能验证和调试工具
- **技术文档**: 完整的实现原理和配置说明

### 🛠️ 性能优化
- **内存管理**: 优化大文件处理，避免内存溢出
- **网络优化**: 智能重试策略和请求间隔控制
- **并发控制**: 防止系统资源过载的保护机制

### 🐛 修复问题
- 优化文件下载的错误处理
- 改进下载进度计算准确性
- 修复大文件下载时的内存问题

### 💡 用户体验提升
- 默认启用多线程下载以获得最佳性能
- 直观的下载状态指示器
- 实时的下载速度和剩余时间显示
- 简化的设置界面

### 🔄 兼容性
- 向后兼容原有的单线程下载模式
- 支持现有的下载配置和过滤设置
- 兼容所有文件类型和媒体组下载

---

## [v1.1.8] - 2024-01-XX
- 之前的版本更新...

## [Unreleased]

### Added
- Resume download functionality for interrupted downloads
- Download speed optimization and better error handling
- Enhanced progress reporting with ETA calculations

### Changed
- Improved UI responsiveness on high-DPI displays
- Better error messages for common issues

### Fixed
- Memory leak during large downloads
- Progress dialog freezing on certain file types

## [1.1.4] - 2025-06-20

### Added
- 📏 **File Size Filter**: Added minimum and maximum file size filtering options
  - Set minimum file size to download only files larger than specified value (KB)
  - Set maximum file size to download only files smaller than specified value (KB)
  - Set both to download files within a specific size range
  - Works in combination with existing filename filters
- 🌍 **Complete Internationalization**: Added file size filter translations for all 8 supported languages
  - 简体中文 (Simplified Chinese)
  - 繁體中文 (Traditional Chinese)
  - English
  - 日本語 (Japanese)
  - 한국어 (Korean)
  - Français (French)
  - Deutsch (German)
  - Español (Spanish)

### Changed
- 🔧 **Enhanced Filter Logic**: Improved `shouldDownloadFile` function to support both filename and file size filtering simultaneously
- 💻 **Better UI Layout**: Added responsive file size input fields with clear labeling and help text

## [1.0.0] - 2024-01-15

### Added
- 🎉 **Initial Release**: Full-featured Telegram channel downloader
- 🔐 **Secure Authentication**: Telegram API login with 2FA support
- 🌍 **Multi-language Support**: 8 languages (EN, 简中, 繁中, 日本語, 한국어, Français, Deutsch, Español)
- 📥 **Bulk Download**: Download images, videos, documents, and other media
- 📊 **Real-time Progress**: Live download progress with detailed statistics
- 💾 **Data Export**: Export message data as structured JSON files
- 🎨 **Modern UI**: Material Design 3 with Vuetify components
- 🌙 **Theme Support**: Light and dark theme modes
- 📱 **Cross-platform**: Support for Windows, macOS, and Linux
- 🔄 **Resume Downloads**: Continue interrupted downloads automatically
- 📁 **Smart Organization**: Automatic file organization by type
- 📈 **Download History**: Track download sessions and statistics

### Features
- **Authentication**
  - Telegram API credential management
  - Phone number verification
  - Two-factor authentication (2FA) support
  - Secure session storage with encryption
  
- **Channel Management**
  - Browse all accessible channels, groups, and private chats
  - Channel type identification (Channel/Group/Private)
  - Search and filter channel list
  - Channel information display

- **Download Configuration**
  - Select content types (Images, Videos, Documents, Others)
  - Message ID range selection for targeted downloads
  - Custom download path selection
  - File type filtering and organization

- **Download Process**
  - Batch downloading with progress tracking
  - Real-time speed and ETA calculations
  - Error handling and retry mechanisms
  - Duplicate file detection and skipping
  - Download pause/resume functionality

- **File Organization**
  - Automatic folder structure creation
  - File naming with timestamps and message IDs
  - JSON export of message metadata
  - Download history and statistics

- **User Interface**
  - Responsive design for all screen sizes
  - Material Design 3 components
  - Dark and light theme support
  - Internationalization with 8 languages
  - Real-time language switching

- **Platform Support**
  - Windows 10+ with NSIS installer
  - macOS 10.13+ with DMG package
  - Linux with AppImage and distribution packages

### Technical Implementation
- **Frontend**: Vue 3 + Composition API + TypeScript
- **UI Framework**: Vuetify 3 + Material Design 3
- **State Management**: Pinia with persistent storage
- **Desktop Framework**: Electron 28+ with modern security
- **Build System**: Vite 6 with optimized bundling
- **Internationalization**: Vue I18n with automatic language detection
- **API Integration**: telegram.js for official Telegram API access

### Security & Privacy
- Local-only data storage with OS-level encryption
- No external server dependencies (except Telegram API)
- Secure API credential management
- Session token encryption and protection
- Open-source codebase for transparency

## [0.9.0-beta] - 2024-01-01

### Added
- Beta release for testing
- Core download functionality
- Basic authentication system
- Initial UI implementation

### Known Issues
- Some translation keys missing
- Performance issues with large channels
- Limited error handling

## [0.5.0-alpha] - 2023-12-15

### Added
- Alpha release with basic functionality
- Telegram API integration
- Simple download interface
- Basic file organization

### Changed
- Migrated from Tauri to Electron for better compatibility

### Technical Notes
- Initial project setup
- Development environment configuration
- Basic CI/CD pipeline

---

## Migration from Tauri

### Why We Migrated to Electron

This project was originally built with Tauri but was migrated to Electron for the following reasons:

1. **WebSocket Compatibility**: Resolved compatibility issues between Tauri and Telegram's WebSocket connections
2. **Cross-platform Support**: Better consistent behavior across Windows, macOS, and Linux
3. **Development Experience**: Simplified development and debugging process
4. **Community Ecosystem**: Larger ecosystem and better third-party library support
5. **File System Access**: More reliable file system operations for downloads

### Migration Benefits

- ✅ **Improved Stability**: Fewer crashes and connection issues
- ✅ **Better Performance**: Faster downloads and UI responsiveness
- ✅ **Enhanced Compatibility**: Works on more systems and configurations
- ✅ **Easier Maintenance**: Simplified codebase and debugging
- ✅ **Feature Completeness**: All planned features now possible

### Data Migration

User data from Tauri version is automatically migrated:
- API credentials and session tokens
- Download history and preferences
- Language settings and UI preferences

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- How to report bugs
- How to suggest enhancements
- How to submit pull requests
- Code style guidelines

## Support

- 📧 **Email**: support@telegram-downloader.example.com
- 💬 **Discord**: [Join our community](https://discord.gg/telegram-downloader)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/yourusername/telegram-channel-downloader/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 