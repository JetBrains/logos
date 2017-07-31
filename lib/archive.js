const path = require('path');
const fs = require('fs');
const Archiver = require('archiver-promise');
const mkdirp = require('mkdirp');

class Archive {
  /**
   * @param {string} archivePath
   */
  constructor(archivePath) {
    mkdirp.sync(path.dirname(archivePath));

    const archive = Archiver(archivePath, {
      zlib: { level: 9 }
    });

    this._archive = archive;
  }

  /**
   * @param {string} sourcePath
   * @param {string} filename - Final relative file path from the archive root
   */
  addFile(sourcePath, filename) {
    return this._archive.file(sourcePath, { name: filename });
  }

  /**
   * @param {Buffer} buffer
   * @param {string} filename - Final relative file path from the archive root
   */
  addFileFromBuffer(buffer, filename) {
    return this._archive.append(buffer, { name: filename })
  }

  finalize() {
    return this._archive.finalize();
  }
}

module.exports = Archive;
