"use strict";

// Parse a NetBIOS name.  This uses standard DNS name compression plus
// some extra encoding for the first part representing the NetBIOS specific
// name.  See RFC 1001.
module.exports = function(buf, offset, callback) {
  decompressName(buf, offset, function(error, nLen, name) {
    if (error) {
      callback(error);
      return;
    }

    decodeName(name, function(error, decoded, suffix) {
      if (error) {
        callback(error);
        return;
      }

      callback(null, nLen, decoded, suffix);
    });
  });
}

// Decompress the name from the packet.  The compression scheme is defined
// in RFC 883 and is the same method used in DNS packets.  Essentially, names
// are stored in parts called labels.  Each label is preceded by a 2-bit flag
// field and 6-bit length field.  In the common case the 2-bits are zero and
// the length indicates how many bytes are in that label.  The parsing process
// is terminated by a zero length label.  Alternatively, a the 2-bit flags can
// both be set indicating a label pointer.  In that case the following 14-bits
// indicate an offset into the packet from which to read the remaining labels
// for the name.
function decompressName(buf, offset, callback) {
  var name = "";
  var bytes = 0;

  var octet = buf.readUInt8(offset + bytes);
  bytes += 1;

  // The name is made up of a variable number of labels.  Each label begins
  // with a length octet.  The string of labels is ended by a zero length octet.
  while (octet) {
    var label = null;

    // The first 2-bits of the octet are flags indicating if this is a length
    // value or a label pointer to elsewhere in the packet.
    var flags = octet & 0xc0;

    // If both the top 2-bits of the octet are set, then this is an offset pointer.
    if (flags === 0xc0) {
      // NOTE:  The number of bytes parsed was already incremented.  We need
      //        to re-read that first byte to incorporate it into our pointer
      //        value.  Therefore subtract one from the offset and only add
      //        one additional byte to the parsed count.
      var pointer = buf.readUInt16BE(offset + bytes - 1) & 0x3fff;
      bytes += 1;

      // NOTE:  This will only work if the start of the buffer corresponds to
      //        the start of the packet.  If the packet is embedded in a larger
      //        buffer then we need to pass through the offset to the start of
      //        the packet.
      decompressName(buf, pointer, function(error, nLen, pointerName) {
        if (error) {
          callback(error);
          return;
        }
        label = pointerName;
      });

      if (!label) {
        return;
      }

      // Once a pointer is used the name section is complete.  We do not need
      // to keep looking for a zero length octet.  Note there is some logic at
      // the end of the loop we still want to execute, so simply set octet to
      // zero to terminate the loop instead of breaking.
      octet = 0;

    // If neither of the bits are set then the name is stored inline in the
    // following bytes.  The name length is defined by the lower 6-bits of the
    // octet.
    } else if (flags === 0) {
      var length = octet & 0x3f;

      if (offset + bytes + length > buf.length) {
        callback('Name label too large to fit in remaining packet bytes.');
        return;
      }

      label = buf.toString('ascii', offset + bytes, offset + bytes + length);
      bytes += length;

      // Look for the next label's length octet
      octet = buf.readUInt8(offset + bytes);
      bytes += 1;

    // Any other values are undefined, so throw an error.
    } else {
      callback('Label length octet at offset [' + (offset + bytes - 1) +
               '] has unexpected top 2-bits of [' + flags + '];  should be [' +
               0xc0 + '] or [0].');
      return;
    }

    // Append to the last parsed label to the name.  Separate labels with
    // periods.
    if (name.length > 0) {
      name += '.';
    }
    name += label;
  }

  callback(null, bytes, name);
}

// Decode the NetBIOS name after it has been decompressed.  The NetBIOS
// name is represented as the first part of the FQDN.  See page 26 of
// RFC 1001 for full details on the encoding algorithm.  In short, each
// byte of the original NetBIOS name is split into two nibbles.  Each
// nibble is then encoded as a separate byte by adding the ASCII value for
// 'A'.  In order to decode we therefore must reverse this logic.
function decodeName(name, callback) {
  var encoded = name;
  var periodIndex = name.indexOf('.');
  if (periodIndex > -1) {
    encoded = name.slice(0, periodIndex);
  }

  var decoded = "";
  var suffix = 0;
  var charValue = 0;;

  for(var i = 0; i < encoded.length; ++i) {

    // decode char to first nibble
    if (i % 2 === 0) {
      charValue = (encoded.charCodeAt(i) - 'A'.charCodeAt(0)) << 4;

    // decore char to second nibble and then combine with first nibble
    } else {
      charValue += encoded.charCodeAt(i) - 'A'.charCodeAt(0);

      // Append the newly decoded character for the first 15 bytes
      if (i < (encoded.length - 1)) {
        decoded += String.fromCharCode(charValue);

      // The last byte is reserved by convention as the suffix or type
      } else {
        suffix = charValue;
      }
    }
  }

  // NetBIOS names are always space padded out to 15 characters
  decoded = decoded.trim();

  // If there was a scope identifier (domain name) after the NetBIOS name
  // then re-append it to the newly decoded name.
  if (periodIndex > -1) {
    decoded += name.slice(periodIndex);
  }

  callback(null, decoded, suffix);
}
