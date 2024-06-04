const ind = require('../dist/web/logos.js');

console.log('Checking exported scripts...');

const info = ind.getInfo('youtrack', true)
const files = ind.getFiles('youtrack');
const metas = ind.getMetas(file => `/${file}`);

console.log('Exported functions called with no errors');
