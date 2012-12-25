# node-netbios-name

A utility module for working with NetBIOS names as defined in [RFC1001][],
[RFC1002][], and [RFC883][].

[RFC1001]: http://tools.ietf.org/rfc/rfc1001.txt
[RFC1002]: http://tools.ietf.org/rfc/rfc1002.txt
[RFC883]: http://tools.ietf.org/rfc/rfc883.txt

## Example

    var nbname = require('netbios-name');
    var fqdn = 'foobar.example.com';
    var suffix = 0x20;

    nbname.decompose(fqdn, function(error, netbiosName, scopeId) {
      netbiosName === 'foobar         ';  // true
      scopeId === 'example.com';          // true
    };

    var buf = new Buffer(128);
    var offset = 0;
    var nameMap = {};
    nbname.pack(buf, offset, nameMap, fqdn, suffix, function(error, pLen) {
      pLen === (1 + 32 + 1 + 7 + 1 + 3 + 1);   // true

      nbname.unpack(buf, offset, function(error, uLen, uName, uSuffix) {
        uLen === pLen;        // true
        uName === fqdn;       // true
        uSuffix === suffix;   // true
      });
    });

## decompose(fqdn, callback)

* `fqdn` {String} Fully qualified domain name.  The first label must be
  15-bytes or less in length.
* `callback` {Function} Callback function
  * `error` {String} Set if the FQDN is not a legal NetBIOS name
  * `netbiosName` {String} First label from the FQDN padded out to 15-bytes
    with spaces.
  * `scopeId` {String} The remaining domain name from the FQDN without the
    leading dot.

## pack(buf, offset, nameMap, fqdn, suffix, callback)

## unpack(buf, offset, callback)
