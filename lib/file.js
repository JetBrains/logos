const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));

class File {
  /**
   * @param {content} path
   * @param {content} [content]
   */
  constructor(path, content) {
    this.path = path;
    this.content = content;
  }

  get filename() {
    return path.basename(this.path);
  }

  get basename() {
    const filename = this.filename;
    return filename.substr(0, filename.lastIndexOf('.'));
  }

  get extension() {
    return path.extname(this.filename).substr(1);
  }

  get dirname() {
    return path.basename(this.dirpath);
  }

  get dirpath() {
    return path.dirname(this.path);
  }

  /**
   * @param {string} filepath
   * @return {Promise<File>}
   */
  static create(filepath) {
    return File.read(filepath).then(content => new File(filepath, content));
  }

  /**
   * @param {string} filepath
   * @return {Promise<string>}
   */
  static read(filepath) {
    return fs.readFileAsync(filepath, 'utf-8');
  }

  /**
   * @param {string} dest
   * @return {Promise}
   */
  copy(dest) {
    return fs.copyAsync(this.path, dest);
  }

  /**
   * @param {string} dest
   * @return {Promise}
   */
  write(dest) {
    return fs.outputFile(dest, this.content);
  }
}

module.exports = File;
