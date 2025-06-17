const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 开始便携版构建...');

// 检查构建环境
function checkBuildEnvironment() {
  console.log('📋 检查构建环境...');
  
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

// 构建便携版
function buildPortable() {
  return new Promise((resolve, reject) => {
    console.log('📦 开始便携版打包...');
    
    const builderArgs = [
      'electron-builder',
      '--win',
      '--config.win.target=portable',
      '--config.portable.requestedExecutionLevel=asInvoker'
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
        console.log('✅ 便携版打包完成');
        resolve();
      } else {
        console.error(`❌ 便携版打包失败，退出码: ${code}`);
        reject(new Error(`Portable build failed with code ${code}`));
      }
    });
    
    builderProcess.on('error', (error) => {
      console.error('❌ 便携版打包错误:', error);
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
  
  const portableFiles = files.filter(file => file.includes('portable') && file.endsWith('.exe'));
  if (portableFiles.length === 0) {
    console.error('❌ 没有找到便携版文件');
    return false;
  }
  
  console.log(`✅ 找到便携版文件: ${portableFiles.join(', ')}`);
  return true;
}

// 主函数
async function main() {
  try {
    checkBuildEnvironment();
    cleanBuild();
    await runBuild();
    await buildPortable();
    
    if (checkBuildResult()) {
      console.log('🎉 便携版构建成功完成！');
      console.log('💡 便携版文件可以直接运行，无需安装');
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

main(); 