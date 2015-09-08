function stringOrArray(thing) {
  if (thing === undefined || thing === null) {
    return thing;
  } else if (Array.isArray(thing)) {
    return thing;
  } else {
    return [thing];
  }
}

module.exports = stringOrArray;
