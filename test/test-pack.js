'use strict';

var pack = require('../pack');

module.exports.testSimpleName = function(test) {
  test.expect(5);

  var name = 'foobar';
  var suffix = 0x20;
  var buf = new Buffer(34);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    var bytes = 0;

    test.equal(error, null, 'callback error');
    test.equal(nLen, (1 + 32 + 1), 'encoded name length');

    var length = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(length, 32, 'encoded length word');

    var encodedString = buf.toString('ascii', bytes, bytes + length);
    bytes += length;
    test.ok(encodedString.match(/^\w+$/), 'encoded contents');

    var terminator = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(terminator, 0, 'zero terminator');

    test.done();
  });
};
