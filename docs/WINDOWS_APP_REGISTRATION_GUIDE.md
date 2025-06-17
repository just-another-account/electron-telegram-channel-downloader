# Windows 应用程序注册问题解决指南

## 🔍 问题描述

**现象：**
1. ✅ 安装程序正常完成
2. ❌ 系统应用列表中找不到应用程序
3. ❌ 开始菜单没有快捷方式
4. ⚠️  重新安装时提示已存在旧版本

**原因：** 应用程序安装了但没有正确注册到Windows系统

## 🛠️ 解决方案

### 方案1：使用清理工具（推荐）

我们提供了专用的清理工具来解决这个问题：

```bash
# 运行清理工具（需要管理员权限）
pnpm run cleanup:win
```

**清理工具功能：**
- ✅ 清理所有注册表残留
- ✅ 删除无效的快捷方式
- ✅ 清理应用程序注册信息
- ✅ 刷新系统缓存

### 方案2：手动清理

#### 2.1 清理注册表
按 `Win + R`，输入 `regedit`，然后删除以下项：

```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\telegram-channel-downloader
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\{telegram-channel-downloader}
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall\com.telegram.channel-downloader
HKEY_CURRENT_USER\Software\RegisteredApplications\TelegramChannelDownloader
HKEY_CURRENT_USER\Software\TelegramChannelDownloader
HKEY_CURRENT_USER\Software\Classes\.tcd
HKEY_CURRENT_USER\Software\Classes\TelegramChannelDownloader
```

#### 2.2 清理快捷方式
删除以下位置的快捷方式：
- 桌面：`%USERPROFILE%\Desktop\Telegram Channel Downloader.lnk`
- 开始菜单：`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Telegram Channel Downloader.lnk`

#### 2.3 清理程序文件
删除安装目录（通常在以下位置之一）：
- `%LOCALAPPDATA%\Programs\Telegram Channel Downloader`
- `%PROGRAMFILES%\Telegram Channel Downloader`
- `%PROGRAMFILES(X86)%\Telegram Channel Downloader`

### 方案3：重新安装（推荐配置）

清理完成后，使用优化后的配置重新构建：

```bash
# 清理旧安装
pnpm run cleanup:win

# 重新构建（使用修复后的配置）
pnpm run build:win

# 或者构建便携版（无注册问题）
pnpm run build:portable
```

## 🔧 已修复的配置问题

### 1. NSIS安装程序改进
- ✅ 正确注册到卸载程序列表
- ✅ 添加应用程序元数据（DisplayName, Publisher等）
- ✅ 正确注册到RegisteredApplications
- ✅ 改进快捷方式创建逻辑

### 2. 应用程序清单优化
- ✅ 添加完整的应用程序描述
- ✅ 正确的执行权限级别
- ✅ Windows版本兼容性支持

### 3. 卸载清理改进
- ✅ 完整清理注册表项
- ✅ 清理所有快捷方式
- ✅ 可选的用户数据清理

## 🚨 预防措施

### 1. 选择正确的构建方式
- **便携版**（推荐）：`pnpm run build:portable` - 无注册问题
- **安装版**：`pnpm run build:win` - 使用修复后的配置

### 2. 安装前准备
1. 关闭所有杀毒软件
2. 以管理员身份运行安装程序
3. 确保Windows系统完整性

### 3. 安装后验证
1. 检查开始菜单是否有快捷方式
2. 检查桌面是否有快捷方式
3. 在设置 > 应用中查找应用程序

## 🔍 诊断方法

### 1. 检查注册表
```cmd
# 查看卸载信息
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall" | findstr telegram

# 查看应用程序注册
reg query "HKCU\Software\RegisteredApplications" | findstr Telegram
```

### 2. 检查快捷方式
```cmd
# 查看开始菜单快捷方式
dir "%APPDATA%\Microsoft\Windows\Start Menu\Programs" | findstr Telegram

# 查看桌面快捷方式
dir "%USERPROFILE%\Desktop" | findstr Telegram
```

### 3. 查看事件日志
1. 按 `Win + R`，输入 `eventvwr.msc`
2. 展开 Windows日志 > 应用程序
3. 查找安装相关的错误

## 🛡️ 最佳实践

### 对于开发者：
1. **优先使用便携版** - 避免所有注册问题
2. **测试安装** - 在虚拟机中测试完整安装流程
3. **验证注册** - 确保安装后应用程序正确显示

### 对于用户：
1. **选择便携版** - 如果不需要深度系统集成
2. **管理员安装** - 安装版需要管理员权限
3. **清理重装** - 出问题时使用清理工具后重装

## 📋 故障排除检查清单

安装前：
- [ ] 关闭杀毒软件
- [ ] 确保有管理员权限
- [ ] 清理旧的安装残留

安装后检查：
- [ ] 开始菜单有快捷方式
- [ ] 桌面有快捷方式（如果选择了）
- [ ] 设置 > 应用中能找到
- [ ] 可以正常启动应用程序

如果有问题：
- [ ] 运行清理工具：`pnpm run cleanup:win`
- [ ] 检查注册表项是否存在
- [ ] 查看事件日志中的错误
- [ ] 尝试便携版：`pnpm run build:portable`

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **查看其他指南**：
   - [Windows构建指南](WINDOWS_BUILD_GUIDE.md)
   - [权限问题故障排除](WINDOWS_PERMISSIONS_TROUBLESHOOTING.md)

2. **联系开发者**：
   - Telegram: [@oooooh_hooooo](https://t.me/oooooh_hooooo)
   - 群组: [Telegram Channel Downloader Chat](https://t.me/channel_downloader_chat)

3. **提交Issue时请提供**：
   - Windows版本信息
   - 安装程序日志
   - 注册表查询结果
   - 详细的操作步骤 