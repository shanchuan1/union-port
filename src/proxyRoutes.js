const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const {getFetchProcess} = require("./fetchHtml");

/* app应用地址代理转发 */
const appProxyMiddleware = (url) => {
  return createProxyMiddleware({
    target: url,
    changeOrigin: true,
    onError: (error, req, res) => {
      console.error("Error in H5 proxy:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("An error occurred while trying to proxy H5 requests.");
    },
  });
};

/* app资源拉取返回 */
const assetProxyMiddleware = async (req, res) => {
  var currentUrl = req.originalUrl; // 获取原始请求URL
  console.log("Current URL:", currentUrl);

  await getFetchProcess(currentUrl)
  res.sendFile(path.join(__dirname,   `public${currentUrl}`, "index.html"));
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
      [rewriteKey]: "", // 使用方括号表示法动态创建键
    },
    onError: (error, req, res) => {
      console.error("Error in hospitalweb proxy:", error);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("An error occurred while trying to proxy hospitalweb requests.");
    },
  });
};

module.exports = {
  appProxyMiddleware,
  interFaceProxyMiddleware,
  assetProxyMiddleware
};
