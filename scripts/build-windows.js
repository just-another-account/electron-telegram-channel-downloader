const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 开始Windows构建...');

// 检查构建环境
function checkBuildEnvironment() {
  console.log('📋 检查构建环境...');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  console.log(`Node.js版本: ${nodeVersion}`);
  
  // 检查必要文件
  const requiredFiles = [
    'package.json',
    'electron/main.js',
    'electron/preload.js',
    'vite.config.js',
    'build/icon.ico'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.error(`❌ 缺少必要文件: ${file}`);
      process.exit(1);
    }
  }
  
  console.log('✅ 构建环境检查通过');
}

// 清理旧的构建文件
function cleanBuild() {
  console.log('🧹 清理旧的构建文件...');
  
  const dirsToClean = ['dist', 'dist-electron'];
  
  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`🗑️ 已清理: ${dir}`);
    }
  }
}

// 运行构建命令
function runBuild() {
  return new Promise((resolve, reject) => {
    console.log('🔨 开始Vite构建...');
    
    const viteProcess = spawn('npx', ['vite', 'build'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });
    
    viteProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Vite构建完成');
        resolve();
      } else {
        console.error(`❌ Vite构建失败，退出码: ${code}`);
        reject(new Error(`Vite build failed with code ${code}`));
      }
    });
    
    viteProcess.on('error', (error) => {
      console.error('❌ Vite构建错误:', error);
      reject(error);
    });
  });
}

// 运行Electron Builder
function runElectronBuilder() {
  return new Promise((resolve, reject) => {
    console.log('📦 开始Electron打包...');
    
    const builderArgs = [
      'electron-builder',
      '--win'
    ];
    
    const builderProcess = spawn('npx', builderArgs, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd(),
      env: {
        ...process.env,
        DEBUG: 'electron-builder'
      }
    });
    
    builderProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Electron打包完成');
        resolve();
      } else {
        console.error(`❌ Electron打包失败，退出码: ${code}`);
        reject(new Error(`Electron builder failed with code ${code}`));
      }
    });
    
    builderProcess.on('error', (error) => {
      console.error('❌ Electron打包错误:', error);
      reject(error);
    });
  });
}

// 检查构建结果
function checkBuildResult() {
  console.log('🔍 检查构建结果...');
  
  const outputDir = 'dist-electron';
  if (!fs.existsSync(outputDir)) {
    console.error('❌ 输出目录不存在');
    return false;
  }
  
  const files = fs.readdirSync(outputDir);
  console.log(`📂 输出文件: ${files.join(', ')}`);
  
  const exeFiles = files.filter(file => file.endsWith('.exe'));
  if (exeFiles.length === 0) {
    console.error('❌ 没有找到.exe文件');
    return false;
  }
  
  console.log(`✅ 找到可执行文件: ${exeFiles.join(', ')}`);
  return true;
}

// 主函数
async function main() {
  try {
    checkBuildEnvironment();
    cleanBuild();
    await runBuild();
    await runElectronBuilder();
    
    if (checkBuildResult()) {
      console.log('🎉 Windows构建成功完成！');
      process.exit(0);
    } else {
      console.error('❌ 构建结果验证失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 构建过程中出现错误:', error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

main(); 