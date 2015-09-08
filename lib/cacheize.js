
module.exports = function(dirList) {
  var dirTree = {};
  dirList.forEach(function(dir) { dirTree[dir] = true; });
  return dirTree;
};
