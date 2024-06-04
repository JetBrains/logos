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
  '/path/to/project/node_modules/jetbrains-logos/hub/apple-touch-icon-180x180.png'
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
<meta name="msapplication-TileColor" content="#000000"/>
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
