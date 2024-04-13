# union-port 
## 统一代理端口
for: 同一产品下的多个前端应用，居于宿主环境(嵌套app，钉钉，h5，小程序)且具备相互关联关系的本地局域网联调工具

- 确保启动此服务时，所需代理的所有本地前端应用应该启动了
- h5应用  port 8080
- localSign应用 port 8081


## 脚本命令
```js
// 命令
unionport

// 命令参数
--port 指定端口 (默认端口：9999)  
--config 指定配置文件的路径 (path)
--version 查看版本

unionport -v 
unionport -p 9999 -c  path
unionport --port 9999 path

// 例子
//  第一次携带参数输入
unionport -c path

//  第二次输入 无需携带参数，默认就是之前的路径参数
unionport 

//  清除已记录的配置文件路径
unionport --clear-config
```


## 配置文件模板
```js
/* app应用地址 */
const addressMap = [
  {
    appPath: "/h5", // 代表本地的 /h5应用
    port: "8080",  // 代表本地h5应用启动的端口
  },
  {
    appPath: "/local-sign",
    port: "8081",
  },
];

/* 后端接口地址 */
const interFaceMap = [
  {
    interFacePath: "/web",  // 需要代理的后端接口路径
    serverIp: '192.168.23.191:8097' // 后端服务的ip地址
  },
  {
    interFacePath: "/openapi",
    serverIp: '192.168.23.191:8097'
  },
];

module.exports= {
    addressMap,
    interFaceMap
}
```
