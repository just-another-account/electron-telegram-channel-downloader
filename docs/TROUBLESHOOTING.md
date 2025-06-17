# 🐛 Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Telegram Channel Downloader.

## 📋 Table of Contents

1. [General Troubleshooting](#general-troubleshooting)
2. [Installation Issues](#installation-issues)
3. [Authentication Problems](#authentication-problems)
4. [Download Issues](#download-issues)
5. [Performance Problems](#performance-problems)
6. [UI and Display Issues](#ui-and-display-issues)
7. [Error Codes](#error-codes)
8. [Getting Help](#getting-help)

## 🔧 General Troubleshooting

### First Steps

Before diving into specific issues, try these general troubleshooting steps:

1. **Restart the Application**
   - Close the application completely
   - Wait 5 seconds
   - Restart the application

2. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - Try accessing other websites or services
   - Consider switching networks if possible

3. **Update the Application**
   - Check if you're using the latest version
   - Download and install updates from [GitHub Releases](https://github.com/yourusername/telegram-channel-downloader/releases)

4. **Check System Requirements**
   - **Windows**: Windows 10 or later
   - **macOS**: macOS 10.13 (High Sierra) or later
   - **Linux**: Recent distribution with glibc 2.17+

### Common Solutions

- **Clear Application Data**: Sometimes corrupted settings cause issues
- **Run as Administrator**: Elevation may be needed for certain operations
- **Disable Antivirus Temporarily**: Security software may interfere
- **Check Disk Space**: Ensure sufficient free space for downloads

## 🛠️ Installation Issues

### Windows Installation Problems

#### Issue: "Windows protected your PC" warning
**Solution:**
1. Click "More info" in the warning dialog
2. Click "Run anyway"
3. Or: Right-click installer → Properties → Unblock → OK

#### Issue: Installation fails with permission error
**Solution:**
1. Right-click installer and select "Run as administrator"
2. Or: Install to a different location (not Program Files)
3. Or: Temporarily disable antivirus software

#### Issue: Application won't start after installation
**Solution:**
1. Install Microsoft Visual C++ Redistributable 2019+
2. Update Windows to latest version
3. Check Windows Event Viewer for error details

### macOS Installation Problems

#### Issue: "App can't be opened because it is from an unidentified developer"
**Solution:**
1. Control-click the app → Open → Open
2. Or: System Preferences → Security & Privacy → Allow apps downloaded from → App Store and identified developers

#### Issue: Application is damaged and can't be opened
**Solution:**
1. Download the app again from official source
2. Clear quarantine attribute: `sudo xattr -rd com.apple.quarantine /Applications/TelegramChannelDownloader.app`

### Linux Installation Problems

#### Issue: AppImage won't run
**Solution:**
1. Make it executable: `chmod +x TelegramChannelDownloader.AppImage`
2. Install FUSE if missing: `sudo apt install fuse` (Ubuntu/Debian)
3. Run with `--no-sandbox` flag if needed

#### Issue: Missing dependencies
**Solution:**
1. Install required libraries:
   ```bash
   # Ubuntu/Debian
   sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxkbcommon0

   # Fedora
   sudo dnf install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-atk libdrm libXcomposite libXdamage libXrandr mesa-libgbm libxkbcommon
   ```

## 🔐 Authentication Problems

### API Credential Issues

#### Issue: "Invalid API ID or Hash" error
**Symptoms:**
- Login fails immediately
- Error message about invalid credentials

**Solutions:**
1. **Verify Credentials**
   - Double-check API ID and Hash from [my.telegram.org](https://my.telegram.org)
   - Ensure no extra spaces or characters
   - API ID should be a number, API Hash should be a 32-character string

2. **Generate New Credentials**
   - Go to [my.telegram.org](https://my.telegram.org)
   - Delete the old app and create a new one
   - Use the new API ID and Hash

#### Issue: Phone verification fails
**Symptoms:**
- Code not received
- "Invalid phone number" error
- "Too many attempts" error

**Solutions:**
1. **Check Phone Format**
   - Include country code: `+1234567890`
   - Remove spaces, dashes, or parentheses
   - Use the same number as your Telegram account

2. **Code Delivery Issues**
   - Check your Telegram app for the code
   - If no Telegram app, code will be sent via SMS
   - Wait 60 seconds before requesting a new code

3. **Rate Limiting**
   - Wait 24 hours if you've made too many attempts
   - Try from a different IP address
   - Contact Telegram support if issue persists

#### Issue: 2FA (Two-Factor Authentication) problems
**Symptoms:**
- "Wrong password" error
- Account locked temporarily

**Solutions:**
1. **Password Reset**
   - Use "Forgot Password" in Telegram app
   - Follow email recovery process
   - Use security questions if available

2. **Wait for Unlock**
   - Telegram may temporarily lock after failed attempts
   - Wait time varies from minutes to hours

### Session Issues

#### Issue: Session expires frequently
**Solutions:**
1. Don't log in to the same account on too many devices
2. Avoid logging in from multiple IP addresses rapidly
3. Clear application data and re-authenticate

#### Issue: "Session revoked" error
**Solutions:**
1. Re-authenticate with phone and code
2. Check if session was revoked in Telegram settings
3. Ensure you're not violating Telegram's terms of service

## 📥 Download Issues

### Download Failures

#### Issue: Downloads fail to start
**Symptoms:**
- "No files to download" message
- Download button remains disabled

**Solutions:**
1. **Check Channel Access**
   - Ensure you're a member of the channel/group
   - Verify the channel hasn't been deleted
   - Try refreshing the channel list

2. **Verify Selection**
   - Ensure you've selected at least one content type
   - Check that the channel actually contains the selected content types
   - Try selecting all content types to test

3. **Path Issues**
   - Ensure download path exists and is writable
   - Choose a different download location
   - Check available disk space

#### Issue: Downloads start but fail quickly
**Symptoms:**
- Progress shows briefly then stops
- High error count in progress dialog

**Solutions:**
1. **Network Issues**
   - Check internet connection stability
   - Try downloading during off-peak hours
   - Use a VPN if Telegram is restricted in your region

2. **File Permissions**
   - Run application as administrator (Windows)
   - Check write permissions on download folder
   - Ensure antivirus isn't blocking file creation

#### Issue: Some files skip or fail
**Symptoms:**
- Download completes but file count is lower than expected
- Many "skipped" files in summary

**Solutions:**
1. **Duplicate Detection**
   - Files already downloaded are automatically skipped
   - Clear download folder if you want to re-download

2. **File Access Issues**
   - Some files may be deleted from Telegram
   - You might not have permission to access certain files
   - Large files may have download restrictions

### Performance Issues

#### Issue: Downloads are very slow
**Symptoms:**
- Download speed under 100 KB/s
- Progress barely moving

**Solutions:**
1. **Network Optimization**
   - Close other bandwidth-heavy applications
   - Use wired connection instead of Wi-Fi
   - Try downloading fewer file types simultaneously

2. **System Optimization**
   - Close unnecessary applications
   - Ensure sufficient RAM (4GB+ recommended)
   - Use SSD instead of HDD for downloads

3. **API Rate Limiting**
   - Telegram may throttle requests
   - Wait and try again later
   - Consider smaller batch sizes

#### Issue: Application becomes unresponsive during download
**Solutions:**
1. Restart the application
2. Download smaller batches of files
3. Close other applications to free up memory
4. Update to the latest version

## 💻 Performance Problems

### High Memory Usage

#### Issue: Application uses too much RAM
**Symptoms:**
- System becomes slow
- Application crashes with "out of memory" error

**Solutions:**
1. **Reduce Batch Size**
   - Download fewer files at once
   - Use message ID ranges to limit scope

2. **System Optimization**
   - Close other applications
   - Increase virtual memory/swap space
   - Consider upgrading RAM

#### Issue: High CPU usage
**Solutions:**
1. Lower application priority in Task Manager
2. Close other CPU-intensive applications
3. Download during off-peak hours

### Storage Issues

#### Issue: Running out of disk space
**Solutions:**
1. Choose a different download location with more space
2. Clean up old downloads
3. Use an external drive for downloads

## 🖥️ UI and Display Issues

### Interface Problems

#### Issue: Text appears garbled or in wrong language
**Solutions:**
1. **Language Setting**
   - Click language selector in top-right corner
   - Choose your preferred language
   - Restart application if issue persists

2. **Font Issues**
   - Update system fonts
   - Install language-specific font packs
   - Reset application settings

#### Issue: UI elements are too small or too large
**Solutions:**
1. **Windows**
   - Adjust display scaling: Settings → Display → Scale
   - Right-click app → Properties → Compatibility → Change DPI settings

2. **macOS**
   - System Preferences → Displays → Resolution
   - Hold Option while clicking scaled for more options

3. **Linux**
   - Adjust GTK scale factor: `export GDK_SCALE=1.5`
   - Use desktop environment scaling settings

#### Issue: Application window won't open or is invisible
**Solutions:**
1. **Multi-monitor Issues**
   - Try Alt+Tab to find the window
   - Right-click taskbar icon → Maximize
   - Disconnect secondary monitors temporarily

2. **Reset Window Position**
   - Clear application data
   - Delete configuration files

### Theme and Appearance

#### Issue: Dark/light theme not working
**Solutions:**
1. Toggle theme setting manually
2. Restart application
3. Check system theme settings

## 📊 Error Codes

### Common Error Codes and Solutions

#### AUTH_RESTART
**Meaning:** Authentication session needs to be restarted
**Solution:** Log out and log back in

#### PHONE_NUMBER_INVALID
**Meaning:** Phone number format is incorrect
**Solution:** Include country code and remove spaces/formatting

#### SESSION_PASSWORD_NEEDED
**Meaning:** Two-factor authentication required
**Solution:** Enter your 2FA password

#### FLOOD_WAIT_X
**Meaning:** Rate limited, wait X seconds
**Solution:** Wait the specified time before retrying

#### FILE_REFERENCE_EXPIRED
**Meaning:** File reference is outdated
**Solution:** Refresh channel and try again

#### CHAT_ADMIN_REQUIRED
**Meaning:** Admin permissions needed
**Solution:** Contact channel admin or try different channel

### Network Error Codes

#### NETWORK_ERROR
**Solutions:**
1. Check internet connection
2. Try different network
3. Use VPN if applicable

#### TIMEOUT_ERROR
**Solutions:**
1. Increase timeout in settings
2. Try downloading smaller batches
3. Check network stability

## 📋 Diagnostic Information

### Collecting Debug Information

When reporting issues, include:

1. **System Information**
   - Operating system and version
   - Application version
   - Available RAM and disk space

2. **Error Details**
   - Exact error message
   - Steps to reproduce
   - When the error occurs

3. **Log Files**
   - Application logs (if available)
   - System event logs
   - Network logs

### Log File Locations

- **Windows**: `%APPDATA%/telegram-channel-downloader/logs/`
- **macOS**: `~/Library/Application Support/telegram-channel-downloader/logs/`
- **Linux**: `~/.config/telegram-channel-downloader/logs/`

## 🆘 Getting Help

### Before Asking for Help

1. **Search Existing Issues**
   - Check [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)
   - Search for similar problems

2. **Try Common Solutions**
   - Follow this troubleshooting guide
   - Update to latest version
   - Restart application and system

3. **Gather Information**
   - Note exact error messages
   - List steps that reproduce the issue
   - Collect system information

### How to Get Support

1. **GitHub Issues**
   - Best for bug reports and feature requests
   - Use issue templates
   - Include diagnostic information

2. **GitHub Discussions**
   - Good for questions and general help
   - Community-driven support
   - Search before posting

3. **Discord Community**
   - Real-time chat support
   - Quick questions and tips
   - Community help

### Creating Good Bug Reports

Include:
- **Clear title**: Describe the issue briefly
- **Environment**: OS, version, system specs
- **Steps to reproduce**: Numbered list
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full text
- **Additional context**: Any other relevant info

### Feature Requests

Include:
- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives**: Other ways to achieve this
- **Use cases**: When would this be useful?

---

## 🔄 Still Having Issues?

If this guide doesn't solve your problem:

1. **Update the application** to the latest version
2. **Check [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)** for known problems
3. **Join our [Discord community](https://discord.gg/telegram-downloader)** for real-time help
4. **Create a new issue** with detailed information

Remember: The more information you provide, the faster we can help solve your problem! 