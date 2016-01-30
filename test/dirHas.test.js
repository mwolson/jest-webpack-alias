require('blanket');
var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var cacheize = require('../lib/cacheize');

describe('dirHas lib', function() {
  var cache, dirHas, fs, readdir;

  function setup() {
    var setup = basicFixture.getDirHas();
    cache = setup.cache;
    dirHas = setup.dirHas;
    fs = setup.fs;
    readdir = setup.readdir;
  }

  beforeEach(setup);

  describe('with file hit in first dir', function() {
    it('resolves to first dir with caching', function() {
      var firstDir = '/top/src';
      var output = dirHas(firstDir, 'dir1');

      expect(fs.readdirSync).to.be.calledOnce;
      expect(fs.readdirSync.args[0][0]).to.eq('/top/src');
      expect(cache[firstDir]).to.eql(cacheize(readdir[firstDir]));
      expect(output).to.be.ok;
    });
  });

  describe('with nonexistent directory', function() {
    it('returns false without throwing error', function() {
      var firstDir = '/top/src/bogus/directory';
      var output = dirHas(firstDir, 'dir1');

      expect(fs.readdirSync).to.be.calledOnce;
      expect(fs.readdirSync.args[0][0]).to.eq('/top/src/bogus/directory');
      expect(cache[firstDir]).to.eql(cacheize([]));
      expect(output).to.not.be.ok;
    });
  });
});
