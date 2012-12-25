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

module.exports = pack;

var decompose = require('./decompose');

function pack(buf, offset, nameMap, name, suffix, callback) {
  encodeName(name, suffix, function(error, encoded) {
    if (error) {
      callback(error);
      return;
    }

    compressName(buf, offset, nameMap, encoded, function(error, nLen) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, nLen);
    });
  });
}

function encodeName(name, suffix, callback) {
  decompose(name, function(error, netbiosName, scopeId) {
    if (error) {
      callback(error);
      return;
    }

    // append the "suffix" as a character so it will be encoded
    netbiosName += String.fromCharCode(suffix);

    // Each character in the raw NetBIOS name is split into two nibbles.  These
    // nibbles are then each converted into a printable character by adding
    // the character 'A' to them.  See page 26 in RFC 1001 for more details.
    var encoded = '';
    for (var i = 0; i < netbiosName.length; ++i) {
      var ascii = netbiosName.charCodeAt(i);
      var nibble1 = ((ascii & 0xf0) >> 4);
      var nibble2 = (ascii & 0x0f);

      encoded += String.fromCharCode(nibble1 + 'A'.charCodeAt(0));
      encoded += String.fromCharCode(nibble2 + 'A'.charCodeAt(0));
    }

    // append the trailing scope domain name if present
    if (scopeId) {
      encoded += '.' + scopeId;
    }

    callback(null, encoded);
  });
}

function compressName(buf, offset, nameMap, name, callback) {
  var bytes = 0;

  // If we have written this name before, then create a pointer to it
  if (nameMap && nameMap[name] !== undefined) {
    var pointer = nameMap[name] & 0x3fff;

    // The top 2-bits must be set as a flag indicating its a pointer
    pointer |= 0xc000;

    if ((buf.length - offset) < 2) {
      callback(new Error('buffer not large enough to write label pointer ' +
                         'for name [' + name + ']'));
      return;
    }

    buf.writeUInt16BE(pointer, offset + bytes);
    bytes += 2;

  // Otherwise we need to write the next part of the name to the buffer
  } else {

    // Record the we are storing the name at this location in the buffer
    // so that later names can point to it.
    if (nameMap) {
      nameMap[name] = offset + bytes;
    }

    // Extract the first part of the name
    var dotIndex = name.indexOf('.');
    var label = name;
    if (dotIndex > -1) {
      label = name.substr(0, dotIndex);
    }

    if (label.length > 64) {
      callback(new Error('Label [' + label + '] is more than 64 characters ' +
                         'long.'));
      return;
    } else if ((buf.length - offset) < (1 + label.length)) {
      callback(new Error('buffer not large enough to write name [' + name +
                         ']'));
      return;
    }

    // Write the length of the label out in a single octet.  The top 2-bits
    // must be zero since they are used as flags.
    var octet = label.length & 0x3f;
    buf.writeUInt8(octet, offset + bytes);
    bytes += 1;

    // Now write the label itself
    buf.write(label, offset + bytes);
    bytes += label.length;

    // If there are more parts to the name, then we need to continue
    // compressing the name to the buffer.  Use recursion.
    if (dotIndex > -1) {
      var rError = null;
      var remainder = name.substr(dotIndex + 1);
      compressName(buf, offset + bytes, nameMap, remainder, function(error, nLen) {
        if (error) {
          rError = error;
          return;
        }

        bytes += nLen;
      });

      if (rError) {
        callback(rError);
        return;
      }

    // Once the last part of the name has been written we must terminate the
    // labels with an octet length of zero.
    } else {
      buf.writeUInt8(0, offset + bytes);
      bytes += 1;
    }
  }

  callback(null, bytes);
}
