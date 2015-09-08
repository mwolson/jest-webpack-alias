var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var cacheize = require('../lib/cacheize');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');

describe('jest-webpack-alias module', function() {

  var aliasDirs, dirHas, webpackAlias, webpackInfo;

  function setup() {
    aliasDirs = ['/top/src', '/top/node_modules', '/top/web_modules'];
    webpackAlias = rewire('../lib/preprocessor');

    var setup = basicFixture.getDirHas();
    dirHas = sinon.spy(setup.dirHas);
    webpackAlias.__set__('dirHas', dirHas);

    setup = basicFixture.getWebpackInfo();
    webpackInfo = setup.webpackInfo;
    webpackInfo.read = sinon.spy(webpackInfo.read);
    webpackAlias.__set__('webpackInfo', webpackInfo);
  }

  beforeEach(setup);

  describe('with file hit in first dir', function() {
    it('resolves to first dir with caching', function() {
      var filename = '/top/test/file1.test.js';
      var src = "var lib1a = require('dir1/lib1a');";
      var firstDir = '/top/src';
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.calledOnce;
      expect(dirHas.args[0][0]).to.eq('/top/src');
      expect(webpackInfo.read).to.be.calledOnce;
      expect(output).to.eq("var lib1a = require('../src/lib1a');");
    });
  });
});
