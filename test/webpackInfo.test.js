var _ = require('lodash');
var expect = require('./lib/expect');
var unwin = require('unwin');

describe('webpackInfo lib', function() {
  var fakeRequire, pkginfo, readFile, requireContents, webpackInfo, webpackProfile;
  var filename, output, webpackFile;

  function setup(fixture) {
    filename = null; output = null; webpackFile = null;

    var setup = fixture.getWebpackInfo();
    fakeRequire = setup.require;
    pkginfo = setup.pkginfo;
    requireContents = setup.requireContents,
    webpackInfo = setup.webpackInfo;
    webpackProfile = setup.webpackProfile;
  }

  function expectContainsProfile(profileContents) {
    expect(pkginfo.read).to.be.calledOnce;
    expect(pkginfo.read.args[0][0]).to.eql({filename: filename});
    expect(fakeRequire).to.be.calledOnce;
    expect(unwin(fakeRequire.args[0][0])).to.eql(webpackFile);
    expect(output).to.have.deep.property('config', _.find(profileContents, ['name', webpackProfile]))
      .and.to.have.property('name', webpackProfile);
    expect(unwin(output.file)).to.eql(webpackFile);
  }

  function expectNoProfile() {
    expect(pkginfo.read).to.be.calledOnce;
    expect(pkginfo.read.args[0][0]).to.eql({filename: filename});
    expect(fakeRequire).to.be.calledOnce;
    expect(unwin(fakeRequire.args[0][0])).to.eql(webpackFile);
    expect(output).to.have.deep.property('config', requireContents[webpackFile]);
    expect(unwin(output.file)).to.eql(webpackFile);
  }

  describe('with default config file and package.json in top dir', function() {
    beforeEach(function() {
      setup(require('./fixture/basic'));
    });

    it('finds webpack.config.js and gets profile', function() {
      filename = '/top/test/file1.test.js';
      webpackFile = '/top/webpack.config.js';
      output = webpackInfo.read({filename: filename});

      expectContainsProfile(requireContents[webpackFile]);
    });

    describe('but wrong profile name', function() {
      beforeEach(function() {
        setup(require('./fixture/webpackInfo/profile-not-found'));
      });

      it('throws an error', function() {
        filename = '/top/test/file1.test.js';
        webpackFile = '/top/webpack/dev.config.js';
        var expectedMsg = 'Specified jest-webpack-alias.webpackProfile = "dev", '
                        + 'but /top/webpack/dev.config.js does not contain this profile';

        expect(webpackInfo.read.bind(null, {filename: filename})).to.throw(expectedMsg);
      });
    });

    describe('but profile setting omitted', function() {
      beforeEach(function() {
        setup(require('./fixture/webpackInfo/profile-not-specified'));
      });

      it('throws an error', function() {
        filename = '/top/test/file1.test.js';
        webpackFile = '/top/webpack/dev.config.js';
        var expectedMsg = 'jest-webpack-alias.webpackProfile not specified, '
                        + 'but /top/webpack/dev.config.js exports an array';

        expect(webpackInfo.read.bind(null, {filename: filename})).to.throw(expectedMsg);
      });
    });

    describe('but missing resolve.modules and resolve.root', function() {
      beforeEach(function() {
        setup(require('./fixture/webpackInfo/profile-missing-resolve-root'));
      });

      it('throws an error', function() {
        filename = '/top/test/file1.test.js';
        webpackFile = '/top/webpack/dev.config.js';
        var expectedMsg = [
          'Missing setting "resolve.modules" (webpack v2) or "resolve.root" (webpack v1)',
          ' in /top/webpack/dev.config.js'
        ].join('');

        expect(webpackInfo.read.bind(null, {filename: filename})).to.throw(expectedMsg);
      });
    });
  });

  describe('with alternate webpack config file', function() {
    beforeEach(function() {
      setup(require('./fixture/webpackInfo/alt-config-location'));
    });

    it('finds profile', function() {
      filename = '/top/test/file1.test.js';
      webpackFile = '/top/webpack/dev.config.js';
      output = webpackInfo.read({filename: filename});

      expectContainsProfile(requireContents[webpackFile]);
    });
  });

  describe('with ES6 default exports', function() {
    beforeEach(function() {
      setup(require('./fixture/webpackInfo/es6-default-exports'));
    });

    it('finds profile', function() {
      filename = '/top/test/file1.test.js';
      webpackFile = '/top/webpack/dev.config.js';
      output = webpackInfo.read({filename: filename});

      expectContainsProfile(requireContents[webpackFile].default);
    });
  });

  describe('with no profile in webpack config', function() {
    beforeEach(function() {
      setup(require('./fixture/webpackInfo/no-profile'));
    });

    it('returns entire config file', function() {
      filename = '/top/test/file1.test.js';
      webpackFile = '/top/webpack/dev.config.js';
      output = webpackInfo.read({filename: filename});

      expectNoProfile();
    });

    describe('but profile specified', function() {
      beforeEach(function() {
        setup(require('./fixture/webpackInfo/profile-not-array'));
      });

      it('throws an error', function() {
        filename = '/top/test/file1.test.js';
        webpackFile = '/top/webpack/dev.config.js';
        var expectedMsg = 'Specified jest-webpack-alias.webpackProfile = "dev", '
                        + 'but /top/webpack/dev.config.js does not export an array';

        expect(webpackInfo.read.bind(null, {filename: filename})).to.throw(expectedMsg);
      });
    });
  });
});
