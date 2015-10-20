# jest-webpack-alias

Preprocessor for Jest that is able to resolve `require()` statements using webpack aliases.

[![NPM](https://nodei.co/npm/jest-webpack-alias.png)](https://nodei.co/npm/jest-webpack-alias/)

See also [transform-jest-deps](https://github.com/Ticketmaster/transform-jest-deps).

## Install

```sh
npm install --save-dev jest-webpack-alias
```

## Examples

File `__tests__/preprocess.js`:

```js
var _ = require('lodash');
var babelJest = require('babel-jest');
var path = require('path');
var webpackAlias = require('jest-webpack-alias');

// Change these to point to your source and test directories
var dirs = ['../lib', '../__tests__'].map(function(dir) {
  return path.resolve(__dirname, dir);
});

function matches(filename) {
  return _.find(dirs, function(dir) {
    return filename.indexOf(dir) === 0;
  });
}

module.exports = {
  process: function(src, filename) {
    if (matches(filename)) {
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
    // Required. If non-null value provided, will expect to find your webpack
    // config stored at this key. Set to null for a regular webpack config file.
    "webpackProfile": null

    // optional, default is 'webpack.config.js'
    "webpackConfigPath": 'webpack/config.dev.js'
  }
}
```

## Missing features

This module does not yet support:

- `resolve.alias` settings whose values are absolute paths

## License

MIT
