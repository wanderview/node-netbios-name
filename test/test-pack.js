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

module.exports.testBadSimpleName = function(test) {
  test.expect(1);

  var name = 'ABCDEFGHIJKLMNOPQ';
  var suffix = 0x20;
  var buf = new Buffer(34);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testFullName = function(test) {
  test.expect(9);

  var name = 'foobar.example.com';
  var suffix = 0x20;

  var expectedLength = 1;
  expectedLength += 32; // 32 byte netbios name
  expectedLength += 1;  // 1 byte length for 'example'
  expectedLength += 'example'.length;
  expectedLength += 1;  // 1 byte length for 'com'
  expectedLength += 'com'.length;
  expectedLength += 1;  // 1 byte for trailing null byte

  var buf = new Buffer(expectedLength);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    var bytes = 0;

    test.equal(error, null, 'callback error');
    test.equal(nLen, expectedLength, 'encoded buffer length');

    var length = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(length, 32, 'encoded length word');

    var encodedString = buf.toString('ascii', bytes, bytes + length);
    bytes += length;
    test.ok(encodedString.match(/^\w+$/), 'encoded contents');

    length = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(length, 'example'.length, 'example label length');

    var label = buf.toString('ascii', bytes, bytes + length);
    bytes += length;
    test.equal(label, 'example', 'example label');

    length = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(length, 'com'.length, 'com label length');

    var label = buf.toString('ascii', bytes, bytes + length);
    bytes += length;
    test.equal(label, 'com', 'com label');

    var terminator = buf.readUInt8(bytes);
    bytes += 1;
    test.equal(terminator, 0, 'zero terminator');

    test.done();
  });
};

module.exports.testBadFullName = function(test) {
  test.expect(1);

  var name = 'ABCDEFGHIJKLMNOPQ.example.com';
  var suffix = 0x20;
  var buf = new Buffer(34);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testShortNameBufferOverrun = function(test) {
  test.expect(1);

  var name = 'foobar';
  var suffix = 0x20;
  var buf = new Buffer(30);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testFullNameBufferOverrun = function(test) {
  test.expect(1);

  var name = 'foobar.example.com';
  var suffix = 0x20;
  var buf = new Buffer(30);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testFullNameBufferOverrun = function(test) {
  test.expect(1);

  var name = 'foobar.example.com';
  var suffix = 0x20;
  var buf = new Buffer(38);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testFullNameBadScopeId = function(test) {
  test.expect(1);

  // Create a label > 64 which is illegal
  var longLabel = 'ABC3456789';
  longLabel += '0123456789';
  longLabel += '0123456789';
  longLabel += '0123456789';
  longLabel += '0123456789';
  longLabel += '0123456789';
  longLabel += '0123456789';

  var name = 'foobar.' + longLabel + '.com';
  var suffix = 0x20;
  var buf = new Buffer(128);

  pack(buf, 0, {}, name, suffix, function(error, nLen) {
    test.notEqual(error, null, 'callback error');
    test.done();
  });
};

module.exports.testShortNameNoPointers = function(test) {
  test.expect(1);

  var name = 'foobar';
  var suffix = 0x20;
  var buf = new Buffer(34);

  pack(buf, 0, null, name, suffix, function(error, nLen) {
    test.equal(error, null, 'callback error');
    test.done();
  });
};
