# node-netbios-name

A utility module for working with NetBIOS names as defined in [RFC1001][],
[RFC1002][], and [RFC883][].

## Example

    var nbname = require('netbios-name');

    var fqdn = 'foobar.example.com';
    var suffix = 0x20;

    nbname.decompose(fqdn, function(error, netbiosName, scopeId) {
      netbiosName === 'foobar         ';  // true
      scopeId === 'example.com';          // true
    };

    var buf = new Buffer(128);
    nbname.pack(buf, 0, {}, fqdn, suffix, function(error, pLen) {
      pLen === (1 + 32 + 1 + 7 + 1 + 3 + 1);   // true

      nbname.unpack(buf, offset, function(error, uLen, uName, uSuffix) {
        uLen === pLen;        // true
        uName === fqdn;       // true
        uSuffix === suffix;   // true
      });
    });

## decompose(name, callback)

Decompose a given fully qualified domain name (FQDN) into a NetBIOS name and
its accompanying scope ID.  All NetBIOS names are a fixed width of 16-bytes
consisting of 15 name bytes and a single trailing suffix byte.  This routine
will pad the first element of the FQDN out to 15-bytes using space characters.
An FQDN whose first part is greater than 15-bytes produces an error.  The
scope ID does not include the initial dot.

* `name` {String} Fully qualified domain name.  The first label must be
  15-bytes or less in length.
* `callback` {Function} Callback function
  * `error` {Error object} Set if the FQDN is not a legal NetBIOS name.
  * `netbiosName` {String} First label from the FQDN padded out to 15-bytes
    with spaces.
  * `scopeId` {String} The remaining domain name from the FQDN without the
    leading dot.

Example:

    decompose('foobar.example.com', function(error, nbname, scope) {
      nbname; // 'foobar         '
      scope;  // 'example.com'
    });

## pack(buf, offset, nameMap, name, suffix, callback)

Serialize a fully qualified domain name (FQDN) and its accompanying NetBIOS
suffix byte into the given buffer.  The serialization is implemented using
NetBIOS encoding from [RFC1001][] and domain name compression from [RFC883][].

Name compression supports the ability to use offset pointers for duplicated
labels within a buffer.  In order to use this feature the same nameMap hash
must be passed into all pack() calls operating on the same buffer.  If you
do not want to use label pointers, pass null for the nameMap.

* `buf` {Buffer} The buffer to write the name to.
* `offset` {Number} An index into the buffer indicating where to begin writing
  the name.
* `nameMap` {Object | null} An optional map that will be used to record where
  each name element is stored in the offset.  Subsequent calls to pack() with
  the same map will result in a pointer to the previously stored offset.  If
  null is passed for the name map, then pointers will not be used.
* `name` {String} The fully qualified domain name to serialize.  The first''
  label in the name must be 15 characters or less in length.
* `suffix` {Number} The NetBIOS name suffix byte indicating the node type.
* `callback` {Function}
  * `error` {Error object} Set if the name is illegal or the buffer is too
    small.
  * `len` {Number} The number of bytes parsed from the buffer.

Example:

    var buf = new Buffer(512);
    var nameMap = {};
    var offset = 0;
    pack(buf, offset, nameMap, 'foobar.hmm.com', 0x20, function(error, nLen) {
      if (error) { // handle error... }

      offset += nLen;

      pack(buf, offset, nameMap, 'snafu.hmm.com', 0x20, function(error, nLen) {
        if (error) { // handle error... }

        offset += nLen;

        // the 'hmm.com' portion of the name will be packed using pointers
        // using only 2 bytes instead of the normal 9 bytes.
      });
    });

## unpack(buf, offset, callback)

Deserialize the given buffer storing an encoded and compressed NetBIOS
name.  The name serialization format is defined by the NetBIOS encoding in
RFC1001 and the domain name compression in RFC883:

* `buf` {Buffer} The buffer to read the name from.
* `offset` {Number} The index into the buffer at which to start reading.
* `callback` {Function}
  * `error` {Error object} Set if the name cannot be read from the given
    buffer location.
  * `len` {Number} The number of bytes read from the buffer.
  * `name` {String} The fully qualified domain name read from the buffer.
  * `suffix` {Number} The NetBIOS name suffix byte indicating the node type.

Example:

    var offset = 0;
    unpack(buf, offset, function(error, nLen, name, suffix) {
      if (error) { // handle error... }

      offset += nLen;             // number of bytes parsed from the buffer
      name === 'foobar.hmm.com';  // FQDN parsed from the buffer
      suffix === 0x20;            // Suffix byte from name defining node type
    });

[RFC1001]: http://tools.ietf.org/rfc/rfc1001.txt
[RFC1002]: http://tools.ietf.org/rfc/rfc1002.txt
[RFC883]: http://tools.ietf.org/rfc/rfc883.txt
