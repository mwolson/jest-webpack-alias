var expect = require('./lib/expect');

describe('stringOrArray', function() {
  var stringOrArray = require('../lib/stringOrArray');

  it('given an array, returns the array', function() {
    var input = ['arr'];
    expect(stringOrArray(input)).to.eq(input);
  });

  it('given a string, returns an array containing that string', function() {
    var input = 'aString';
    expect(stringOrArray(input)).to.deep.equal([input]);
  });

  it('given undefined, returns undefined', function() {
    var input = undefined;
    expect(stringOrArray(input)).to.be.undefined;
  });

  it('given null, returns null', function() {
    var input = null;
    expect(stringOrArray(input)).to.be.null;
  });
});
