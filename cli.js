#!/usr/bin/env node
const { startServer } = require('./src/index');
const {manageConfigFilePath} = require('./src/utils');
const {greenLog, redLog} = require('./src/terminalLog');
const { options } = require('./src/commander');

console.log('options', options);

(async () => {
  // 读取配置路径的文件内容
  const configFileContent = await manageConfigFilePath(options);

  try {
    // 如果配置文件读取成功，可以根据需要将配置内容传递给startServer函数
    if (configFileContent) {
      await startServer(options.port , configFileContent);
    } 
    greenLog("UNIFYPORT server started successfully!");
  } catch (error) {
    redLog("Error starting UNIFYPORT:", error);
    process.exit(1);
  }
})();