var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var unwin = require('unwin');

describe('webpackInfo lib', function() {
  var fakeRequire, pkginfo, readFile, requireContents, webpackInfo, webpackProfile;

  function setup() {
    var setup = basicFixture.getWebpackInfo();
    fakeRequire = setup.require;
    pkginfo = setup.pkginfo;
    requireContents = setup.requireContents,
    webpackInfo = setup.webpackInfo;
    webpackProfile = setup.webpackProfile;
  }

  beforeEach(setup);

  describe('with package.json in top dir', function() {
    it('finds webpack.config.js and gets profile', function() {
      var filename = '/top/test/file1.test.js';
      var webpackFile = '/top/webpack.config.js';
      var output = webpackInfo.read({filename: filename});

      expect(pkginfo.read).to.be.calledOnce;
      expect(pkginfo.read.args[0][0]).to.eql({filename: filename});
      expect(fakeRequire).to.be.calledOnce;
      expect(unwin(fakeRequire.args[0][0])).to.eql(webpackFile);
      expect(output).to.have.deep.property('config', requireContents[webpackFile][webpackProfile]);
      expect(unwin(output.file)).to.eql(webpackFile);
    });
  });
});
