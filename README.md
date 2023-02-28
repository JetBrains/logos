# JetBrains logos and branding materials

[![official JetBrains project](http://jb.gg/badges/official-flat-square.svg)](https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub)
[![npm (scoped)](https://img.shields.io/npm/v/@jetbrains/logos.svg?style=flat-square)](https://www.npmjs.com/package/@jetbrains/logos)

## Usage guidelines

Please review the [Brand Guidelines](https://www.jetbrains.com/company/brand) to get acquainted with our dos and don'ts. 
If in doubt, please contact [marketing@jetbrains.com](mailto:marketing@jetbrains.com).

## Install

```
npm install @jetbrains/logos
```

## Build

```
npm run build
```

## Deploy
See [JetBrains Logos](https://github.com/JetBrains/www.jetbrains.com/blob/master/docs/JetBrains-logos.md#jetbrains-logos)

https://github.com/JetBrains/www.jetbrains.com/blob/master/docs/JetBrains-logos.md#jetbrains-logos

## Usage in React

```js
import { AppcodeLogo, AppcodeTextLogo } from '@jetbrains/logos/react';

...

<div>
  <AppcodeLogo />
  <AppcodeTextLogo fill="white" />
</div>
```

## Node API

### Base directory

`index.js` allows to obtain package dirname:

```js
const logosPath = require('@jetbrains/logos'); // '/path/to/project/node_modules/jetbrains-logos/'
```

### Files and metas

`logos.js` allows to obtain the list of resources for a given product as well as HTML markup with all the necessary meta tags:

```js
const utils = require('@jetbrains/logos/logos');

const product = 'hub';
const files = utils.getFiles(/* required */product);

/* Returns an array of absolute paths to files:
[ 
  '/path/to/project/node_modules/jetbrains-logos/hub/favicon.ico',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-57x57.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-60x60.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-72x72.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-76x76.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-114x114.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-120x120.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-144x144.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-152x152.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-180x180.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-mask-icon.svg',
  '/path/to/project/node_modules/jetbrains-logos/hub/mstile-144x144.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/mstile-70x70.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/mstile-150x150.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/mstile-310x150.png',
  '/path/to/project/node_modules/jetbrains-logos/hub/mstile-310x310.png'
]
*/
```

```js
const utils = require('@jetbrains/logos/utils');

// An optional filename processor
function processor(filename) {
  return filename;
}

const metas = utils.getMetas(/* optional */processor);

/* Returns the list of meta tags:
<link rel="shortcut icon" href="favicon.ico" type="image/x-icon" sizes="16x16 32x32"/>
<link rel="apple-touch-icon" sizes="57x57" href="apple-touch-icon-57x57.png"/>
<link rel="apple-touch-icon" sizes="60x60" href="apple-touch-icon-60x60.png"/>
<link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72.png"/>
<link rel="apple-touch-icon" sizes="76x76" href="apple-touch-icon-76x76.png"/>
<link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114.png"/>
<link rel="apple-touch-icon" sizes="120x120" href="apple-touch-icon-120x120.png"/>
<link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144.png"/>
<link rel="apple-touch-icon" sizes="152x152" href="apple-touch-icon-152x152.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon-180x180.png"/>
<link rel="mask-icon" href="apple-mask-icon.svg" color="black"/>
<meta name="msapplication-TileColor" content="#000000"/>
<meta name="msapplication-TileImage" content="mstile-144x144.png"/>
<meta name="msapplication-square70x70logo" content="mstile-70x70.png"/>
<meta name="msapplication-square150x150logo" content="mstile-150x150.png"/>
<meta name="msapplication-wide310x150logo" content="mstile-310x150.png"/>
<meta name="msapplication-square310x310logo" content="mstile-310x310.png"/>
<meta property="og:title" content="%website_title%" />
<meta property="og:type" content="website" />
<meta property="og:url" content="%website_url%" />
<meta property="og:image" content="og-image-1200x630.png" />
*/
```
`getMetas()` will not output OpenGraph tags unless configured. Make sure to call `configure()` before calling `getMetas()` 
and pass it a configuration object with `url` and `title` keys: 

```js
const utils = require('@jetbrains/logos/logos');

utils.configure({
  url: 'https://teamcity.jetbrains.com',
  title: 'TeamCity CI'
});

utils.getMetas()
```
