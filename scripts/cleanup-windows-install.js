const { spawn } = require('child_process');
const path = require('path');

console.log('🧹 Windows安装清理工具');
console.log('⚠️  请以管理员身份运行此脚本');

// 清理注册表项
const registryCleanupCommands = [
  // 清理卸载信息
  'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\telegram-channel-downloader" /f',
  'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{telegram-channel-downloader}" /f',
  'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\com.telegram.channel-downloader" /f',
  
  // 清理应用程序注册
  'reg delete "HKCU\\Software\\RegisteredApplications" /v "TelegramChannelDownloader" /f',
  'reg delete "HKCU\\Software\\TelegramChannelDownloader" /f',
  
  // 清理文件关联
  'reg delete "HKCU\\Software\\Classes\\.tcd" /f',
  'reg delete "HKCU\\Software\\Classes\\TelegramChannelDownloader" /f',
  
  // 清理程序路径
  'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Telegram Channel Downloader.exe" /f'
];

// 清理文件和快捷方式
const fileCleanupCommands = [
  // 清理桌面快捷方式
  'del "%USERPROFILE%\\Desktop\\Telegram Channel Downloader.lnk" /f /q',
  
  // 清理开始菜单快捷方式
  'del "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Telegram Channel Downloader.lnk" /f /q',
  'rmdir "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Telegram Channel Downloader" /s /q',
  
  // 清理程序文件（可选）
  'rmdir "%LOCALAPPDATA%\\Programs\\Telegram Channel Downloader" /s /q',
  'rmdir "%PROGRAMFILES%\\Telegram Channel Downloader" /s /q',
  'rmdir "%PROGRAMFILES(X86)%\\Telegram Channel Downloader" /s /q'
];

async function runCommand(command) {
  return new Promise((resolve) => {
    console.log(`执行: ${command}`);
    
    const process = spawn('cmd', ['/c', command], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let error = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ 成功`);
      } else {
        console.log(`⚠️  完成 (可能没有找到目标项)`);
      }
      resolve();
    });
  });
}

async function cleanupRegistry() {
  console.log('\n🔧 清理注册表...');
  
  for (const command of registryCleanupCommands) {
    await runCommand(command);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function cleanupFiles() {
  console.log('\n📁 清理文件和快捷方式...');
  
  for (const command of fileCleanupCommands) {
    await runCommand(command);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function refreshDesktop() {
  console.log('\n🔄 刷新系统...');
  
  const refreshCommands = [
    'gpupdate /force',
    'ie4uinit.exe -ClearIconCache',
    'taskkill /f /im explorer.exe && start explorer.exe'
  ];
  
  for (const command of refreshCommands) {
    await runCommand(command);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// 检查管理员权限
function checkAdminRights() {
  return new Promise((resolve) => {
    const checkCommand = 'net session >nul 2>&1';
    const process = spawn('cmd', ['/c', checkCommand], { stdio: 'pipe' });
    
    process.on('close', (code) => {
      resolve(code === 0);
    });
  });
}

async function main() {
  try {
    console.log('🔍 检查管理员权限...');
    const hasAdminRights = await checkAdminRights();
    
    if (!hasAdminRights) {
      console.log('❌ 需要管理员权限！');
      console.log('💡 请右键点击此脚本，选择"以管理员身份运行"');
      process.exit(1);
    }
    
    console.log('✅ 检测到管理员权限');
    
    await cleanupRegistry();
    await cleanupFiles();
    await refreshDesktop();
    
    console.log('\n🎉 清理完成！');
    console.log('💡 现在可以重新安装应用程序了');
    
  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error);
  }
}

// 显示使用说明
console.log(`
📋 使用说明:
1. 以管理员身份运行此脚本
2. 脚本将清理所有相关的注册表项和文件
3. 清理完成后可以重新安装应用程序

⚠️  注意事项:
- 此操作将完全移除应用程序的所有痕迹
- 用户数据和配置文件将被保留（除非手动删除）
- 请确保应用程序已完全关闭

按 Ctrl+C 取消，或等待 5 秒后开始清理...
`);

// 倒计时
let countdown = 5;
const timer = setInterval(() => {
  process.stdout.write(`\r⏱️  ${countdown} 秒后开始清理...`);
  countdown--;
  
  if (countdown < 0) {
    clearInterval(timer);
    console.log('\n');
    main();
  }
}, 1000);

// 处理 Ctrl+C
process.on('SIGINT', () => {
  clearInterval(timer);
  console.log('\n\n❌ 用户取消操作');
  process.exit(0);
}); 