var _ = require('lodash');
var acorn = require('acorn-jsx');
var dirHas = require('./dirHas');
var find = _.find;
var path = require('path');
var transformDeps = require("@ticketmaster/transform-deps");
var unWin = require('./unWin');

var topDir = '/top'; // hardcoded
var defaultAliasDirs = ['node_modules', 'web_modules'];
var rootDir = 'src'; // hardcoded

var aliasDirs = _.union([rootDir], defaultAliasDirs).map(function(dir) {
  return unWin(path.join(topDir, dir));
});

function firstDir(filename) {
  return filename.split('/')[0];
}

function resolveDependencyToMatch(matchingFirstDir, afterFirstDir, filename) {
  var absMatch = path.join(matchingFirstDir, afterFirstDir);
  var srcDir = path.dirname(filename);
  return unWin(path.relative(srcDir, absMatch));
}

function resolve(dependency, filename) {
  var dirname = firstDir(dependency);
  var rest = dependency.slice(dirname.length + 1);
  if (!rest) {
    return dependency;
  }
  var matchingFirstDir = find(aliasDirs, function(aliasDir) {
    return dirHas(aliasDir, dirname) ? aliasDir : null;
  });
  if (matchingFirstDir && rest) {
    return resolveDependencyToMatch(matchingFirstDir, rest, filename);
  } else {
    return dependency;
  }
}

function process(src, filename) {
  return transformDeps(src, {
    ecmaVersion: 6,
    parser: acorn,
    plugins: { jsx: true },
    ranges: true,
    requireTransform: function(dependency) {
      return resolve(dependency, filename);
    }
  });
}

exports.process = process;
