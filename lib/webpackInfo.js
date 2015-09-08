var _ = require('lodash');
var path = require('path');
var pkginfo = require('pkginfo');

function read(pmodule, dir) {
  var packageJson = pkginfo.read(pmodule, dir);
  var webpackProfile = _.get(packageJson['package'], 'jest.webpackProfile');
  if (!webpackProfile) {
    throw new Error('Missing setting jest.webpackProfile in ' + path.join(packageJson.dir, 'package.json'));
  }

  var webpackSettings = require(path.join(packageJson.dir, 'webpack.config.js'));
  if (!webpackSettings[webpackProfile]) {
    console.log('settings', webpackSettings);
    throw new Error('Missing key "' + webpackProfile + '" in ' + path.join(packageJson.dir, 'webpack.config.js'));
  }

  var profSettings = webpackSettings[webpackProfile];
  if (!_.get(profSettings, 'resolve.root')) {
    throw new Error('Missing setting "' + webpackProfile + '.resolve.root' + '" in ' +
                    path.join(packageJson.dir, 'webpack.config.js'));
  }

  return {
    config: profSettings,
    dir: packageJson.dir
  };
}

exports.read = read;
