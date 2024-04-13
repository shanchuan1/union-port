const { Command } = require("commander");
const packageJson = require("../package.json");

// 定义命令行选项和参数
const program = new Command();

program
  .option("-p, --port <number>", "指定服务端口，默认为 9999", parseInt)
  .option("-c, --config <path>", "指定配置文件路径")
  .option("--clear-config", "清除保存的配置文件路径记录")
  .option("-v, --version", "显示版本信息", () => {
    console.log(`version: ${packageJson.version}`);
    process.exit(0); // 退出程序
  })
  .parse(process.argv)

const options = program.opts(); // 解析得到的选项对象

module.exports = {
  options,
};
