const cheerio = require("cheerio");

const getPresetContent = ({forwardLocalUrl, forwardNetWorkUrl}) => {
  return `
    <script type="text/javascript">
      window.addEventListener("load", ()=>{
        const {href, origin, pathname, search } = window.location;
        const currentOrigin = origin;
        const presetOriginLocal = '${forwardLocalUrl}';
        const presetOriginNetWork = '${forwardNetWorkUrl}';
        if (currentOrigin !== presetOriginLocal && currentOrigin !== presetOriginNetWork) {
          window.location.href = presetOrigin + pathname + search;
        }
      });
    </script>
    `;
};

/* 转为本地服务对应的index.html文件*/
function processHtml({
  htmlData,
  prefixPath = "/h5",
  rewriteScriptSrc = true,
  forwardNetWorkUrl = `http://${global.network}:${global.serverPort}`,
  forwardLocalUrl = `http://localhost:${global.serverPort}`,
}) {
  const presetContent = getPresetContent({forwardLocalUrl, forwardNetWorkUrl});
  const $ = cheerio.load(htmlData);

  // 移除所有带有rel="prefetch"属性的link标签
  $('link[rel="prefetch"]').remove();

  // 对script和link标签添加前缀
  ["script", "link"].forEach((tagName) => {
    $(`${tagName}[src], ${tagName}[href]`).each((i, el) => {
      const $el = $(el);
      let attrValue = tagName === "script" ? $el.attr("src") : $el.attr("href");
      attrValue = attrValue.startsWith(prefixPath)
        ? attrValue
        : `${prefixPath}${attrValue}`;

      // 对script标签特殊处理，去除哈希值
      if (tagName === "script" && rewriteScriptSrc) {
        attrValue = attrValue.replace(/\.[^.]+\.js$/, ".js");
      }

      $el.attr(tagName === "script" ? "src" : "href", attrValue);
    });
  });

  // 修改特定script标签的src属性
  $('script[src="/h5/static/js/index.js"]').attr("src", "/h5/static/js/app.js");

  // 在<head>标签末尾插入JavaScript代码
  const head = $("head");
  const lastChild = head.children().last();
  const scriptInserted = lastChild.is('script[type="text/javascript"]')
    ? lastChild
    : false;

  if (!scriptInserted) {
    head.append(`${presetContent}`);
  } else {
    scriptInserted.after(`${presetContent}`);
  }

  // 获取修改后的HTML内容
  const transformedHtmlData = $.html();

  return transformedHtmlData;
}

module.exports = processHtml;
