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

"use strict";

var pack = require('../pack');
var unpack = require('../unpack');

module.exports.testSimpleName = function(test) {
  test.expect(4);

  verifyList(test, {}, ['foobar'], function() {
    test.done();
  });
};

module.exports.testFullName = function(test) {
  test.expect(4);

  verifyList(test, {}, ['foobar.example.com'], function() {
    test.done();
  });
};

module.exports.testSimpleNameWithPointer = function(test) {
  test.expect(7);

  var nameList = ['foobar', 'foobar'];
  var expectedLength = 1 + 32 + 1;  // first foobar
  expectedLength += 2;              // second foobar as pointer

  verifyList(test, {}, nameList, function(len) {
    test.equal(len, expectedLength, 'unpacked number of bytes');
    test.done();
  });
};

module.exports.testSimpleNameWithoutPointer = function(test) {
  test.expect(7);

  var nameList = ['foobar', 'foobar'];
  var expectedLength = 1 + 32 + 1;  // first foobar
  expectedLength += 1 + 32 + 1;     // second foobar without pointer

  verifyList(test, null, nameList, function(len) {
    test.equal(len, expectedLength, 'unpacked number of bytes');
    test.done();
  });
};

module.exports.testFullNameWithPointer = function(test) {
  test.expect(7);

  var name = 'foobar';
  var scopeId = '.example.com';
  var fullName = name + scopeId;
  var nameList = [fullName, fullName];
  var expectedLength = 1 + 32 + scopeId.length + 1;   // 1st full name
  expectedLength += 2;                                // 2nd full name w/ ptr

  verifyList(test, {}, nameList, function(len) {
    test.equal(len, expectedLength, 'unpacked number of bytes');
    test.done();
  });
};

module.exports.testFullNameWithoutPointer = function(test) {
  test.expect(7);

  var name = 'foobar';
  var scopeId = '.example.com';
  var fullName = name + scopeId;
  var nameList = [fullName, fullName];
  var expectedLength = 1 + 32 + scopeId.length + 1;   // 1st full name
  expectedLength += 1 + 32 + scopeId.length + 1;      // 2nd full name w/o ptr

  verifyList(test, null, nameList, function(len) {
    test.equal(len, expectedLength, 'unpacked number of bytes');
    test.done();
  });
};

module.exports.testBufferUnderrun = function(test) {
  test.expect(1);

  var buf = new Buffer(8);

  // Write a length value of 32 bytes which is longer than the buffer.
  buf.writeUInt8(32, 0);

  unpack(buf, 0, function(error) {
    test.notEqual(error, null, 'unpack should return an error via callback');
    test.done();
  });
};

// Functions below will pack and then unpack a list of names.  Each unpacked
// name is then checked against the names originally passed in.  The final
// number of bytes read is passed back via callback.

function verifyList(test, nameMap, nameList, callback) {
  var buf = new Buffer(1024);
  var suffix = 0x20;

  packList(buf, 0, nameMap, nameList.slice(), suffix, function(error) {
    test.equal(error, null, 'packList callback error');

    var namesOut = [];
    var suffixesOut = [];
    unpackList(buf, 0, nameList.length, namesOut, suffixesOut, function(error, uLen) {
      test.equal(error, null, 'unpackList callback error');

      for (var i = 0; i < nameList.length; ++i) {
        test.equal(namesOut[i], nameList[i],
                   'unpacked name at index [' + i + ']');
        test.equal(suffixesOut[i], suffix, 'unpacked suffix');
      }

      callback(uLen);
    });
  });
}

function packList(buf, offset, nameMap, nameList, suffix, callback) {
  var name = nameList.shift();
  if (!name) {
    callback(null);
    return;
  }

  pack(buf, offset, nameMap, name, suffix, function(error, pLen) {
    if (error) {
      callback(error);
      return;
    }

    packList(buf, (offset + pLen), nameMap, nameList, suffix, callback);
  });
}

function unpackList(buf, offset, nameCount, nameList, suffixList, callback) {
  if (nameCount < 1) {
    callback(null, offset);
    return;
  }

  unpack(buf, offset, function(error, uLen, uName, uSuffix) {
    if (error) {
      callback(error);
      return;
    }

    nameList.push(uName);
    suffixList.push(uSuffix);

    unpackList(buf, (offset + uLen), (nameCount - 1), nameList, suffixList, callback);
  });
}
