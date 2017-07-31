const path = require('path');
const Promise = require('bluebird');
const { FileSet, Archive, utils } = require('../lib');
const config = require('./generate-assets.config');

const cli = utils.getCLIArgs();

if (!cli['dist']) {
  console.error('--dist key is missing');
  process.exit(1);
}

const rootDir = path.resolve(__dirname, '..');
const logosDir = path.resolve(rootDir, 'web');
const distDir = path.resolve(rootDir, cli['dist']);
const archives = new Map();

Promise.map(config.sets, (data) => {
  const pattern = typeof data.pattern === 'string' ? [data.pattern] : data.pattern;
  const absPattern = pattern.map(p => `${logosDir}/${p}`);
  const setData = Object.assign(data, { pattern: absPattern });

  return FileSet.create(setData).then((set) => Promise.map(set.files, (file) => {
    const archivePath = setData.archivePath(file);
    let archive = archives.get(archivePath);

    if (!archives.has(archivePath)) {
      const archiveAbsPath = path.resolve(distDir, archivePath);
      archive = new Archive(archiveAbsPath);
      archives.set(archivePath, archive);
    }

    return setData.action(file, archive).then(() => {
      const p = path.relative(logosDir, file.path);
      console.log(p);
    });
  }));
})
  .then(() => Promise.map(archives.values(), (arch) => {
    return arch.finalize();
  }))
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
});
