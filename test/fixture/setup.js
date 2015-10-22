var rewire = require('rewire');
var sinon = require('sinon');
var unwin = require('unwin');

function Setup() {}

Setup.prototype.getDirHas = function getDirHas() {
  var dirHas = rewire('../../lib/dirHas');

  var fs = {
    readdirSync: sinon.spy(function(inPath) {
      inPath = unwin(inPath);
      var dirList = this.readdir[inPath];
      if (!dirList) {
        throw new Error('unmocked readdirSync for path ' + inPath);
      }
      return dirList;
    }.bind(this))
  };
  dirHas.__set__('fs', fs);

  return {
    cache: dirHas.__get__('cache'),
    dirHas: dirHas,
    fs: fs,
    readdir: this.readdir
  };
};

Setup.prototype.getWebpackInfo = function getWebpackInfo() {
  var webpackInfo = rewire('../../lib/webpackInfo');

  var fakeRequire = sinon.spy(function(inPath) {
    return this.requireContents[unwin(inPath)] || require(inPath);
  }.bind(this));
  webpackInfo.__set__('require', fakeRequire);

  var pkginfo = {
    read: sinon.spy(function(pmodule, dir) {
      return {
        dir: '/top/package.json', // misleading key name. lame.
        'package': JSON.parse(this.readFile['/top/package.json'])
      };
    }.bind(this))
  };
  webpackInfo.__set__('pkginfo', pkginfo);

  return {
    pkginfo: pkginfo,
    readFile: this.readFile,
    require: fakeRequire,
    requireContents: this.requireContents,
    webpackInfo: webpackInfo,
    webpackProfile: this.webpackProfile
  };
};

Setup.prototype.getWebpackAlias = function getWebpackAlias() {
  var webpackAlias = rewire('../../lib/preprocessor');

  var fs = {
    existsSync: sinon.spy(function(inPath) {
      return !!this.readdir[unwin(inPath)];
    }.bind(this))
  };
  webpackAlias.__set__('fs', fs);

  var setup = this.getDirHas();
  var dirHas = sinon.spy(setup.dirHas);
  webpackAlias.__set__('dirHas', dirHas);

  setup = this.getWebpackInfo();
  var webpackInfo = setup.webpackInfo;
  webpackInfo.read = sinon.spy(webpackInfo.read);
  webpackAlias.__set__('webpackInfo', webpackInfo);

  return {
    dirHas: dirHas,
    fs: fs,
    webpackAlias: webpackAlias,
    webpackInfo: webpackInfo
  };
};

Setup.prototype.getExports = function getExports() {
  return {
    getDirHas: this.getDirHas.bind(this),
    getWebpackAlias: this.getWebpackAlias.bind(this),
    getWebpackInfo: this.getWebpackInfo.bind(this)
  };
};

module.exports = Setup;
