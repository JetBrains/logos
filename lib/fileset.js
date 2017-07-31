const path = require('path');
const Promise = require('bluebird');
const glob = require('glob-all');
const File = require('./file');

class FileSet {
  /**
   * @param {File[]} files
   */
  constructor(files) {
    this.files = files;
  }

  /**
   * @param {Object} options
   * @param {string|Array<string>} options.pattern
   * @param {string} [options.ignore]
   * @param {string} [options.cwd]
   * @param {string} [options.root]
   * @return {Promise<File[]>}
   */
  static create(options) {
    const { ignore, cwd = process.cwd() } = options;
    const pattern = typeof options.pattern === 'string' ? [options.pattern] : options.pattern;

    const paths = glob.sync(pattern, {
      absolute: true,
      nodir: true,
      cwd,
      ignore
    });

    return Promise.map(paths, (filepath) => File.create(filepath)).then((files) => new FileSet(files));
  }
}

module.exports = FileSet;
