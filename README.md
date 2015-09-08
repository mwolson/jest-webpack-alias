# jest-webpack-alias

Preprocessor for Jest that is able to resolve `require()` statements using webpack aliases.

[![NPM](https://nodei.co/npm/jest-webpack-alias.png)](https://nodei.co/npm/jest-webpack-alias/)

## Install

```sh
npm install --save-dev jest-webpack-alias
```

## Examples

File `__tests__/preprocess.js`:

```js
var babelJest = require('babel-jest');
var webpackAlias = require('jest-webpack-alias');

module.exports = {
  process: function(src, filename) {
    src = babelJest.process(src, filename);
    src = webpackAlias.process(src, filename);
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
    "scriptPreprocessor": "<rootDir>/__tests__/preprocess.js",
    ...
  }
}
```

## License

MIT
