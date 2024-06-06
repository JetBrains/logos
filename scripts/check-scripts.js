const ind = require('../dist/web/logos.js');

console.log('Checking exported scripts...');

const info = ind.getInfo('youtrack', true);
console.log('getInfo(\'youtrack\', true)', info);
const files = ind.getFiles('youtrack');
console.log('getFiles(\'youtrack\')', files);
const metas = ind.getMetas(file => `/${file}`);
console.log('getMetas(file => `/${file}`)', metas);

console.log('Exported functions called with no errors');
