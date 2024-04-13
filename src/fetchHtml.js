const fetchProcess = require("./fetchProcess");
const path = require("path");
const { getFindMapToValue } = require("./dataMap");

const joinPath = (folderPath,pathFile) => {
  return path.join(__dirname, `public${folderPath}`, pathFile);
};

const getFetchProcess = (currentUrl) => {
  console.log("🚀 ~ getFetchProcess ~ currentUrl:", currentUrl);
  const { appPath, forwardUrl: url } =
    currentUrl && getFindMapToValue(currentUrl);
    console.log('global network',  global.network);
  console.log("🚀 ~ getFetchProcess ~ url:", url);

  const fetchOptions = {
    url,
    appPath,
    outputFile: joinPath( currentUrl,"index.html"),
  };
  fetchProcess(fetchOptions)
    .then(() => {
      console.log(
        `Successfully processed and wrote HTML content to public${currentUrl}/index.html`
      );
    })
    .catch((error) => {
      console.error("Error processing frontend content:", error);
    });
};

module.exports = {
  getFetchProcess,
};
