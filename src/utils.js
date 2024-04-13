const path = require('path');
const fs = require('fs').promises;
const { validateMaps } = require('./validate');
const {redLog} = require('./terminalLog');


const DEFAULT_CONFIG_FILE = '.unifyportrc';
const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

// 获取上次保存的配置文件路径
async function getLastUsedConfigPath() {
  try {
    const filePath = path.join(HOME_DIR, DEFAULT_CONFIG_FILE);
    const data = await fs.readFile(filePath, 'utf-8');
    return data.trim();
  } catch (error) {
    return null;
  }
}

// 保存当前使用的配置文件路径
async function saveLastUsedConfigPath(configPath) {
  const filePath = path.join(HOME_DIR, DEFAULT_CONFIG_FILE);
  await fs.writeFile(filePath, configPath, 'utf-8');
}

// 清除已保存的配置文件路径
 async function clearLastUsedConfigPath() {
   // 清除已保存的配置文件路径
   await fs.rm(path.join(HOME_DIR, DEFAULT_CONFIG_FILE), { force: true });
   console.log('已成功清除保存的配置文件路径记录');
   process.exit(0); // 清除后结束程序，不再执行后续逻辑
}

// 动态导入模块必须在异步上下文中
async function loadConfigModule(configPath) {
  try {
    // 动态导入CommonJS模块
    const configModule = await require(path.resolve(configPath));
    return configModule.default || configModule; // 对于默认导出和命名导出的支持
  } catch (error) {
    console.error('Error loading configuration module:', error.message);
    process.exit(1);
  }
}

// 管理配置文件路径相关操作
async function manageConfigFilePath(options) {
  let configPathToUse = options.config;

  if (options.clearConfig) {
    await clearLastUsedConfigPath();
    process.exit(0); // 清除后结束程序，不再执行后续逻辑
  }

  // 如果未指定 --config 参数，尝试读取上次保存的配置文件路径
  if (!configPathToUse) {
    configPathToUse = await getLastUsedConfigPath();
  }

  if (!configPathToUse) {
    throw new Error(
      redLog(`请传入指定配置文件的路径: unifyport --config '<path>'`)
    );
  }

  const configFileContent = await loadConfigModule(configPathToUse);
  validateMaps(configFileContent);

  // 记录本次使用的配置文件路径
  await saveLastUsedConfigPath(configPathToUse);

  return configFileContent;
}

module.exports = {
    manageConfigFilePath
}