var _ = require('lodash');
var cacheize = require('./cacheize');
var fs = require('fs');
var has = _.has;

var cache = {};

function readdir(dirname) {
  if (has(cache, dirname)) {
    return cache[dirname];
  } else {
    var dirList = fs.readdirSync(dirname);
    var dirTree = cache[dirname] = cacheize(dirList);
    return dirTree;
  }
}

module.exports = function(dir, entry) {
  return has(readdir(dir), entry);
};
