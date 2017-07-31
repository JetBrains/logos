/**
 * @param {number} originWidth
 * @param {number} originHeight
 * @param {TransformRule} [rule]
 * @returns {{width: number, height: number, translateX: number, translateY: number, scale: number}}
 */
function calculateTransformProps(originWidth, originHeight, rule = null) {
  const originGreaterDimension = originWidth > originHeight ? originWidth : originHeight;

  const {
    width = originWidth,
    height = originHeight,
    offsetX = rule && rule.offset || 0,
    offsetY = rule && rule.offset || 0,
    imageWidth = width - (offsetX * 2)
  } = rule || {};

  const scale = imageWidth / originGreaterDimension;
  const translateX = offsetX === 0 ? (width - imageWidth) / 2 : offsetX;
  const translateY = offsetY === 0 ? (height - (scale * originHeight)) / 2 : offsetY;

  return {
    width,
    height,
    translateX,
    translateY,
    scale
  }
}

module.exports = calculateTransformProps;
