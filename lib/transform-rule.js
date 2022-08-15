const sharp = require('sharp');
const File = require('./file');
const { normalizeSVG, transformSVG } = require('./utils');

class TransformRule {
  /**
   * @param {Object|string} options
   * @property {number} options.width
   * @property {number} options.height
   * @property {number} [options.offset]
   * @property {number} [options.offsetX]
   * @property {number} [options.offsetY]
   * @property {number} [options.imageWidth]
   */
  constructor(options) {
    let opts = {};

    if (typeof options === 'string') {
      const parts = options.split(' ').map(parseFloat);

      ['width', 'height', 'offsetX', 'offsetY', 'imageWidth']
        .forEach((name, i) => opts[name] = parts[i]);
    } else {
      opts = options;
    }

    this.width = opts.width;
    this.height = opts.height;
    this.offset = opts.offset;
    this.offsetX = opts.offsetX;
    this.offsetY = opts.offsetY;
    this.imageWidth = opts.imageWidth;
  }

  get options() {
    const { width, height, offset, offsetX, offsetY, imageWidth } = this;
    return {
      width,
      height,
      offset,
      offsetX,
      offsetY,
      imageWidth
    }
  }

  /**
   * @param {File} file
   * @return {string}
   */
  transform(file) {
    const { path, content } = file;
    const normalizedContent = normalizeSVG(content);
    const transformedContent = transformSVG(normalizedContent, this);
    return transformedContent;
  }

  /**
   * @param {File} file
   * @return {Promise<File>}
   */
  transformToPNG(file) {
    const { path } = file;
    const transformedContent = this.transform(file);

    return sharp(Buffer.from(transformedContent))
      .png()
      .toBuffer()
      .then(buffer => {
        const newFilepath = path.replace(/\.svg$/, '.png');
        return new File(newFilepath, buffer);
      });
  }
}

module.exports = TransformRule;
