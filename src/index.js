const express = require("express");
const { commonLog } = require("./terminalLog");
const { transformInterFaceMap, transformAddressMap } = require("./dataMap");
const chalk = require("chalk");
const os = require("os"); // 引入内置的os模块来获取网络接口信息
const ip = require("ip"); // 引入ip模块
const {
  appProxyMiddleware,
  getInterFaceProxy,
  assetProxyMiddleware,
} = require("./proxyRoutes");
const { writeFile } = require('./handleFile')

const startServer = async (port, options) => {
  const {addressMap, interFaceMap} = options
  const addressArray = transformAddressMap(addressMap)
  const interFacArray = transformInterFaceMap(interFaceMap)
  console.log('addressArray', addressArray);
  console.log('interFacArray', interFacArray);
  // 获取本机所有的IPv4地址，通常第一个非内部回环地址是对外公开的网络地址
  const networkAddress = ip.address();
  global.network = networkAddress;
  global.serverPort = port || 9999;

  commonLog("ip", ip.fromLong());
  commonLog("global.network", networkAddress);

  const app = express();

  /* 路由监听，返回index.html文件 */
  // app.get("/h5", (req, res) => {
  //   console.log("🚀 ~ app.get ~ req:", req.originalUrl);
  //   assetProxyMiddleware(req, res);
  // });

  // 引入并使用代理中间件
  const useProxy = () => {
    /* 前端项目publicPath地址代理 */
    (addressArray || [])?.forEach(({ appPath, forwardUrl }) => {
      app.use(appPath, appProxyMiddleware(forwardUrl));
    });

    /* 请求后端接口地址代理 */
    (interFacArray || [])?.forEach(({ interFacePath, forwardUrl }) => {
      // 在代理之前记录请求信息
      app.use((req, res, next) => {
        console.log('req.originalUrl', req.originalUrl);
        const data = {
          originalUrl: req.originalUrl,
          headers: {...req.headers}
        }
        writeFile({data, folderPath: '/request', type: 'req', name: req.originalUrl})
        next();
      });

      app.use(getInterFaceProxy({ interFacePath, forwardUrl }))
      // app.use(interFacePath, interFaceProxyMiddleware(forwardUrl));

    });
  };
  useProxy();

  // 监听所有网络接口（'0.0.0.0'），而不是仅监听本地环回地址（'127.0.0.1'）
  app.listen(global.serverPort, "0.0.0.0", () => {
    console.log(`${chalk.green("App is running at:")}
  - ${chalk.green("Local: ")}  ${chalk.blue(
      `http://localhost:${global.serverPort}/`
    )}
  - ${chalk.green("Network: ")} ${chalk.blue(
      `http://${global.network}:${global.serverPort}/`
    )}
  `);
  });
};

module.exports = {
  startServer,
};
