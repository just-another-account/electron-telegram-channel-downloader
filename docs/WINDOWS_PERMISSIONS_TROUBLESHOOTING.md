# Windows 权限问题故障排除指南

## 🔍 问题现象

1. **双击安装程序无响应**
2. **需要右键"以管理员身份运行"才能安装**
3. **安装完成后，应用程序无法启动**
4. **应用程序启动后立即关闭**

## 🛠️ 解决方案

### 方案1：使用便携版（推荐）

便携版无需安装，直接运行，避免所有权限问题：

```bash
# 构建便携版
pnpm run build:portable
```

便携版特点：
- ✅ 无需安装，直接运行
- ✅ 不需要管理员权限
- ✅ 不写入注册表
- ✅ 可放置在任意目录

### 方案2：修复权限配置重新打包

如果需要安装版，使用优化后的配置：

```bash
# 使用优化的构建脚本
pnpm run build:win
```

### 方案3：手动配置Windows权限

#### 3.1 临时解决方案
1. 右键点击exe文件
2. 选择"属性"
3. 点击"兼容性"标签
4. 勾选"以管理员身份运行此程序"
5. 点击"应用"和"确定"

#### 3.2 永久解决方案
1. 找到安装目录（通常在 `C:\Users\[用户名]\AppData\Local\Programs\Telegram Channel Downloader\`）
2. 右键点击应用程序文件
3. 选择"属性" > "安全"
4. 点击"编辑"
5. 确保当前用户有"完全控制"权限

## 🔧 已实施的优化

### 1. NSIS安装程序优化
- ✅ 设置 `RequestExecutionLevel user`
- ✅ 禁用权限提升 `allowElevation: false`
- ✅ 用户级安装 `perMachine: false`
- ✅ 添加预初始化脚本

### 2. 应用程序清单文件
- ✅ 创建 `app.manifest`
- ✅ 指定执行级别为 `asInvoker`
- ✅ 设置DPI感知
- ✅ Windows版本兼容性

### 3. Electron配置优化
- ✅ 添加 `no-sandbox` 标志
- ✅ 仅在开发环境禁用web安全
- ✅ 优化权限级别设置

### 4. 构建配置优化
- ✅ 简化文件包含规则
- ✅ 关闭代码签名验证
- ✅ 优化安装程序配置

## 🚨 常见错误和解决方法

### 错误1: "Windows已保护你的电脑"
**原因**: Windows Defender SmartScreen阻止
**解决**: 
1. 点击"更多信息"
2. 点击"仍要运行"
3. 或者将文件添加到Windows Defender白名单

### 错误2: "应用程序无法正常启动(0xc0000142)"
**原因**: 权限不足或依赖缺失
**解决**:
1. 以管理员身份运行
2. 安装Microsoft Visual C++ Redistributable
3. 使用便携版

### 错误3: "找不到入口点"
**原因**: 系统不兼容或文件损坏
**解决**:
1. 检查Windows版本兼容性
2. 重新下载安装包
3. 关闭杀毒软件后重试

### 错误4: 安装后桌面没有快捷方式
**原因**: 权限问题导致快捷方式创建失败
**解决**:
1. 手动创建快捷方式
2. 使用便携版
3. 重新以管理员身份安装

## 🔍 调试方法

### 1. 查看事件日志
1. 按 `Win + R`，输入 `eventvwr.msc`
2. 展开"Windows日志" > "应用程序"
3. 查找相关错误信息

### 2. 使用命令行运行
```cmd
# 进入应用程序目录
cd "C:\Users\[用户名]\AppData\Local\Programs\Telegram Channel Downloader\"

# 直接运行查看错误信息
"Telegram Channel Downloader.exe"
```

### 3. 检查依赖
```cmd
# 检查.NET Framework
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\NET Framework Setup\NDP"

# 检查Visual C++ Redistributable
wmic product where "name like '%Visual C++%'" get name,version
```

## 📋 推荐的使用方式

### 对于普通用户：
1. **首选**：使用便携版 (`pnpm run build:portable`)
2. **备选**：安装版，必要时以管理员身份运行

### 对于企业环境：
1. 使用便携版放在共享文件夹
2. 或者请IT管理员以管理员权限安装

### 对于开发者：
1. 使用开发模式：`pnpm run dev`
2. 避免权限相关问题

## 🛡️ 安全建议

1. **仅从官方渠道下载**
2. **验证文件完整性**
3. **定期更新应用程序**
4. **不要禁用Windows Defender**
5. **使用标准用户账户运行**

## 📞 获取帮助

如果以上方法都无法解决问题：

1. **查看详细构建指南**: [Windows构建指南](WINDOWS_BUILD_GUIDE.md)
2. **联系开发者**: [@oooooh_hooooo](https://t.me/oooooh_hooooo)
3. **加入群组讨论**: [Telegram Channel Downloader Chat](https://t.me/channel_downloader_chat)
4. **提交Issue**: [GitHub Issues](https://github.com/yourusername/telegram-channel-downloader/issues)

提交问题时请提供：
- Windows版本信息
- 错误截图或日志
- 使用的构建版本
- 详细的错误步骤 