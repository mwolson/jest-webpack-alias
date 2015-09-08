var _ = require('lodash');
var path = require('path');
var pkginfo = require('pkginfo');

function read(pmodule, dir) {
  var packageJson = pkginfo.read(pmodule, dir);
  var pkgJsonFile = packageJson.dir; // misleading name from pkginfo library
  var pkgJsonDir = path.dirname(pkgJsonFile);
  var webpackProfile = _.get(packageJson['package'], 'jest-webpack-alias.webpackProfile');
  if (!webpackProfile) {
    throw new Error('Missing setting jest-webpack-alias.webpackProfile in ' + pkgJsonFile);
  }

  var webpackFile = path.join(pkgJsonDir, 'webpack.config.js');
  var webpackSettings = require(webpackFile);
  if (!webpackSettings[webpackProfile]) {
    console.log('settings', webpackSettings);
    throw new Error('Missing key "' + webpackProfile + '" in ' + webpackFile);
  }

  var profSettings = webpackSettings[webpackProfile];
  if (!_.get(profSettings, 'resolve.root')) {
    throw new Error('Missing setting "' + webpackProfile + '.resolve.root' + '" in ' + webpackFile);
  }

  return {
    config: profSettings,
    file: webpackFile
  };
}

exports.read = read;
