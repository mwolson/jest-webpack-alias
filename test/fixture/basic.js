var Setup = require('./setup');
var fixture = new Setup();

fixture.readdir = {
  '/top': ['node_modules', 'package.json', 'src', 'test', 'web_modules', 'webpack.config.js'],
  '/top/node_modules': ['aliasNodeFileDest.js', 'node1', 'node2'],
  '/top/node_modules/node1': ['lib'],
  '/top/node_modules/node1/lib': ['submodule.js'],
  '/top/web_modules': ['web1', 'web2.jsx'],
  '/top/src': ['aliasRelative.js', 'dir1', 'dir2'],
  '/top/src/dir1': ['lib1a.js', 'lib1b-2b.js', 'dir1-1'],
  '/top/src/dir1/dir1-1': ['lib1-1a.js'],
  '/top/src/dir2': ['lib2a.js', 'lib1b-2b.js'],
  '/top/src/dir3': ['dir3-1'],
  '/top/src/dir3/dir3-1': ['mocked.js'],
  '/top/test': ['file1.test.js', 'file2.test.js', '__mocks__'],
  '/top/test/__mocks__': ['dir3'],
  '/top/test/__mocks__/dir3': ['dir3-1'],
  '/top/test/__mocks__/dir3/dir3-1': ['mocked.js']
};

var webpackProfile = fixture.webpackProfile = 'dev';

var webpackSettings = fixture.webpackSettings = [
  {
    name: 'wrongProfile'
  },
  {
    otherField: 'nope'
  },
  {
    name: webpackProfile,
    resolve: {
      root: ['/top/test/__mocks__', '/top/src', '/top/bogus_dir'],
      extensions: ["", ".js", ".jsx"],
      // omitted: fallback
      // omitted: modulesDirectories
      alias: {
        aliasNodeSubdir1Src: 'node1',
        aliasNodeSubdir2Src: 'node1/lib/submodule',
        aliasNodeFileSrc: 'aliasNodeFileDest',
        aliasPlainSubdirSrc: 'dir1/lib1a'
      }
    }
  }
];

fixture.requireContents = {
  '/top/webpack.config.js': webpackSettings
};

fixture.readFile = {
  '/top/package.json': JSON.stringify({
    'jest-webpack-alias': {
      profile: webpackProfile
    }
  })
};

module.exports = fixture.getExports();
