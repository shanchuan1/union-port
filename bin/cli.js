#!/usr/bin/env node
const { startServer } = require('../src/index');
const {manageConfigFilePath} = require('../src/utils');
const {greenLog, redLog} = require('../src/terminalLog');
const { options } = require('../src/commander');

console.log('options', options);

(async () => {
  // 读取配置路径的文件内容
  const configFileContent = await manageConfigFilePath(options);

  try {
    if (configFileContent) {
      await startServer(options.port , configFileContent);
    } 
    greenLog("unionport server started successfully!");
  } catch (error) {
    redLog("Error starting unionport:", error);
    process.exit(1);
  }
})();