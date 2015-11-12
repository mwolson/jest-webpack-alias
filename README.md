# jest-webpack-alias

Preprocessor for Jest that is able to resolve `require()` statements using webpack aliases.

See also [transform-jest-deps](https://github.com/Ticketmaster/transform-jest-deps).

## Install

```sh
npm install --save-dev jest-webpack-alias
```

## Examples

File `__tests__/preprocessor.js`:

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
    "profile": "dev"
  }
}
```

## package.json options

- `jest-webpack-alias.configFile`: Optional, default is `"webpack.config.js"`. If provided, this should be a path
  fragment relative to your `package.json` file.  Example: `"webpack/config.dev.js"`.

- `jest-webpack-alias.profile`: Optional. If provided, will expect your webpack config to be an array of profiles, and
  will match against the `name` field of each to choose a webpack config that applies to your Jest tests. See
  https://github.com/webpack/webpack/tree/master/examples/multi-compiler for an example of this kind of setup.

## Missing features

This module does not yet support:

- `resolve.alias` settings whose values are absolute paths

## License

MIT
