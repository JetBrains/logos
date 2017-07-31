const cheerio = require('cheerio');

/**
 * @param {string} content
 * @returns {string}
 */
function normalizeSvg(content) {
  const $ = cheerio.load(content.toString(), { xmlMode: true });
  const $svg = $('svg');

  let {width, height, viewBox} = $svg.attr();

  if (viewBox) {
    let parts = viewBox.split(' ');
    width = parts[2];
    height = parts[3];
  } else if (!width || !height) {
    throw new Error('SVG image should have at least width/height or viewBox attributes');
  }

  $svg.attr('width', `${width}px`);
  $svg.attr('height', `${height}px`);

  return $.html();
}

module.exports = normalizeSvg;
