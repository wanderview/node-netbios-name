"use strict";

var pack = require('../pack');
var unpack = require('../unpack');

function packAndUnpack(test, name, suffix, callback) {
  var buf = new Buffer(128);
  pack(buf, 0, null, name, suffix, function(error, pLen) {
    test.equal(error, null, 'pack callback error');

    unpack(buf, 0, function(error, uLen, uName, uSuffix) {
      test.equal(error, null, 'unpack callback error');
      test.equal(uName, name, 'unpacked name');
      test.equal(uSuffix, suffix, 'unpacked suffix');
      callback();
    });
  });
}

module.exports.testSimpleName = function(test) {
  test.expect(4);

  packAndUnpack(test, 'foobar', 0x20, function() {
    test.done();
  });
};

module.exports.testFullName = function(test) {
  test.expect(4);

  packAndUnpack(test, 'foobar.example.com', 0x20, function() {
    test.done();
  });
};
