"use strict";

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
}

module.exports.testBadSimpleName = function(test) {
  test.expect(1);
  var name = 'ThisNameIsTooLong';
  decompose(name, function(error, netbiosName, scopeId) {
    test.notEqual(error, null, 'decompose callback error');
    test.done();
  });
}

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
}

module.exports.testBadFullName = function(test) {
  test.expect(1);
  var name = 'ThisNameIsTooLong.example.com';
  decompose(name, function(error, netbiosName, scopeId) {
    test.notEqual(error, null, 'decompose callback error');
    test.done();
  });
}
