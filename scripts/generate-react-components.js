const Path = require('path');
const { promisify } = require('util');

const glob = promisify(require('glob-all'));
const { readFile, outputFile } = require('fs-extra');
const { optimize, loadConfig } = require('svgo');
const svgr = require('@svgr/core');
const Case = require('case');
const buble = require('buble');

const reactUtils = `// use \`var\` and \`function\` construction for a correct work this code in IE 11
import { createContext, useContext, useState } from 'react';

var uniqueIdPrefixContext = createContext('__GeneratedJBProductLogos__');

export var UniqueLogosIdPrefixProvider = uniqueIdPrefixContext.Provider;

var i = 0;
export var useUniqueId = function(){
  var prefix = useContext(uniqueIdPrefixContext);
  var id = useState(function(){return prefix + i++})[0];
  return id;
};`;

(async () => {
  const LOGOS_DIR = Path.resolve(__dirname, '../dist/web');

  const svgoConfig = await loadConfig();

  const svgrConfig = {
    dimensions: false,
    plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    jsx: {
      babelConfig: {
        // plugins: ['react-inline-svg-unique-id']
        plugins: ['./lib/react-inline-svg-unique-id-babel-plugin.js']
      }
    }
  };

  const paths = await glob(`${LOGOS_DIR}/*/*.svg`, {
    ignore: []
  });

  const imports = [];

  for (const svgPath of paths) {
    const basename = Path.basename(svgPath, Path.extname(svgPath));
    if (basename === 'icon') {
      // Don't generate react versions for "icon", which is effectively a favicon
      continue;
    }
    const componentName = `${Case.pascal(basename)}Logo`;
    const sourceSvg = (await readFile(svgPath)).toString();
    const { data: svg } = optimize(sourceSvg, { path: svgPath, ...svgoConfig });

    const jsx = await svgr.transform(svg, svgrConfig, { componentName });
    const { code: js } = buble.transform(jsx, {
      objectAssign: 'Object.assign',
      transforms: {
        modules: false
      }
    });

    const outputPath = Path.resolve(Path.dirname(svgPath), `${basename}.js`);
    const relativePath = Path.relative(LOGOS_DIR, outputPath);

    imports.push(
      `export { default as ${componentName} } from "./${relativePath}"`
    );

    await outputFile(outputPath, js);
  }

  await outputFile(
    Path.resolve(LOGOS_DIR, 'react-unique-logos-ids.js'),
    reactUtils
  );
  await outputFile(
    Path.resolve(LOGOS_DIR, 'react.js'),
    imports.join(';\n') + ';\nexport { UniqueLogosIdPrefixProvider } from \'./react-unique-logos-ids.js\''
  );
})();
