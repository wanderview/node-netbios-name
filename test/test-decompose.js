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

var decompose = require('../decompose');

module.exports.testSimpleName = function(test) {
  test.expect(4);
  var name = 'foobar';
  decompose(name, function(error, netbiosName, scopeId) {
    test.equals(error, null, 'decompose callback error');
    test.equals(netbiosName.length, 15, 'netbiosName length');
    test.equals(netbiosName, 'foobar         ', 'netbios name');
    test.equals(scopeId, '', 'scope ID');
    test.done();
  });
};

module.exports.testBadSimpleName = function(test) {
  test.expect(1);
  var name = 'ThisNameIsTooLong';
  decompose(name, function(error, netbiosName, scopeId) {
    test.notEqual(error, null, 'decompose callback error');
    test.done();
  });
};

module.exports.testFullName = function(test) {
  test.expect(4);
  var name = 'snafu.example.com';
  decompose(name, function(error, netbiosName, scopeId) {
    test.equals(error, null, 'decompose callback error');
    test.equals(netbiosName.length, 15, 'netbiosName length');
    test.equals(netbiosName, 'snafu          ', 'netbios name');
    test.equals(scopeId, 'example.com', 'scope ID');
    test.done();
  });
};

module.exports.testBadFullName = function(test) {
  test.expect(1);
  var name = 'ThisNameIsTooLong.example.com';
  decompose(name, function(error, netbiosName, scopeId) {
    test.notEqual(error, null, 'decompose callback error');
    test.done();
  });
};
