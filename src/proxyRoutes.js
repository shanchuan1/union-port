const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const { getFetchProcess } = require("./fetchHtml");
const { writeFile } = require("./handleFile");
const { findAndReplaceUrlWithInfo, extractBaseUrl } = require("./utils");
const http = require("http");
const url = require("url");

/* app应用地址代理转发 */
const appProxyMiddleware = (url) => {
  return createProxyMiddleware({
    target: url,
    changeOrigin: true,
    onError: (error, req, res) => {
      console.error(`Error in ${url} proxy:`, error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end(`An error occurred while trying to proxy ${url} requests`);
    },
  });
};

/* app资源拉取返回 */
const assetProxyMiddleware = async (req, res) => {
  var currentUrl = req.originalUrl; // 获取原始请求URL
  console.log("Current URL:", currentUrl);

  await getFetchProcess(currentUrl);
  res.sendFile(path.join(__dirname, `public${currentUrl}`, "index.html"));
};

/* url地址匹配最后的路径 */
const extractLastPath = (urlString) => {
  const regex = /\/([^\/]+)$/;
  const match = urlString.match(regex);
  return match ? match[1] : null;
};

/* 后端接口地址代理转发 */
const interFaceProxyMiddleware = (url) => {
  const rewriteKey = `'^/${extractLastPath(url)}'`;
  return createProxyMiddleware({
    timeout: 30000,
    target: url,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      //   '^/hospitalweb': "",
      [rewriteKey]: "", // 动态创建键
    },
    on: {
      proxyReq: (proxyReq, req, res) => {},
      proxyRes: async (proxyRes, req, res) => {
        /* http-proxy-middleware 暂不支持对http响应结果修改与转发  这里暂时替换用中间件*/
      },
      error: (err, req, res) => {
        console.error(`Error in ${extractLastPath(url)} proxy:`, error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(
          `An error occurred while trying to proxy ${extractLastPath(
            url
          )} requests`
        );
      },
    },
  });
};

/* 后端接口代理中间件 */
const getInterFaceProxy = (options) => {
  const { interFacePath, forwardUrl } = options;
  return (req, res, next) => {
    if (req.path.startsWith(interFacePath)) {
      const targetUrl = `${forwardUrl}${req.originalUrl.replace(
        interFacePath,
        ""
      )}`;
      const targetRequestOptions = {
        ...url.parse(targetUrl),
        method: req.method,
        headers: req.headers,
      };

      console.log("targetRequestOptions", targetRequestOptions);

      const targetReq = http.request(targetRequestOptions);

      req.pipe(targetReq);

      let responseData = [];
      targetReq.on("response", (targetRes) => {
        res.writeHead(targetRes.statusCode, targetRes.headers);

        targetRes.on("data", (chunk) => {
          responseData.push(chunk);
        });

        targetRes.on("end", async () => {
          const responseBody = Buffer.concat(responseData).toString();

          try {
            const jsonData = JSON.parse(responseBody);

            const { isHasProxyUrl, proxyData } = findAndReplaceUrlWithInfo(
              jsonData,
              extractBaseUrl(forwardUrl),
              `http://${global.network}:${global.serverPort}/`
            );

            /* 存在需跳转的环境地址链接对结果值改造 */
            if (isHasProxyUrl) {
              /* 写入响应数据 */
              const data = {
                originalUrl: req.originalUrl,
                // data: JSON.stringify(jsonData, null, 2),
                data: proxyData,
              };
              console.log("data");
              await writeFile({
                data,
                folderPath: "/response",
                type: "res",
                name: req.originalUrl,
              });

              console.log("jsonData", jsonData);
              // 发送修改后的响应体
              res.end(JSON.stringify(jsonData));

              return;
            }

            /* 测试 */
            jsonData.someProperty = "modifiedValue";
            console.log("jsonData", jsonData);
            res.end(JSON.stringify(jsonData));
          } catch (error) {
            // 如果不是JSON响应或解析失败，直接转发原始响应体
            res.end(responseBody);
          }
        });
      });

      targetReq.on("error", (error) => {
        console.error("Proxy error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("An error occurred while trying to proxy the request.");
      });
    } else {
      // 如果请求路径不需要代理，则调用下一个中间件
      next();
    }
  };
};

module.exports = {
  appProxyMiddleware,
  interFaceProxyMiddleware,
  assetProxyMiddleware,
  getInterFaceProxy,
};
