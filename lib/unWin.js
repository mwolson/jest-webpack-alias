var os = require('os');

module.exports = function unWin(fileName) {
  if (os.platform() == 'win32') {
    return fileName.replace(/\\/g, '/');
  } else {
    return fileName;
  }
};
