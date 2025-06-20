# 📋 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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