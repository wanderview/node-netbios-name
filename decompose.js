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

module.exports = decompose;

function decompose(fullName, callback) {
  // Separate the name into its first part and the trailing domain
  var shortName = fullName;
  var scopeId = '';
  var dotIndex = fullName.indexOf('.');
  if (dotIndex > -1) {
    shortName = fullName.substr(0, dotIndex);
    scopeId = fullName.substr(dotIndex + 1);
  }

  if (shortName.length > 15) {
    callback(new Error('NetBIOS name [' + shortName +
                       '] too long.  Must be <= 15 chars.'));
    return;
  }

  // space pad NetBIOS name out to 15 characters
  var netbiosName = shortName;
  for (var i = 0; (shortName.length + i) < 15; ++i) {
    netbiosName += ' ';
  }

  callback(null, netbiosName, scopeId);
};
