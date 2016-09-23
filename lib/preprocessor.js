var _ = require('lodash');
var dirHas = require('./dirHas');
var fs = require('fs');
var path = require('path');
var stringOrArray = require('./stringOrArray');
var transformDeps = require('transform-jest-deps');
var unwin = require('unwin');
var webpackInfo = require('./webpackInfo');

var defaultAliases = {};
var defaultFallbackDirs = [];
var defaultFileExtensions = ['', '.webpack.js', '.web.js', '.js', '.json'];
var defaultModules = ['node_modules'];
var defaultModulesDirs = ['node_modules', 'web_modules'];

var aliases;
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
  aliases = resolveConfig.alias || defaultAliases;
  fileExtensions = resolveConfig.extensions || defaultFileExtensions;
  moduleDirs = resolveConfig.modules || defaultModules;

  if (!resolveConfig.modules && resolveConfig.root) {
    // webpack 1.x path names
    var rootDirs = stringOrArray(resolveConfig.root);
    var modDirs = stringOrArray(resolveConfig.modulesDirectories) || defaultModulesDirs;
    var fallbackDirs = stringOrArray(resolveConfig.fallback) || defaultFallbackDirs;
    moduleDirs = _.union(rootDirs, modDirs, fallbackDirs);
  }

  moduleDirs = moduleDirs.map(function(dir) {
    return path.resolve(webpackDir, dir);
  })
  .filter(function(dir) {
    return fs.existsSync(dir);
  });
}

function firstDir(filename) {
  var segments;

  if (path.isAbsolute(filename)) {
    return filename;
  } else {
    return filename.split('/')[0];
  }
}

function matchAlias(dependency) {
  var alias = aliases[dependency];
  if (alias) {
    var dirname = firstDir(alias);
    return {
      dirname: dirname,
      rest: alias.slice(dirname.length + 1),
      path: alias
    };
  } else {
    return undefined;
  }
}

function resolveExtension(matchingFirstDir, afterFirstDir) {
  var absMatch = afterFirstDir ? path.join(matchingFirstDir, afterFirstDir) : matchingFirstDir;
  var dirname = path.dirname(absMatch);
  var ext = _.find(fileExtensions, function(ext) {
    return dirHas(dirname, path.basename(absMatch + ext));
  });
  return ext;
}

function locate(dirname) {
  var matchingDir, matchingExt;

  if (path.isAbsolute(dirname)) {
    matchingDir = dirname;
    matchingExt = resolveExtension(dirname);
  } else {
    matchingDir = _.find(moduleDirs, function(candidate) {
      matchingExt = resolveExtension(candidate, dirname);
      return matchingExt !== undefined;
    });
  }

  return {
    dir: matchingDir,
    ext: matchingDir ? (matchingExt || '') : ''
  };
}

function resolveRelativeDependency(dependency, filename) {
  var absMatch = path.resolve(path.dirname(filename), dependency);
  var ext = resolveExtension(absMatch) || '';
  return dependency + ext;
}

function resolveDependencyToMatch(matchingFirstDir, afterFirstDir, filename) {
  var absMatch = afterFirstDir ? path.join(matchingFirstDir, afterFirstDir) : matchingFirstDir;
  var srcDir = path.dirname(filename);
  var relPath = unwin(path.relative(srcDir, absMatch));
  if (relPath.slice(0, 1) != '.') {
    relPath = './' + relPath;
  }
  return relPath;
}

function resolve(dependency, filename) {
  ensureWebpackInfo(filename);

  if (!dependency) {
    return undefined;
  }

  if (dependency.slice(0, 1) === '.') {
    return resolveRelativeDependency(dependency, filename);
  }

  var dirname = firstDir(dependency);
  var rest = dependency.slice(dirname.length + 1);

  var alias = matchAlias(dirname);
  if (alias) {
    // We want to get something relative to the alias
    if (rest) {
      dirname = alias.path;
    } else {
      dirname = alias.dirname;
      rest = alias.rest;
    }
    dependency = dirname + (rest ? '/' + rest : '');
  }

  var match = locate(dependency);
  if (!match.dir) {
    return dependency;
  }

  var matchingDir;
  if (path.isAbsolute(dirname)) {
    matchingDir = dirname;
  } else {
    matchingDir = path.join(match.dir, dirname);
  }
  var relative = resolveDependencyToMatch(matchingDir, rest, filename);
  var ext = match.ext || '';

  if (_.includes(relative, '/node_modules/')) {
    return dependency;
  }

  return relative + ext;
}

function process(src, filename) {
  ensureWebpackInfo(filename);
  var transformed = transformDeps(src, function(dependency) {
    return resolve(dependency, filename);
  });
  return transformed;
}

exports.process = process;
exports.resolve = resolve;
