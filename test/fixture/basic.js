var rewire = require('rewire');
var sinon = require('sinon');
var unwin = require('unwin');

var readdir = {
  '/top': ['node_modules', 'package.json', 'src', 'test', 'web_modules', 'webpack.config.js'],
  '/top/node_modules': ['node1', 'node2'],
  '/top/node_modules/node1': ['lib'],
  '/top/node_modules/node1/lib': ['submodule.js'],
  '/top/web_modules': ['web1', 'web2.jsx'],
  '/top/src': ['dir1', 'dir2'],
  '/top/src/dir1': ['lib1a.js', 'lib1b-2b.js', 'dir1-1'],
  '/top/src/dir2': ['lib2a.js', 'lib1b-2b.js'],
  '/top/test': ['file1.test.js', 'file2.test.js']
};

var webpackProfile = 'dev';

var webpackSettings = {};
webpackSettings[webpackProfile] = {
  resolve: {
    root: ['/top/src', '/top/bogus_dir'],
    extensions: ["", ".js", ".jsx"],
    // omitted: fallback
    // omitted: modulesDirectories
    alias: {
      aliasSrc: 'aliasDest'
    }
  }
};

var requireContents = {
  '/top/webpack.config.js': webpackSettings
};

var readFile = {
  '/top/package.json': JSON.stringify({
    'jest-webpack-alias': {
      webpackProfile: webpackProfile
    }
  })
};

function getDirHas() {
  var dirHas = rewire('../../lib/dirHas');

  var fs = {
    readdirSync: sinon.spy(function(inPath) {
      var dirList = readdir[inPath];
      if (!dirList) {
        throw new Error('unmocked readdirSync for path ' + inPath);
      }
      return dirList;
    })
  };
  dirHas.__set__('fs', fs);

  return {
    cache: dirHas.__get__('cache'),
    dirHas: dirHas,
    fs: fs,
    readdir: readdir
  };
}

function getWebpackInfo() {
  var webpackInfo = rewire('../../lib/webpackInfo');

  var fakeRequire = sinon.spy(function(inPath) {
    return requireContents[unwin(inPath)] || require(inPath);
  });
  webpackInfo.__set__('require', fakeRequire);

  var pkginfo = {
    read: sinon.spy(function(pmodule, dir) {
      return {
        dir: '/top/package.json', // misleading key name. lame.
        'package': JSON.parse(readFile['/top/package.json'])
      };
    })
  };
  webpackInfo.__set__('pkginfo', pkginfo);

  return {
    pkginfo: pkginfo,
    readFile: readFile,
    require: fakeRequire,
    requireContents: requireContents,
    webpackInfo: webpackInfo,
    webpackProfile: webpackProfile
  };
}

function getWebpackAlias() {
  var webpackAlias = rewire('../../lib/preprocessor');

  var fs = {
    existsSync: sinon.spy(function(inPath) {
      return !!readdir[inPath];
    })
  };
  webpackAlias.__set__('fs', fs);

  var setup = getDirHas();
  var dirHas = sinon.spy(setup.dirHas);
  webpackAlias.__set__('dirHas', dirHas);

  setup = getWebpackInfo();
  var webpackInfo = setup.webpackInfo;
  webpackInfo.read = sinon.spy(webpackInfo.read);
  webpackAlias.__set__('webpackInfo', webpackInfo);

  return {
    dirHas: dirHas,
    fs: fs,
    webpackAlias: webpackAlias,
    webpackInfo: webpackInfo
  };
}

exports.getDirHas = getDirHas;
exports.getWebpackAlias = getWebpackAlias;
exports.getWebpackInfo = getWebpackInfo;
