const ip = require("ip"); // 引入ip模块
global.network = ip.address();

/* 全局配置后端服务地址 */
global.backServeIp = "192.168.23.191:8097";


const h5Port = '8080'
const localSignPort = '8081'

/* app应用地址 */
const addressMap = {
  h5: {
    appPath: "/h5",
    /* 
    映射本地前端应用的服务地址  为防止端口冲突被改变指定，请在项目中约定好port
    1. localhost+ 端口
    2. 局域网network访问+ 端口
    */
    // forwardUrl: "http://localhost:8080/h5",
    forwardUrl: `http://${global.network}:${h5Port}/h5`,
  },
  localSign: {
    appPath: "/local-sign",
    // forwardUrl: "http://localhost:8081/local-sign",
    forwardUrl: `http://${global.network}:${localSignPort}/local-sign`,
  },
};

/* 后端接口地址 */
const interFaceMap = {
  hospitalweb: {
    appPath: "/hospitalweb",
    forwardUrl: `http://${global.backServeIp}/hospitalweb`,
  },
  signapi: {
    appPath: "/signapi",
    forwardUrl: `http://${global.backServeIp}/signapi`,
  },
};

const transformAddressMap = (arrayMap) => {
  return arrayMap.map(({appPath, port}) => {
    return {
      appPath,
      forwardUrl: `http://${global.network}:${port}${appPath}`,
    }
  })
}
const transformInterFaceMap = (arrayMap) => {
  return arrayMap.map(({interFacePath, serverIp}) => {
    return {
      interFacePath,
      forwardUrl: `http://${serverIp}${interFacePath}`,
    }
  })
}

const getFindMapToValue = (path) => {
  return Object.values(addressMap).find((v) => v.appPath === path);
};

module.exports = {
  getFindMapToValue,
  transformInterFaceMap,
  transformAddressMap,
  interFaceMap,
  addressMap,
};
