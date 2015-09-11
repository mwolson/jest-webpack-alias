var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var cacheize = require('../lib/cacheize');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');
var unwin = require('unwin');

describe('jest-webpack-alias module', function() {

  var dirHas, filename, fs, webpackAlias, webpackInfo;

  function setup() {
    var setup = basicFixture.getWebpackAlias();
    dirHas = setup.dirHas;
    fs = setup.fs;
    webpackAlias = setup.webpackAlias;
    webpackInfo = setup.webpackInfo;
  }

  function verifyDirHas(expected) {
    expect(dirHas).to.be.called;
    for (var i = 0; i < expected.length; i++) {
      if (dirHas.args[i] && expected[i]) {
        expect(unwin(dirHas.args[i][0]), 'call ' + i).to.eq(expected[i][0]);
        expect(dirHas.args[i][1], 'call ' + i).to.eq(expected[i][1]);
      }
    }
    expect(dirHas.args).to.have.length(expected.length);
  }

  function verifyExistsSync(expected) {
    expect(fs.existsSync).to.be.called;
    for (var i = 0; i < expected.length; i++) {
      if (fs.existsSync.args[i] && expected[i]) {
        expect(unwin(fs.existsSync.args[i][0]), 'call ' + i).to.eq(expected[i][0]);
      }
    }
    expect(fs.existsSync.args).to.have.length(expected.length);
  }

  beforeEach(setup);

  describe('with file in first dir', function() {
    beforeEach(function() {
      filename = '/top/test/file1.test.js';
    });

    it('resolves with file extension', function() {
      var src = "var lib1a = require('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      verifyExistsSync([
        ['/top/src'], ['/top/bogus_dir'], ['/top/node_modules'], ['/top/web_modules']
      ]);
      verifyDirHas([
        ['/top/src', 'dir1'],
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(webpackInfo.read).to.be.calledOnce;
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.js');");
    });

    it('falls back to no extension if no exact match found', function() {
      var src = "var lib1a = require('dir1/lib1a.noext');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'dir1'],
        ['/top/src/dir1', 'lib1a.noext'],
        ['/top/src/dir1', 'lib1a.noext.js'],
        ['/top/src/dir1', 'lib1a.noext.jsx']
      ]);
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.noext');");
    });

    it('operates on jest.dontMock statements', function() {
      var src = "jest.dontMock('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      verifyExistsSync([
        ['/top/src'], ['/top/bogus_dir'], ['/top/node_modules'], ['/top/web_modules']
      ]);
      verifyDirHas([
        ['/top/src', 'dir1'],
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(webpackInfo.read).to.be.calledOnce;
      expect(output).to.eq("jest.dontMock('../src/dir1/lib1a.js');");
    });
  });

  describe('with file in same dir', function() {
    beforeEach(function() {
      filename = '/top/src/dir1/lib1b-2b.js';
    });

    it('uses ./ in relative path', function() {
      var src = "var lib1a = require('dir1/lib1a');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'dir1'],
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(output).to.eq("var lib1a = require('./lib1a.js');");
    });
  });

  describe('with file in node_modules', function() {
    beforeEach(function() {
      filename = '/top/test/file1.test.js';
    });

    it('resolves top-level dir, but leaves dependency alone', function() {
      var src = "var lib1a = require('node1');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'node1'],
        ['/top/src', 'node1.js'],
        ['/top/src', 'node1.jsx'],
        ['/top/node_modules', 'node1']
      ]);
      expect(output).to.eq("var lib1a = require('node1');");
    });

    it('resolves submodule, but leaves dependency alone', function() {
      var src = "var lib1a = require('node1/lib/submodule');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'node1'],
        ['/top/node_modules', 'node1']
      ]);
      expect(output).to.eq("var lib1a = require('node1/lib/submodule');");
    });
  });

  describe('with file in web_modules', function() {
    beforeEach(function() {
      filename = '/top/test/file1.test.js';
    });

    it('resolves top-level file, adding file extension', function() {
      var src = "var lib1a = require('web2');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'web2'],
        ['/top/src', 'web2.js'],
        ['/top/src', 'web2.jsx'],
        ['/top/node_modules', 'web2'],
        ['/top/node_modules', 'web2.js'],
        ['/top/node_modules', 'web2.jsx'],
        ['/top/web_modules', 'web2'],
        ['/top/web_modules', 'web2.js'],
        ['/top/web_modules', 'web2.jsx']
      ]);
      expect(output).to.eq("var lib1a = require('../web_modules/web2.jsx');");
    });
  });

  describe('with nonexistent file', function() {
    beforeEach(function() {
      filename = '/top/test/file1.test.js';
    });

    it('resolves top-level file, adding file extension', function() {
      var src = "var lib1a = require('bogus1');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'bogus1'],
        ['/top/src', 'bogus1.js'],
        ['/top/src', 'bogus1.jsx'],
        ['/top/node_modules', 'bogus1'],
        ['/top/node_modules', 'bogus1.js'],
        ['/top/node_modules', 'bogus1.jsx'],
        ['/top/web_modules', 'bogus1'],
        ['/top/web_modules', 'bogus1.js'],
        ['/top/web_modules', 'bogus1.jsx']
      ]);
      expect(output).to.eq("var lib1a = require('bogus1');");
    });
  });

  describe('with relative file', function() {
    beforeEach(function() {
      filename = '/top/src/dir1/lib1b-2b.js';
    });

    it('adds extension on ./', function() {
      var src = "var lib1a = require('./lib1a');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(output).to.eq("var lib1a = require('./lib1a.js');");
    });

    it('adds extension on ../', function() {
      filename = '/top/src/dir1/dir1-1/lib1-1a.js';
      var src = "var lib1a = require('../lib1a');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(output).to.eq("var lib1a = require('../lib1a.js');");
    });

    it('uses no extension if no match found', function() {
      var src = "var lib1a = require('./bogus');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src/dir1', 'bogus'],
        ['/top/src/dir1', 'bogus.js'],
        ['/top/src/dir1', 'bogus.jsx']
      ]);
      expect(output).to.eq("var lib1a = require('./bogus');");
    });
  });

  describe('with alias', function() {
    beforeEach(function() {
      filename = '/top/test/file1.test.js';
    });

    describe('with destination of node_modules', function() {
      it('applies alias to simple paths with no extension change', function() {
        var src = "var lib1a = require('aliasNodeFileSrc');";
        var output = webpackAlias.process(src, filename);

        verifyDirHas([
          ['/top/src', 'aliasNodeFileDest'],
          ['/top/src', 'aliasNodeFileDest.js'],
          ['/top/src', 'aliasNodeFileDest.jsx'],
          ['/top/node_modules', 'aliasNodeFileDest'],
          ['/top/node_modules', 'aliasNodeFileDest.js']
        ]);
        expect(output).to.eq("var lib1a = require('aliasNodeFileDest');");
      });

      it('applies alias to subdir paths', function() {
        var src = "var lib1a = require('aliasNodeSubdir1Src/lib/submodule');";
        var output = webpackAlias.process(src, filename);

        verifyDirHas([
          ['/top/src', 'node1'],
          ['/top/node_modules', 'node1']
        ]);
        expect(output).to.eq("var lib1a = require('node1/lib/submodule');");
      });

      it('replaces subdir paths with alias destination', function() {
        var src = "var lib1a = require('aliasNodeSubdir2Src/ignore/this');";
        var output = webpackAlias.process(src, filename);

        verifyDirHas([
          ['/top/src', 'node1'],
          ['/top/node_modules', 'node1']
        ]);
        expect(output).to.eq("var lib1a = require('node1/lib/submodule');");
      });
    });

    it('applies alias to subdir paths', function() {
      var src = "var lib1a = require('aliasPlainSubdirSrc');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'dir1'],
        ['/top/src/dir1', 'lib1a'],
        ['/top/src/dir1', 'lib1a.js']
      ]);
      expect(output).to.eq("var lib1a = require('../src/dir1/lib1a.js');");
    });

    it('does not apply alias transformation to relative paths', function() {
      var src = "var lib1a = require('../src/aliasRelative');";
      var output = webpackAlias.process(src, filename);

      verifyDirHas([
        ['/top/src', 'aliasRelative'],
        ['/top/src', 'aliasRelative.js']
      ]);
      expect(output).to.eq("var lib1a = require('../src/aliasRelative.js');");
    });
  });
});
