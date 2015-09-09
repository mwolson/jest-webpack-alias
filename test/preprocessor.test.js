var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var cacheize = require('../lib/cacheize');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');

describe('jest-webpack-alias module', function() {

  var dirHas, fs, webpackAlias, webpackInfo;

  function setup() {
    var setup = basicFixture.getWebpackAlias();
    dirHas = setup.dirHas;
    fs = setup.fs;
    webpackAlias = setup.webpackAlias;
    webpackInfo = setup.webpackInfo;
  }

  beforeEach(setup);

  describe('with file in first dir', function() {
    var filename = '/top/test/file1.test.js';

    it('resolves with file extension', function() {
      var src = "var lib1a = require('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      expect(fs.existsSync).to.be.called;
      expect(fs.existsSync.args).to.have.length(4);
      expect(fs.existsSync.args[0][0]).to.eq('/top/src');
      expect(fs.existsSync.args[1][0]).to.eq('/top/bogus_dir');
      expect(fs.existsSync.args[2][0]).to.eq('/top/node_modules');
      expect(fs.existsSync.args[3][0]).to.eq('/top/web_modules');

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(3);
      expect(dirHas.args[0]).to.eql(['/top/src', 'dir1']);
      expect(dirHas.args[1]).to.eql(['/top/src/dir1', 'lib1a']);
      expect(dirHas.args[2]).to.eql(['/top/src/dir1', 'lib1a.js']);

      expect(webpackInfo.read).to.be.calledOnce;
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.js');");
    });

    it('falls back to hit without extension if no exact match found', function() {
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

  describe('with file in same dir', function() {
    var filename = '/top/src/dir1/lib1b-2b.js';

    it('uses ./ in relative path', function() {
      var src = "var lib1a = require('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(3);
      expect(dirHas.args[0]).to.eql(['/top/src', 'dir1']);
      expect(dirHas.args[1]).to.eql(['/top/src/dir1', 'lib1a']);
      expect(dirHas.args[2]).to.eql(['/top/src/dir1', 'lib1a.js']);
      expect(output).to.eq("var lib1a = require('./lib1a.js');");
    });
  });

  describe('with file in node_modules', function() {
    var filename = '/top/test/file1.test.js';

    it('resolves top-level dir, but leaves dependency alone', function() {
      var src = "var lib1a = require('node1');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(4);
      expect(dirHas.args[0]).to.eql(['/top/src', 'node1']);
      expect(dirHas.args[1]).to.eql(['/top/src', 'node1.js']);
      expect(dirHas.args[2]).to.eql(['/top/src', 'node1.jsx']);
      expect(dirHas.args[3]).to.eql(['/top/node_modules', 'node1']);
      expect(output).to.eq("var lib1a = require('node1');");
    });

    it('resolves submodule, but leaves dependency alone', function() {
      var src = "var lib1a = require('node1/lib/submodule');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(2);
      expect(dirHas.args[0]).to.eql(['/top/src', 'node1']);
      expect(dirHas.args[1]).to.eql(['/top/node_modules', 'node1']);
      expect(output).to.eq("var lib1a = require('node1/lib/submodule');");
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

  describe('with nonexistent file', function() {
    var filename = '/top/test/file1.test.js';

    it('resolves top-level file, adding file extension', function() {
      var src = "var lib1a = require('bogus1');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).to.be.called;
      expect(dirHas.args).to.have.length(9);
      expect(dirHas.args[0]).to.eql(['/top/src', 'bogus1']);
      expect(dirHas.args[1]).to.eql(['/top/src', 'bogus1.js']);
      expect(dirHas.args[2]).to.eql(['/top/src', 'bogus1.jsx']);
      expect(dirHas.args[3]).to.eql(['/top/node_modules', 'bogus1']);
      expect(dirHas.args[4]).to.eql(['/top/node_modules', 'bogus1.js']);
      expect(dirHas.args[5]).to.eql(['/top/node_modules', 'bogus1.jsx']);
      expect(dirHas.args[6]).to.eql(['/top/web_modules', 'bogus1']);
      expect(dirHas.args[7]).to.eql(['/top/web_modules', 'bogus1.js']);
      expect(dirHas.args[8]).to.eql(['/top/web_modules', 'bogus1.jsx']);
      expect(output).to.eq("var lib1a = require('bogus1');");
    });
  });

  describe('with relative file', function() {
    var filename = '/top/src/dir1/lib2.js';

    it('skips any kind of processing', function() {
      var src = "var lib1a = require('./lib1');";
      var output = webpackAlias.process(src, filename);

      expect(dirHas).not.to.be.called;
      expect(output).to.eq("var lib1a = require('./lib1');");
    });
  });
});
