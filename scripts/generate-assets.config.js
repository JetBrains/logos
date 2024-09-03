// TODO simplify
const TransformRule = require('./../lib/transform-rule');

/**
 * @param {File} file
 * @param {Archive} archive
 * @param {Object<string, Object<width:number, height:number>>} rules
 * @return {Promise}
 */
function convertToPNGAndCopyOriginalToArchive(file, archive, rules) {
  const isTextLogo = file.basename.endsWith('-text');
  const rule = new TransformRule(isTextLogo ? rules.textLogo : rules.logo);

  archive.addFile(file.path, file.filename);

  if (file.extension === 'svg') {
    return rule.transformToPNG(file).then((png) => {
      return archive.addFileFromBuffer(png.content, png.filename);
    });
  }

  return Promise.resolve();
}

const rules = {
  logo: { width: 2000 },
  textLogo: { height: 500 }
};

const sets = [
  {
    pattern: 'jetbrains/{jetbrains,jetbrains-variant-?}.svg',
    archivePath: file => `jetbrains/docs/${file.basename}_logos.zip`,
    action: (file, archive) => convertToPNGAndCopyOriginalToArchive(file, archive, rules)
  },

  {
    pattern: 'jetbrains/{jetbrains,jetbrains-variant-?}-grayscale.svg',
    archivePath: file => 'jetbrains/docs/jetbrains-grayscale_logos.zip',
    action: (file, archive) => convertToPNGAndCopyOriginalToArchive(file, archive, rules)
  },

  {
    pattern: 'jetbrains/{jetbrains,jetbrains-variant-?}-blackandwhite.svg',
    archivePath: file => 'jetbrains/docs/jetbrains-blackandwhite_logos.zip',
    action: (file, archive) => convertToPNGAndCopyOriginalToArchive(file, archive, rules)
  },

  {
    pattern: 'jetbrains/*-{reseller,partner}.svg',
    archivePath: file => `jetbrains/docs/${file.basename}_logos.zip`,
    action: (file, archive) => convertToPNGAndCopyOriginalToArchive(file, archive, rules)
  },

  {
    pattern: [
      '*/{boxshot.png,*.pdf}',
      '!jetbrains/**'
    ],
    archivePath: file => `${file.dirname}/docs/${file.dirname}_logos.zip`,
    action: (file, archive) => convertToPNGAndCopyOriginalToArchive(file, archive, rules)
  }
];

module.exports = {
  rules,
  sets
};
