var rewire = require('rewire');
var sinon = require('sinon');

var readdir = {
  '/top/node_modules': ['node1', 'node2'],
  '/top/web_modules': ['web1', 'web2'],
  '/top/src': ['dir1', 'dir2'],
  '/top/src/dir1': ['lib1a.js', 'lib1b-2b.js', 'dir1-1'],
  '/top/src/dir2': ['lib2a.js', 'lib1b-2b.js'],
  '/top/test': ['file1.test.js', 'file2.test.js']
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

exports.getDirHas = getDirHas;
