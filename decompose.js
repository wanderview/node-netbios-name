"use strict";

// Extract the first part of the full domain fullName as the simple Netbios
// fullName.  Then pad out to 15-bytes as the official Netbios short name
// is fixed with.
module.exports = function(fullName, callback) {
  // Only the first part of the domain fullName should be encoded as a NetbIOS
  // fullName.
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

  var netbiosName = shortName;

  // space pad fullName out to 15 characters
  for (var i = 0; (shortName.length + i) < 15; ++i) {
    netbiosName += ' ';
  }

  callback(null, netbiosName, scopeId);
};
