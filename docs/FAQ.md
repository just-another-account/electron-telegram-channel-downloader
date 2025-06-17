# ❓ Frequently Asked Questions

## 📋 Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Authentication](#authentication)
4. [Download Issues](#download-issues)
5. [Features & Functionality](#features--functionality)
6. [Troubleshooting](#troubleshooting)
7. [Security & Privacy](#security--privacy)

## 🌟 General Questions

### What is Telegram Channel Downloader?

Telegram Channel Downloader is a cross-platform desktop application that allows you to download media files and messages from Telegram channels, groups, and private chats. It provides an easy-to-use interface for bulk downloading content with organization and progress tracking.

### Is this application free?

Yes, Telegram Channel Downloader is completely free and open-source under the MIT license. You can use, modify, and distribute it freely.

### What platforms are supported?

The application supports:
- **Windows** 10 and later
- **macOS** 10.13 (High Sierra) and later  
- **Linux** distributions (Ubuntu 18.04+, Fedora 32+, etc.)

### How is this different from downloading files manually?

Manual downloading is time-consuming and error-prone for large amounts of content. This application provides:
- **Bulk downloading** of hundreds or thousands of files
- **Automatic organization** into folders by file type
- **Progress tracking** and resume capability
- **Duplicate detection** to avoid re-downloading
- **Message data export** as structured JSON
- **Multi-language support** for global users

## 🛠️ Installation & Setup

### How do I install the application?

1. Download the latest release for your platform from [GitHub Releases](https://github.com/yourusername/telegram-channel-downloader/releases)
2. **Windows**: Run the `.exe` installer
3. **macOS**: Open the `.dmg` file and drag to Applications
4. **Linux**: Use the `.AppImage` file or install the `.deb`/`.rpm` package

### Do I need to install anything else?

No additional software is required. The application is self-contained and includes all necessary dependencies.

### Can I install it on multiple computers?

Yes, you can install and use the application on multiple computers. However, you'll need to authenticate with Telegram on each device separately.

### How do I update the application?

Currently, updates are manual:
1. Download the latest version from GitHub Releases
2. Install over the existing version
3. Your settings and download history will be preserved

*Automatic updates are planned for future versions.*

## 🔐 Authentication

### Where do I get Telegram API credentials?

1. Visit [my.telegram.org](https://my.telegram.org) (official Telegram website)
2. Log in with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy the API ID and API Hash

### Is it safe to enter my API credentials?

Yes, when obtained from the official Telegram website. The application:
- Stores credentials securely using OS-level encryption
- Never sends credentials to third-party servers
- Only communicates with official Telegram servers
- Is open-source, so you can verify the code

### Can I use the same API credentials on multiple devices?

Yes, the same API credentials can be used on multiple devices. Each device will have its own session, but they share the same API application.

### What if I forgot my 2FA password?

You'll need to recover it through Telegram's official process:
1. In the Telegram app, go to Settings > Privacy and Security > Two-Step Verification
2. Use the "Forgot Password?" option
3. Follow the recovery process via email or security questions

### Why do I need to verify my phone number again?

Telegram requires phone verification for each new session as a security measure. This is standard Telegram API behavior and not specific to this application.

## 📥 Download Issues

### Why are some files not downloading?

Several reasons can cause this:
- **File type not selected**: Ensure you've selected the correct content types
- **Permissions**: You might not have access to certain files
- **File size limits**: Some files might exceed Telegram's download limits
- **Network issues**: Check your internet connection
- **Storage space**: Ensure sufficient disk space

### Can I resume interrupted downloads?

Yes, the application automatically detects previously downloaded files and skips them. If a download is interrupted, simply start a new download session and it will continue from where it left off.

### How fast are downloads?

Download speed depends on:
- **Your internet connection** speed
- **Telegram server** performance and location
- **File sizes** being downloaded
- **API rate limits** imposed by Telegram

Typical speeds range from 1-10 MB/s depending on these factors.

### Why do downloads sometimes fail?

Common causes:
- **Network interruptions**: Temporary connectivity issues
- **Telegram rate limits**: Too many API calls in a short time
- **File availability**: The file may have been deleted from Telegram
- **Large file sizes**: Very large files may timeout

The application automatically retries failed downloads and logs errors for review.

### Can I download from private channels?

You can only download from channels, groups, or chats that you have access to. The application cannot bypass Telegram's privacy restrictions.

## ⚙️ Features & Functionality

### What file types can I download?

The application categorizes files into:
- **Images**: JPEG, PNG, WebP, GIF, TIFF, BMP, etc.
- **Videos**: MP4, AVI, MOV, MKV, WebM, etc.
- **Documents**: PDF, DOC, ZIP, TXT, etc.
- **Others**: Audio files, voice messages, etc.

All file types supported by Telegram can be downloaded.

### Can I select specific date ranges?

Currently, you can specify message ID ranges. To download content from specific dates:
1. Find the message IDs corresponding to your desired date range
2. In Telegram Web, right-click messages and copy links to see IDs
3. Enter the start and end message IDs in the application

*Date-based filtering is planned for future versions.*

### How are downloaded files organized?

Files are automatically organized in this structure:
```
[Download Path]/
└── [Channel ID]/
    ├── json/          # Message data
    ├── images/        # Image files
    ├── videos/        # Video files
    ├── documents/     # Document files
    └── others/        # Other media
```

### Can I customize the folder structure?

Currently, the folder structure is fixed for consistency. Custom organization options are planned for future releases.

### What languages are supported?

The application supports 8 languages:
- English
- 简体中文 (Simplified Chinese)
- 繁體中文 (Traditional Chinese)  
- 日本語 (Japanese)
- 한국어 (Korean)
- Français (French)
- Deutsch (German)
- Español (Spanish)

### How do I change the language?

Click the language selector dropdown in the top-right corner of the application and choose your preferred language. The setting is automatically saved.

## 🐛 Troubleshooting

### The application won't start

Try these solutions:
1. **Restart your computer** and try again
2. **Run as administrator** (Windows) or with elevated permissions
3. **Check antivirus software** - add the application to exclusions
4. **Reinstall the application** with the latest version
5. **Check system requirements** - ensure your OS version is supported

### Login keeps failing

Common solutions:
1. **Verify API credentials** are correct (no spaces, correct format)
2. **Check phone number format** includes country code (+1234567890)
3. **Try a different network** in case of regional restrictions
4. **Wait and retry** if you've made too many attempts
5. **Clear application data** and start fresh

### Downloads are very slow

To improve download speed:
1. **Check internet connection** speed and stability
2. **Close other bandwidth-heavy applications**
3. **Try downloading during off-peak hours**
4. **Select fewer file types** to reduce load
5. **Use a wired connection** instead of Wi-Fi if possible

### Interface appears corrupted or blank

Solutions:
1. **Try changing the language** and changing back
2. **Restart the application**
3. **Check display scaling** settings (Windows: 100-150% recommended)
4. **Update graphics drivers**
5. **Try running in compatibility mode** (Windows)

### Files are missing after download

Check these:
1. **Verify download path** is correct and accessible
2. **Check if files were skipped** due to existing copies
3. **Review error logs** in the download summary
4. **Ensure sufficient permissions** to write to the download folder
5. **Check antivirus quarantine** for blocked files

## 🔒 Security & Privacy

### Is my data safe?

Yes, the application prioritizes security:
- **Local storage only** - no data sent to external servers
- **Encrypted credentials** using OS-level security
- **Open source code** for transparency and verification
- **No telemetry** or tracking

### What data is stored locally?

The application stores:
- **API credentials** (encrypted)
- **Session tokens** (encrypted)
- **User preferences** (language, paths, etc.)
- **Download history** (for resume functionality)

### Can I delete my stored data?

Yes, you can:
1. **Clear from app**: Use logout function to clear session data
2. **Manual deletion**: Remove application data folder
   - Windows: `%APPDATA%/telegram-channel-downloader/`
   - macOS: `~/Library/Application Support/telegram-channel-downloader/`
   - Linux: `~/.config/telegram-channel-downloader/`

### Is the application secure from malware?

The application is:
- **Open source** - code is publicly reviewable
- **Digitally signed** releases (where supported by platform)
- **Scanned by antivirus** before release
- **No external dependencies** that could introduce vulnerabilities

However, always download from official sources and keep your system updated.

### What happens to my session if I uninstall?

Uninstalling the application does not automatically log you out of Telegram. Your session remains active until:
- You explicitly log out through the app
- You revoke the session through Telegram settings
- The session expires (rare, but possible)

### Can Telegram see what I download?

Telegram can see API requests made by the application (this is normal for any Telegram client), but:
- **Your specific downloads** are not tracked beyond normal API logs
- **File contents** are not monitored
- **Usage patterns** are not analyzed or shared
- **Privacy settings** in your Telegram account still apply

---

## 💡 Still Need Help?

If your question isn't answered here:

1. **Check the [User Guide](USER_GUIDE.md)** for detailed instructions
2. **Review [Troubleshooting Guide](TROUBLESHOOTING.md)** for specific error solutions
3. **Search [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)** for similar problems
4. **Open a new issue** if you can't find a solution
5. **Join our community** on [Discord](https://discord.gg/telegram-downloader) for real-time help

**Before reporting issues, please include:**
- Operating system and version
- Application version
- Steps to reproduce the problem
- Any error messages or screenshots
- Log files (if available) 