var path = require('path');

function getElementType(attrs) {
  attrs = attrs || '';
  var match = attrs.match(/\btype=["']?(\w+\/\w+)\b["']?/);
  return match && match[1];
}
function parseStyleTag(src) {
  var style = /<style\b([^>]*)>([\s\S]*?)<\/style>?/gmi,
      cache = {},
      lines;

  src = src.replace(style, function (m, attrs, content, index) {
    if (getElementType(attrs) === 'text/less') {
      var name = `style_${index}.less`;
      cache[name] = content;
      return `@{${name}}`;
    }
    return m;
  });
  lines = src.split('\n').map((i) => {
    var match = i.match(/@{(.+)}/);
    if (match && match[1]) { return cache[match[1]]; }
    return '';
  });
  return lines.join('\n');
}
module.exports = {
  install: function(less, pluginManager) {
    pluginManager.addPreProcessor({
      process: function (src, extra) {
        if (path.extname(extra.fileInfo.filename) === '.html') {
          return parseStyleTag(src);
        }
        return src;
      }
    });
  }
};
