const fetch = require("node-fetch");
const fs = require("fs");
const processHtml = require("./processHtml");

async function fetchProcess(props) {
  const { url, outputFile, ...otherProps } = props;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch html content");
      return;
    }
    const htmlData = await response.text();
    /* 对拉取的index.html进行改造 */
    const transformedHtmlData = processHtml({ htmlData, ...otherProps });
    //   console.log('transformedHtmlData', transformedHtmlData);

    // 返回Promise，将writeFile操作包裹在Promise内部
    return new Promise((resolve, reject) => {
      fs.writeFile(outputFile, transformedHtmlData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error fetching html content:", error);
    // 当fetch或processHtml过程发生错误时，也需要reject这个Promise
    return Promise.reject(error);
  }
}

module.exports = fetchProcess;
