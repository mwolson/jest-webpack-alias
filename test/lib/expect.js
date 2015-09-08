var expect = require('chai').expect;
var chai = require('chai');

chai.config.includeStack = true;
chai.config.showDiff = false;
chai.use(require('sinon-chai'));

module.exports = chai.expect;
