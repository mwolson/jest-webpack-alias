# jest-webpack-alias

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM][npm-image]][npm-url]

Preprocessor for Jest that is able to resolve `require()` statements using webpack aliases.

See also [transform-jest-deps](https://github.com/mwolson/transform-jest-deps).

:warning: **Consider using [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver) for new projects instead of `jest-webpack-alias`. An example setup can be seen at [the Next.js repo](https://github.com/zeit/next.js).**

## Install

```sh
npm install --save-dev jest-webpack-alias
```

## Setup

File `__tests__/preprocessor.js`:

```js
var babelJest = require('babel-jest');
require('babel-register'); // support ES6 'import' statements
var webpackAlias = require('jest-webpack-alias');

module.exports = {
  process: function(src, filename) {
    if (filename.indexOf('node_modules') === -1) {
      src = babelJest.process(src, filename);
      src = webpackAlias.process(src, filename);
    }
    return src;
  }
};
```

File `package.json`:

```
{
  ...
  "jest": {
    ...
    "scriptPreprocessor": "<rootDir>/__tests__/preprocessor.js",
  },
  "jest-webpack-alias": {
    "profile": "dev"
  }
}
```

## Common problems

### Importing CSS and SCSS files

In order to use statements like `require('some-styles.css')` in a testing environment, it's best to use an npm module like [ignore-styles](https://www.npmjs.com/package/ignore-styles) to ignore files that match certain file extensions in `require()` statements.

### Manual package resolution

Code like this will not work, because an AST parser is not smart enough to evaluate variables into strings.

```js
var moduleName = 'myModName';
var computed = require(moduleName);
```

It can be rewritten like this, using the `resolve` function:

```js
var resolve = require('jest-webpack-alias').resolve;
var moduleName = 'myModName';
var computed = require(resolve(moduleName, __filename));
```

## package.json options

- `jest-webpack-alias.configFile`: Optional, default is `"webpack.config.js"`. If provided, this should be a path
  fragment relative to your `package.json` file.  Example: `"webpack/config.dev.js"`.

- `jest-webpack-alias.profile`: Optional. If provided, will expect your webpack config to be an array of profiles, and
  will match against the `name` field of each to choose a webpack config that applies to your Jest tests. See
  https://github.com/webpack/webpack/tree/master/examples/multi-compiler for an example of this kind of setup.

## Known issues

- `resolve.modulesDirectories` only searches the directory containing your package.json file, not all ancestors of current file

## License

MIT

[travis-image]: https://travis-ci.org/mwolson/jest-webpack-alias.svg?branch=master
[travis-url]: https://travis-ci.org/mwolson/jest-webpack-alias

[coveralls-image]: https://coveralls.io/repos/github/mwolson/jest-webpack-alias/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/mwolson/jest-webpack-alias?branch=master

[npm-image]: https://img.shields.io/npm/v/jest-webpack-alias.svg?style=flat
[npm-url]: https://www.npmjs.com/package/jest-webpack-alias
