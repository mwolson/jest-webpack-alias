var _ = require('lodash');
var path = require('path');
var pkginfo = require('pkginfo');

function read(pmodule, dir) {
  var packageJson = pkginfo.read(pmodule, dir);
  var pkgJsonFile = packageJson.dir; // misleading name from pkginfo library
  var pkgJsonDir = path.dirname(pkgJsonFile);

  if (!_.has(packageJson['package'], 'jest-webpack-alias.webpackProfile')) {
    throw new Error(
      'Missing setting jest-webpack-alias.webpackProfile in ' + pkgJsonFile +
      ". If you don't want to use a profile, set webpackProfile to null.");
  }
  var webpackProfile = _.get(packageJson['package'], 'jest-webpack-alias.webpackProfile');

  var webpackConfigPath = _.get(packageJson['package'], 'jest-webpack-alias.webpackConfigPath', 'webpack.config.js');
  var webpackFile = path.join(pkgJsonDir, webpackConfigPath);
  var webpackSettings = require(webpackFile);

  if (webpackProfile !== null) {
    if (!webpackSettings[webpackProfile]) {
      console.log('settings', webpackSettings);
      throw new Error('Missing key "' + webpackProfile + '" in ' + webpackFile);
    }
    webpackSettings = webpackSettings[webpackProfile];
  }

  if (!_.get(webpackSettings, 'resolve.root')) {
    throw new Error('Missing setting "' + webpackProfile + '.resolve.root' + '" in ' + webpackFile);
  }

  return {
    config: webpackSettings,
    file: webpackFile
  };
}

exports.read = read;
