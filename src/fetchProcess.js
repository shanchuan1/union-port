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
    return Promise.reject(error);
  }
}

module.exports = fetchProcess;
