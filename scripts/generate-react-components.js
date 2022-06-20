const Path = require('path');
const { promisify } = require('util');

const glob = promisify(require('glob-all'));
const { readFile, readJson, outputFile } = require('fs-extra');
const SVGO = require('svgo');
const svgr = require('@svgr/core').default;
const Case = require('case');
const buble = require('buble');

(async () => {
  const ROOT_DIR = Path.resolve(__dirname, '..');
  const LOGOS_DIR = Path.resolve(__dirname, '../dist/web');

  const svgoConfig = await readJson(`${ROOT_DIR}/.svgorc`);
  const svgo = new SVGO(svgoConfig);

  const svgrConfig = {
    dimensions: false,
    plugins: ['@svgr/plugin-jsx', '@svgr/plugin-prettier'],
    jsx: {
      babelConfig: {
        plugins: ['react-inline-svg-unique-id']
      }
    }
  };

  const paths = await glob(`${LOGOS_DIR}/*/*.svg`, {
    ignore: [
      '**/apple-mask-icon.svg'
    ]
  });

  const imports = [];

  for (const svgPath of paths) {
    const basename = Path.basename(svgPath, Path.extname(svgPath));
    const componentName = `${Case.pascal(basename)}Logo`;
    const sourceSvg = (await readFile(svgPath)).toString();
    const { data: svg } = await svgo.optimize(sourceSvg, { path: svgPath });

    const jsx = await svgr(svg, svgrConfig, { componentName });
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
    Path.resolve(LOGOS_DIR, 'react.js'),
    imports.join(';\n')
  );
})();
