var _ = require('lodash');
var acorn = require('acorn-jsx');
var dirHas = require('./dirHas');
var find = _.find;
var fs = require('fs');
var path = require('path');
var stringOrArray = require('./stringOrArray');
var transformDeps = require("@ticketmaster/transform-deps");
var unWin = require('./unWin');
var webpackInfo = require('./webpackInfo');

var defaultFallbackDirs = [];
var defaultFileExtensions = ['', '.webpack.js', '.web.js', '.js'];
var defaultModulesDirs = ['node_modules', 'web_modules'];

var fileExtensions;
var moduleDirs;
var webpackSettings;

function ensureWebpackInfo(filename) {
  if (webpackSettings) {
    return;
  }

  webpackSettings = webpackInfo.read({filename: filename});
  var resolveConfig = webpackSettings.config.resolve;
  var webpackDir = path.dirname(webpackSettings.file);
  fileExtensions = resolveConfig.extensions || defaultFileExtensions;

  var rootDirs = stringOrArray(resolveConfig.root);
  var modDirs = stringOrArray(resolveConfig.modulesDirectories) || defaultModulesDirs;
  var fallbackDirs = stringOrArray(resolveConfig.fallback) || defaultFallbackDirs;

  moduleDirs = _.union(rootDirs, modDirs, fallbackDirs)
  .map(function(dir) {
    return unWin(path.resolve(webpackDir, dir));
  })
  .filter(function(dir) {
    return fs.existsSync(dir);
  });
}

function firstDir(filename) {
  return filename.split('/')[0];
}

function resolveExtension(matchingFirstDir, afterFirstDir) {
  var absMatch = afterFirstDir ? path.join(matchingFirstDir, afterFirstDir) : matchingFirstDir;
  var dirname = path.dirname(absMatch);
  var ext = find(fileExtensions, function(ext) {
    return dirHas(dirname, path.basename(absMatch + ext));
  });
  return ext;
}

function resolveFirstDir(dirname, rest) {
  var matchingDir, matchingExt;

  if (rest) {
    matchingDir = find(moduleDirs, function(aliasDir) {
      return dirHas(aliasDir, dirname);
    });
  } else {
    matchingDir = find(moduleDirs, function(aliasDir) {
      matchingExt = resolveExtension(aliasDir, dirname);
      return matchingExt !== undefined;
    });
  }

  return {
    dir: matchingDir,
    ext: matchingDir ? (matchingExt || '') : ''
  };
}

function resolveDependencyToMatch(matchingFirstDir, afterFirstDir, filename) {
  var absMatch = afterFirstDir ? path.join(matchingFirstDir, afterFirstDir) : matchingFirstDir;
  var srcDir = path.dirname(filename);
  return unWin(path.relative(srcDir, absMatch));
}

function resolve(dependency, filename) {
  var dirname = firstDir(dependency);
  var rest = dependency.slice(dirname.length + 1);

  var matchingFirstDir = resolveFirstDir(dirname, rest);
  if (!matchingFirstDir) {
    return dependency;
  }

  var matchingDir = path.join(matchingFirstDir.dir, dirname) + matchingFirstDir.ext;
  var relative = resolveDependencyToMatch(matchingDir, rest, filename);
  var ext = rest ? (resolveExtension(matchingDir, rest) || '') : '';

  return relative + ext;
}

function process(src, filename) {
  ensureWebpackInfo(filename);
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
