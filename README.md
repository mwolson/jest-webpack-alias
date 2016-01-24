# jest-webpack-alias

Preprocessor for Jest that is able to resolve `require()` statements using webpack aliases.

See also [transform-jest-deps](https://github.com/Ticketmaster/transform-jest-deps).

## Install

```sh
npm install --save-dev jest-webpack-alias
```

## Setup

File `__tests__/preprocessor.js`:

```js
var babelJest = require('babel-jest');
// Uncomment this to support ES6 'import' statements:
// require('babel-register');
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

## Manual package resolution

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

## Non-javascript package resolution.

Code like this will fail, because it is resolved by webpack loader.

File: `main.js`
```js
require('./style.css');
...
```

File: `__tests__/main.js`
```js
jest.dontMock('../main.js');
require('../main.js');
...
```

The workaround for this is to use [Manual Mocks](https://github.com/facebook/jest/blob/master/docs/ManualMocks.md).

#### Example

Project structure:
```
--+ /            
    +- src /            
    |      +- main.js
    |      +- style.css
    +- __tests__ / src / main.js
    +- __mocks__ / src / style.css
    +- package.json
    +- webpack.config.js
    +- node_modules /
```

File: `src/main.js`
```
...
require('style.scss');
...
```

File: `__tests__/src/main.js`
```
jest.dontMock('../../src/main');
var main = require('../../src/main');
...
```

File: `__mocks__/src/style.scss`
```
module.exports = 'src/style.scss';
```

## package.json options

- `jest-webpack-alias.configFile`: Optional, default is `"webpack.config.js"`. If provided, this should be a path
  fragment relative to your `package.json` file.  Example: `"webpack/config.dev.js"`.

- `jest-webpack-alias.profile`: Optional. If provided, will expect your webpack config to be an array of profiles, and
  will match against the `name` field of each to choose a webpack config that applies to your Jest tests. See
  https://github.com/webpack/webpack/tree/master/examples/multi-compiler for an example of this kind of setup.

## Known issues

- `resolve.alias` settings whose values are absolute paths might not work
- `resolve.modulesDirectories` only searches the directory containing your package.json file, not all ancestors of current file

## License

MIT
