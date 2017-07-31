var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var readmeFile = fs.readFileSync(path.resolve(__dirname, 'README.md'));
var metasPattern = /(^<(?:link|meta).+>$)/mig;
var metas = readmeFile.toString().match(metasPattern);

function getMetas(processFilename) {
  function processor(meta) {
    return meta.replace(/((?:href|content)=")([^"#]+)(")/, function (match, prefix, file, suffix) {
      return prefix +  processFilename(file) + suffix;
    });
  }

  return processFilename ? metas.map(processor) : metas;
}

function getFiles(product) {
  if (typeof product !== 'string') {
    throw new Error('Product directory name is required as argument');
  }

  function resolve(file) {
    return path.resolve(__dirname, product, file);
  }

  var files = [];

  getMetas(function(file) {
    files.push(resolve(file));
  });

  return files;
}
/**
 * @param {String} folderName containing files
 * @param {Boolean|Function} [hash] function or MD5 hash of file contents if `true`
 * @param {Function} [processFilename] function to pass to `getMetas` internal call
 */
function getInfo(folderName, hash, processFilename) {
  /**
   * @param {string} fileWithPath
   */
  var defaultHashGenerator = function(fileWithPath) {
    var md5sum = crypto.createHash('md5');
    md5sum.update(fs.readFileSync(fileWithPath));
    return md5sum.digest('hex');
  };

  return getMetas(processFilename).map(function(meta) {
    var item = {meta: meta};
    var fileName = meta.replace(/^.*((?:href|content)=")([^"#]+)(").*$/, '\$2');

    if (fileName !== meta) {
      var fileWithPath = path.resolve(__dirname, folderName, fileName);
      item.file = fileWithPath;

      if (hash) {
        item.hash = typeof hash === 'function' ?
          hash(fileWithPath) :
          defaultHashGenerator(fileWithPath);
        
        item.meta = item.meta.replace(/((?:href|content)=")([^"#]+)(")/, function (match, prefix, file, suffix) {
          return prefix + file + '?' + item.hash + suffix;
        });
      }
    }

    return item;
  });
}

module.exports = {
  getMetas: getMetas,
  getFiles: getFiles,
  getInfo: getInfo
};
