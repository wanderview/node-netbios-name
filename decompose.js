// Decompose a given fully qualified domain name (FQDN) into a NetBIOS name and
// its accompanying scope ID.  All NetBIOS names are a fixed width of 16-bytes
// consisting of 15 name bytes and a single trailing suffix byte.  This routine
// will pad the first element of the FQDN out to 15-bytes using space
// characters.  An FQDN whose first part is greater than 15-bytes produces an
// error.  The scope ID does not include the initial dot.
//
// For example:
//
//    decompose('foobar.example.com', function(error, nbname, scope) {
//      nbname; // 'foobar         '
//      scope;  // 'example.com'
//    });

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
    callback('NetBIOS name [' + shortName + '] too long.  Must be <= 15 chars.');
    return;
  }

  // space pad NetBIOS name out to 15 characters
  var netbiosName = shortName;
  for (var i = 0; (shortName.length + i) < 15; ++i) {
    netbiosName += ' ';
  }

  callback(null, netbiosName, scopeId);
};
