const cheerio = require('cheerio');
const calculateTransformation = require('./calculate-transform-props');

/**
 * @param {TransformRule} rule
 * @param {string} content
 * @returns {string}
 */
function transformSvg(content, rule) {
  const $ = cheerio.load(content.toString(), { xmlMode: true });
  const $svg = $('svg');
  let {width, height} = $svg.attr();
  width = parseFloat(width);
  height = parseFloat(height);

  const r = Object.assign({}, rule.options, null);

  if (typeof r.height === 'undefined') {
    r.height = (height / width) * r.width;
  } else if (typeof r.width === 'undefined') {
    r.width = (width / height) * r.height;
  }

  const res = calculateTransformation(width, height, r);

  $svg
    .attr('width', `${res.width}px`)
    .attr('height', `${res.height}px`)
    .removeAttr('viewBox')
    .children()
    .wrap($(`<g transform="translate(${res.translateX} ${res.translateY}) scale(${res.scale})"></g>`));

  return $.html();
}

module.exports = transformSvg;
