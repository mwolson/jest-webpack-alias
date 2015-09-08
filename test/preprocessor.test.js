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
    var filename = '/top/test/file1.test.js';

    it('resolves with file extension', function() {
      var src = "var lib1a = require('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(3);
      expect(dirHas.args[0]).to.eql(['/top/src', 'dir1']);
      expect(dirHas.args[1]).to.eql(['/top/src/dir1', 'lib1a']);
      expect(dirHas.args[2]).to.eql(['/top/src/dir1', 'lib1a.js']);
      expect(webpackInfo.read).to.be.calledOnce;
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.js');");
    });

    it('falls back to hit without extension if no extension found', function() {
      var src = "var lib1a = require('dir1/lib1a.noext');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(4);
      expect(dirHas.args[0]).to.eql(['/top/src', 'dir1']);
      expect(dirHas.args[1]).to.eql(['/top/src/dir1', 'lib1a.noext']);
      expect(dirHas.args[2]).to.eql(['/top/src/dir1', 'lib1a.noext.js']);
      expect(dirHas.args[3]).to.eql(['/top/src/dir1', 'lib1a.noext.jsx']);
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.noext');");
    });
  });

  describe('with file in node_modules', function() {
    var filename = '/top/test/file1.test.js';

    it('resolves top-level dir', function() {
      var src = "var lib1a = require('node1');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(4);
      expect(dirHas.args[0]).to.eql(['/top/src', 'node1']);
      expect(dirHas.args[1]).to.eql(['/top/src', 'node1.js']);
      expect(dirHas.args[2]).to.eql(['/top/src', 'node1.jsx']);
      expect(dirHas.args[3]).to.eql(['/top/node_modules', 'node1']);
      expect(output).to.eq("var lib1a = require('../node_modules/node1');");
    });

    it('resolves submodule, adding file extension', function() {
      var src = "var lib1a = require('node1/lib/submodule');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(4);
      expect(dirHas.args[0]).to.eql(['/top/src', 'node1']);
      expect(dirHas.args[1]).to.eql(['/top/node_modules', 'node1']);
      expect(dirHas.args[2]).to.eql(['/top/node_modules/node1/lib', 'submodule']);
      expect(dirHas.args[3]).to.eql(['/top/node_modules/node1/lib', 'submodule.js']);
      expect(output).to.eq("var lib1a = require('../node_modules/node1/lib/submodule.js');");
    });
  });

  describe('with file in web_modules', function() {
    var filename = '/top/test/file1.test.js';

    it('resolves top-level file, adding file extension', function() {
      var src = "var lib1a = require('web2');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(9);
      expect(dirHas.args[0]).to.eql(['/top/src', 'web2']);
      expect(dirHas.args[1]).to.eql(['/top/src', 'web2.js']);
      expect(dirHas.args[2]).to.eql(['/top/src', 'web2.jsx']);
      expect(dirHas.args[3]).to.eql(['/top/node_modules', 'web2']);
      expect(dirHas.args[4]).to.eql(['/top/node_modules', 'web2.js']);
      expect(dirHas.args[5]).to.eql(['/top/node_modules', 'web2.jsx']);
      expect(dirHas.args[6]).to.eql(['/top/web_modules', 'web2']);
      expect(dirHas.args[7]).to.eql(['/top/web_modules', 'web2.js']);
      expect(dirHas.args[8]).to.eql(['/top/web_modules', 'web2.jsx']);
      expect(output).to.eq("var lib1a = require('../web_modules/web2.jsx');");
    });
  });
});
