const { spawn } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.VITE_DEV_SERVER_URL = 'http://localhost:5173';

// 启动 Electron
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
const mainPath = path.join(__dirname, 'electron', 'main.js');

const electron = spawn(electronPath, [mainPath], {
  stdio: 'inherit',
  env: process.env
});

electron.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
});

electron.on('error', (error) => {
  console.error('Failed to start Electron:', error);
}); 