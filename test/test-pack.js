// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met: 
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer. 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution. 
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

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

module.exports.testNoPointers = function(test) {
  test.expect(1);

  var name = 'foobar';
  var suffix = 0x20;
  var buf = new Buffer(34);

  pack(buf, 0, null, name, suffix, function(error, nLen) {
    test.equal(error, null, 'callback error');
    test.done();
  });
};

module.exports.testShortNamePointer = function(test) {
  test.expect(4);

  var nameMap = {};
  var name = 'foobar';
  var suffix = 0x20;
  var buf = new Buffer(38);
  var bytes = 0;

  pack(buf, bytes, nameMap, name, suffix, function(error, nLen) {
    test.equal(error, null, 'callback error');

    bytes += nLen;

    pack(buf, bytes, nameMap, name, suffix, function(error2, nLen2) {
      test.equal(error2, null, 'second pack callback error');
      test.notEqual(nLen2, nLen, 'second packed length is different');
      test.equal(nLen2, 2, 'second packed length is compressed');
      test.done();
    });
  });
};

module.exports.testFullNamePointer = function(test) {
  test.expect(3);

  var nameMap = {};
  var scopeId = 'example.com';
  var name = 'foobar.' + scopeId;
  var name2 = 'snafu.' + scopeId;
  var suffix = 0x20;

  var expectedLength = 1;
  expectedLength += 32; // 32 byte netbios name
  expectedLength += 1;  // 1 byte length for 'example'
  expectedLength += 'example'.length;
  expectedLength += 1;  // 1 byte length for 'com'
  expectedLength += 'com'.length;
  expectedLength += 1;  // 1 byte for trailing null byte
  expectedLength += 1;  // 1 byte for second netbios name
  expectedLength += 32; // 32 by netbios name
  expectedLength += 2;  // pointer to first scope ID

  var buf = new Buffer(expectedLength);
  var bytes = 0;

  pack(buf, bytes, nameMap, name, suffix, function(error, nLen) {
    test.equal(error, null, 'callback error');

    bytes += nLen;

    pack(buf, bytes, nameMap, name2, suffix, function(error2, nLen2) {
      test.equal(error2, null, 'second pack callback error');

      bytes += nLen2;

      test.equal(bytes, expectedLength, 'total expected packed length');

      test.done();
    });
  });
};
