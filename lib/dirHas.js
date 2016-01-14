var _ = require('lodash');
var cacheize = require('./cacheize');
var fs = require('fs');
var has = _.has;

var cache = {};

function readdir(dirname) {
  if (has(cache, dirname)) {
    return cache[dirname];
  } else {
    var dirList;
    try { dirList = fs.readdirSync(dirname); } catch(e) { dirList = []; }
    var dirTree = cache[dirname] = cacheize(dirList);
    return dirTree;
  }
}

module.exports = function(dir, entry) {
  return has(readdir(dir), entry);
};
