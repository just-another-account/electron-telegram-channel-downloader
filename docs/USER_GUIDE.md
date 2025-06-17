# 📖 User Guide

Welcome to the Telegram Channel Downloader! This guide will walk you through everything you need to know to use the application effectively.

## 📑 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Interface Overview](#interface-overview)
4. [Channel Selection](#channel-selection)
5. [Download Configuration](#download-configuration)
6. [Download Process](#download-process)
7. [File Organization](#file-organization)
8. [Language Settings](#language-settings)
9. [Tips & Best Practices](#tips--best-practices)
10. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### System Requirements

- **Operating System**: Windows 10+, macOS 10.13+, or Linux (Ubuntu 18.04+, Fedora 32+, etc.)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 1GB free space (plus space for downloads)
- **Internet**: Stable internet connection for Telegram API access

### First Launch

1. **Download and Install**: Get the latest version from [Releases](https://github.com/yourusername/telegram-channel-downloader/releases)
2. **Launch Application**: Run the installed application
3. **Language Selection**: Choose your preferred language from the top-right corner
4. **API Setup**: You'll be prompted to enter Telegram API credentials

## 🔐 Authentication

### Getting API Credentials

Before using the application, you need to obtain Telegram API credentials:

1. **Visit Telegram Website**
   - Go to [my.telegram.org](https://my.telegram.org)
   - This is the official Telegram developer portal

2. **Login with Phone**
   - Enter your phone number (the same one used for Telegram)
   - You'll receive a verification code via Telegram app or SMS
   - Enter the code to proceed

3. **Create Application**
   - Navigate to "API development tools"
   - Click "Create new application"
   - Fill in the form:
     - **App title**: Any name (e.g., "My Channel Downloader")
     - **Short name**: A short identifier
     - **URL**: Can be left empty or use a placeholder
     - **Platform**: Choose "Desktop"
     - **Description**: Brief description of your use case

4. **Get Credentials**
   - After creating the app, you'll see:
     - **API ID**: A number (e.g., 1234567)
     - **API Hash**: A long string (e.g., "abcdef1234567890abcdef1234567890")
   - **Important**: Keep these credentials secure and never share them

### Login Process

1. **Enter API Credentials**
   - Input your API ID and API Hash in the application
   - Click "Connect" to proceed

2. **Phone Verification**
   - Enter your phone number with country code
   - Format examples:
     - US: +1234567890
     - UK: +44234567890
     - China: +8613800000000
   - Click "Send Code"

3. **Verification Code**
   - Check your Telegram app for a verification code
   - Enter the 5-digit code in the application
   - Click "Verify"

4. **Two-Factor Authentication (if enabled)**
   - If you have 2FA enabled on your Telegram account
   - Enter your 2FA password when prompted
   - Click "Verify"

5. **Success**
   - Once authenticated, you'll see the main application interface
   - Your session will be saved for future use

## 🖥️ Interface Overview

### Main Layout

The application features a clean, modern interface divided into several sections:

#### Top Bar
- **Language Selector**: Switch between 8 supported languages
- **User Menu**: Access settings and logout options
- **Token Viewer**: View and copy your session token

#### Left Sidebar - Channel List
- **Refresh Button**: Update the list of available channels
- **Channel Items**: Shows channel/group name, type, and ID
- **Selection Indicator**: Highlights the currently selected channel
- **Loading State**: Shows skeleton loaders while fetching data

#### Right Main Area - Download Configuration
- **Selected Channel Info**: Displays information about the chosen channel
- **Download History**: Shows previous download statistics (if any)
- **Configuration Form**: Options for customizing your download
- **Start Download Button**: Initiates the download process

### Status Indicators

- 🟢 **Green Badge**: Channel is selected and ready
- 📊 **Blue Chip**: Shows channel type (Channel/Group/Private)
- ⏳ **Loading**: Data is being fetched
- ❌ **Error**: Something went wrong (hover for details)

## 📋 Channel Selection

### Understanding Channel Types

The application can access different types of conversations:

1. **Channels** 📢
   - Public or private channels you've joined
   - Usually used for broadcasting
   - May contain large amounts of media

2. **Groups** 👥
   - Group chats you're a member of
   - Can be public or private
   - May have shared media

3. **Private Chats** 💬
   - Direct conversations with other users
   - Personal message history
   - Shared files and media

### Selecting a Channel

1. **Browse List**: Scroll through the channel list on the left
2. **Identify Target**: Look for the channel you want to download from
3. **Click to Select**: Click on a channel to select it
4. **View Information**: The right panel will show channel details
5. **Check History**: See if there are previous downloads from this channel

### Channel Information Display

When you select a channel, you'll see:
- **Channel Name**: Display name of the channel/group
- **Channel Type**: Whether it's a channel, group, or private chat
- **Channel ID**: Unique identifier
- **Download History**: Previous download sessions (if any)
- **Message Range**: What messages have been downloaded before

## ⚙️ Download Configuration

### Content Type Selection

Choose what types of files to download:

1. **Images** 🖼️
   - JPEG, PNG, WebP, GIF, etc.
   - Photos and image files
   - Stickers (as images)

2. **Videos** 🎥
   - MP4, AVI, MOV, etc.
   - Video files and animations
   - Video notes (circular videos)

3. **Documents** 📄
   - PDF, DOC, ZIP, etc.
   - Any file that's not an image or video
   - Text files, spreadsheets, etc.

4. **Others** 📦
   - Audio files
   - Voice messages
   - Any other media types

**Tip**: You can select multiple types by clicking on each one.

### Message Range (Optional)

Fine-tune which messages to process:

1. **Start Message ID**
   - Leave empty to start from the beginning
   - Enter a specific message ID to start from that point
   - Useful for resuming interrupted downloads

2. **End Message ID**
   - Leave empty to download until the latest message
   - Enter a specific message ID to stop at that point
   - Useful for downloading a specific time period

**How to find Message IDs**:
- In Telegram web, right-click a message and "Copy Link"
- The ID is the number at the end of the link
- Or use the previous download history as reference

### Download Path

Choose where files will be saved:

1. **Click Folder Icon**: Opens file browser
2. **Select Directory**: Choose your preferred download location
3. **Confirm Path**: The path will be displayed in the field
4. **Automatic Organization**: Files will be organized in subfolders

**Default Locations**:
- **Windows**: Downloads folder
- **macOS**: Downloads folder  
- **Linux**: Home directory

## 📥 Download Process

### Starting a Download

1. **Verify Selection**: Ensure you've selected the correct channel
2. **Check Configuration**: Review content types and path settings
3. **Click Start Download**: The download button at the bottom
4. **Progress Dialog**: A progress window will appear

### Monitoring Progress

The progress dialog shows:

#### Overall Progress
- **Progress Bar**: Visual representation of completion
- **Current/Total**: Number of messages processed
- **Percentage**: Completion percentage

#### Current Status
- **Current File**: Name of the file being downloaded
- **Status Message**: What the application is currently doing
- **File Progress**: Progress of the current file download

#### Statistics
- **Downloaded**: Number of files successfully downloaded
- **Skipped**: Files that were skipped (already exist, etc.)
- **Errors**: Number of failed downloads

### Download States

- **Preparing**: Initial setup and scanning
- **Downloading**: Actively downloading files
- **Processing**: Organizing files and updating records
- **Completed**: Download finished successfully
- **Failed**: Download encountered errors
- **Cancelled**: User cancelled the download

### Cancelling Downloads

- **During Download**: Click "Cancel Download" to stop
- **Files Keep**: Already downloaded files remain
- **Resume Later**: You can resume by starting a new download
- **After Completion**: Click "Close" to dismiss the dialog

## 📁 File Organization

### Folder Structure

Downloaded files are organized automatically:

```
[Download Path]/
└── [Channel ID]/
    ├── json/
    │   ├── messages_1-500.json
    │   ├── messages_501-1000.json
    │   └── ...
    ├── images/
    │   ├── image_001.jpg
    │   ├── image_002.png
    │   └── ...
    ├── videos/
    │   ├── video_001.mp4
    │   ├── video_002.mov
    │   └── ...
    ├── documents/
    │   ├── document_001.pdf
    │   ├── document_002.docx
    │   └── ...
    └── others/
        ├── audio_001.mp3
        ├── voice_001.ogg
        └── ...
```

### File Naming

Files are named systematically:
- **Pattern**: `[type]_[message_id]_[timestamp].[extension]`
- **Example**: `image_1234_20240115_143022.jpg`
- **Conflict Resolution**: If names conflict, a number is appended

### JSON Data Files

Message data is exported as JSON:
- **Batch Size**: 500 messages per file
- **Content**: Message text, metadata, file references
- **Format**: Structured JSON for easy parsing
- **Use Cases**: Data analysis, backup, migration

### File Integrity

- **Checksum Verification**: Files are verified after download
- **Duplicate Detection**: Already downloaded files are skipped
- **Error Handling**: Failed downloads are logged and can be retried

## 🌍 Language Settings

### Supported Languages

The application supports 8 languages:
- 🇺🇸 **English** (en)
- 🇨🇳 **简体中文** (zh-CN)
- 🇹🇼 **繁體中文** (zh-TW)
- 🇯🇵 **日本語** (ja)
- 🇰🇷 **한국어** (ko)
- 🇫🇷 **Français** (fr)
- 🇩🇪 **Deutsch** (de)
- 🇪🇸 **Español** (es)

### Changing Language

1. **Language Selector**: Click the language dropdown in the top-right
2. **Choose Language**: Select your preferred language
3. **Instant Update**: The interface updates immediately
4. **Persistence**: Your choice is saved for future sessions

### Language Detection

- **Automatic Detection**: App detects your system language on first run
- **Fallback**: Defaults to English if system language isn't supported
- **Chinese Variants**: Automatically detects Traditional vs Simplified Chinese

## 💡 Tips & Best Practices

### Performance Optimization

1. **Batch Downloads**: Download multiple file types in one session
2. **Internet Connection**: Use a stable, fast internet connection
3. **Disk Space**: Ensure adequate free space before starting
4. **Background Apps**: Close unnecessary applications during large downloads

### Security Best Practices

1. **API Credentials**: Never share your API ID and Hash
2. **Session Tokens**: Keep session tokens private
3. **Regular Updates**: Keep the application updated
4. **Secure Storage**: Store downloads in secure locations

### Download Strategy

1. **Start Small**: Test with a small channel first
2. **Check History**: Review existing downloads to avoid duplicates
3. **Message Ranges**: Use message ID ranges for specific periods
4. **File Types**: Be selective about file types to save space and time

### Troubleshooting Common Issues

1. **Slow Downloads**: Check internet connection and Telegram server status
2. **Missing Files**: Verify file types are selected and permissions are correct
3. **Authentication Errors**: Re-login or check API credentials
4. **Storage Issues**: Ensure sufficient disk space

## 🆘 Quick Troubleshooting

### Login Issues
- ✅ Verify API credentials are correct
- ✅ Check internet connection
- ✅ Ensure phone number format is correct
- ✅ Try refreshing the application

### Download Problems
- ✅ Check channel permissions
- ✅ Verify download path is writable
- ✅ Ensure sufficient disk space
- ✅ Try selecting different file types

### Performance Issues
- ✅ Close other applications
- ✅ Check system resources
- ✅ Restart the application
- ✅ Update to latest version

### Interface Problems
- ✅ Try changing language and back
- ✅ Restart the application
- ✅ Check display scaling settings
- ✅ Clear application cache

---

For more detailed troubleshooting, see the [Troubleshooting Guide](TROUBLESHOOTING.md).

For technical support, visit our [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues) page. 