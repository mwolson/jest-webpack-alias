var expect = require('./lib/expect');
var basicFixture = require('./fixture/basic');
var cacheize = require('../lib/cacheize');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');

describe('dirHas module', function() {

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
      expect(cache[firstDir]).to.eql(cacheize(readdir[firstDir]));
      expect(fs.readdirSync.args).to.have.length(1);
      expect(fs.readdirSync.args[0][0]).to.eq('/top/src');
      expect(output).to.be.ok;
    });
  });
});
