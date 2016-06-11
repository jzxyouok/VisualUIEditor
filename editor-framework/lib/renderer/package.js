'use strict';

/**
 * @module Package
 */
let Package = {};
module.exports = Package;

// requires
const Ipc = require('./ipc');

// ==========================
// exports
// ==========================

Package.reload = function ( name ) {
  Ipc.sendToMain('editor:package-reload', name);
};

Package.queryInfos = function ( cb ) {
  Ipc.sendToMain('editor:package-query-infos', cb);
};

Package.queryInfo = function ( name, cb ) {
  Ipc.sendToMain('editor:package-query-info', name, cb);
};
