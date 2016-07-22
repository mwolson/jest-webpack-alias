var _ = require('lodash');
var path = require('path');
var pkginfo = require('pkginfo');

function genProfileError(profile, rest) {
  return 'Specified jest-webpack-alias.webpackProfile = "' + profile + '", but ' + rest;
}

function read(pmodule, dir) {
  var packageJson = pkginfo.read(pmodule, dir);
  var pkgJsonFile = packageJson.dir; // misleading name from pkginfo library
  var pkgJsonDir = path.dirname(pkgJsonFile);

  var profile = _.get(packageJson['package'], 'jest-webpack-alias.profile');
  var configFile = _.get(packageJson['package'], 'jest-webpack-alias.configFile', 'webpack.config.js');
  var webpackFile = path.join(pkgJsonDir, configFile);
  var webpackSettings = require(webpackFile);

  if (profile) {
    if (!_.isArray(webpackSettings)) {
      throw new Error(genProfileError(profile, webpackFile + ' does not export an array'));
    }
    webpackSettings = _.find(webpackSettings, 'name', profile);
    if (!webpackSettings) {
      throw new Error(genProfileError(profile, webpackFile + ' does not contain this profile'));
    }
  } else {
    if (_.isArray(webpackSettings)) {
      throw new Error('jest-webpack-alias.webpackProfile not specified, but ' + webpackFile + ' exports an array');
    }
  }

  if (!_.get(webpackSettings, 'resolve.modules') && !_.get(webpackSettings, 'resolve.root')) {
    throw new Error('Missing setting "resolve.modules" (webpack v2) or "resolve.root" (webpack v1) in ' + webpackFile);
  }

  return {
    config: webpackSettings,
    file: webpackFile
  };
}

exports.read = read;
