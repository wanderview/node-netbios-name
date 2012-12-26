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

module.exports = NetbiosName;

var decompose = require('./decompose');
var pack = require('./pack');
var unpack = require('./unpack');

// TODO:  remove this compatibility shim eventually
module.exports.decompose = decompose;
module.exports.pack = pack;
module.exports.unpack = unpack;

function NetbiosName() {
  var self = (this instanceof NetbiosName)
           ? this
           : Object.create(NetbiosName.prototype);

  if (typeof arguments[0] === 'string') {
    self._initFromName(arguments[0], arguments[1]);
  } else {
    self._initFromBuffer(arguments[0], arguments[1]);
  }

  return self;
}

NetbiosName.prototype._initFromName = function(fullName, suffix) {
  var self = this;
  self.fullName = fullName;
  self.suffix = (typeof suffix === 'number') ? suffix : 0;
  decompose(fullName, function(error, netbiosName, scopeId) {
    if (error) {
      self.error = error;
      return;
    }

    self.netbiosName = netbiosName;
    self.scopeId = scopeId;
    self.valid = true;
  });

  return self;
}

NetbiosName.prototype._initFromBuffer = function(buf, offset) {
  var self = this;
  unpack(buf, offset, function(error, len, name, suffix) {
    if (error) {
      self.error = error;
      return;
    }

    self.bytesRead = len;
    self.fullName = name;
    self.suffix = suffix;
    decompose(name, function(error, netbiosName, scopeId) {
      if (error) {
        self.error = error;
        return;
      }

      self.netbiosName = netbiosName;
      self.scopeId = scopeId;
      self.valid = true;
    });
  });

  return self;
}

NetbiosName.prototype.write = function(buf, offset, nameMap, callback) {
  var self = this;

  pack(buf, offset, nameMap, self.fullName, self.suffix, callback);
};
