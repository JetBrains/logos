const sharp = require('sharp');
const File = require('./file');
const { normalizeSVG } = require('./utils');

class TransformRule {
  /**
   * @param {Object|string} options
   * @property {number} options.width
   * @property {number} options.height
   * @property {number} options.paddingH
   */
  constructor(options) {
    this.width = options.width;
    this.height = options.height;
    this.paddingH = options.paddingH;
  }

  get options() {
    const {width, height, paddingH} = this;
    return {
      width,
      height,
      paddingH
    }
  }

  /**
   * @param {File} file
   * @return {Promise<File>}
   */
  transformToPNG(file) {
    const { path } = file;
    const normalizedContent = normalizeSVG(file.content);

    return sharp(Buffer.from(normalizedContent))
      .resize({
        width: this.width - this.paddingH * 2,
        height: this.height,
        fit: 'contain',
        background: {r: 0, g: 0, b: 0, alpha: 0}
      })
      .extend({
        right: this.paddingH,
        left: this.paddingH,
        background: {r: 0, g: 0, b: 0, alpha: 0}
      })
      .png()
      .toBuffer({resolveWithObject: true})
      .then(({data, info}) => {
        if (info.width !== this.width || info.height !== this.height) {
          console.error('Error details', this.options, file.filename, info);
          throw new Error('Resulting Image size is not equal to rule size');
        }
        const newFilepath = path.replace(/\.svg$/, '.png');
        return new File(newFilepath, data);
      });
  }
}

module.exports = TransformRule;
