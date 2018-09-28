const path = require('path');
const Promise = require('bluebird');
const { FileSet, TransformRule } = require('../lib');
const config = require('./generate-logos.config');

const rootDir = path.resolve(__dirname, '..');
const logosDir = path.resolve(rootDir, 'web');
const distDir = path.resolve(rootDir, 'dist/web');
const rules = new Map();

Object.keys(config).forEach((id) => {
  rules.set(id, new TransformRule(config[id]));
});

FileSet.create({
  pattern: '*/*.{svg,ico}',
  cwd: logosDir
}).then(({ files }) => {
  return Promise.mapSeries(files, (file) => {
    const { basename, dirname, filename } = file;
    const copyPromise = file.copy(`${distDir}/${dirname}/${filename}`);

    if (basename === dirname) {
      console.log('Converting file into PNG set:', filename)
      return copyPromise.then(() => Promise.map(rules.keys(), (ruleId) => {
        return rules.get(ruleId)
          .transformToPNG(file)
          .then(file => file.write(`${distDir}/${dirname}/${ruleId}`));
      }))
        .then(() => console.log('File converted:', filename));
    }

    console.log('Copying file:', filename)
    return copyPromise;
  });
});
