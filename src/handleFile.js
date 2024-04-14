const _ = require("lodash");
const path = require("path");
const util = require("util");
const fs = require("fs");

const joinPath = (folderPath, pathFile) => {
  return path.join(__dirname, `../log${folderPath}`, pathFile);
};

/* 转换请求路径为name
/api/services/log  ===>  api_service_log
*/
const convertPathToSnakeCase = (path) => {
  let normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  let snakeCasePath = normalizedPath
    .replace(/\//g, "_")
    .replace(/-/g, "_")
    .toLowerCase();
  return snakeCasePath;
};

const writeFile = async ({ data, folderPath, name = "index", type }) => {
  let writeInfo = "";
  writeInfo = data;
  if (type && ["req", "res"].includes(type)) {
    // 对象序列格式化
    writeInfo = util.inspect(data, { depth: null });
  }

  const transformName = convertPathToSnakeCase(name);
  const path = joinPath(folderPath, `${transformName}.js`);

  // 写入文件
  await fs.writeFile(path, writeInfo, "utf8", (err) => {
    if (err) {
      console.error("Failed to write request data to file:", err);
    } else {
      console.log(`Request data has been written to ${path}.json`);
    }
  });
};

module.exports = {
  writeFile,
};
