'use strict';

const Electron = require('electron');
const Platform = require('./platform');

let _ipc = null;
if ( Platform.isMainProcess ) {
  _ipc = Electron.ipcMain;
} else {
  _ipc = Electron.ipcRenderer;
}

// ==========================
// exports
// ==========================

/**
 * @module Editor
 */

class IpcListener {
  /**
   * Ipc class for easily manage ipc events
   * @class Editor.IpcListener
   * @constructor
   */
  constructor () {
    this.listeningIpcs = [];
  }

  /**
   * Register ipc message and respond it with the callback function
   * @method on
   * @param {string} message
   * @param {function} callback
   */
  on (message, callback) {
    _ipc.on( message, callback );
    this.listeningIpcs.push( [message, callback] );
  }

  /**
   * Register ipc message and respond it once with the callback function
   * @method once
   * @param {string} message
   * @param {function} callback
   */
  once (message, callback) {
    _ipc.once( message, callback );
    this.listeningIpcs.push( [message, callback] );
  }

  /**
   * Clear all registered ipc messages in this ipc listener
   * @method clear
   */
  clear () {
    for (let i = 0; i < this.listeningIpcs.length; i++) {
      let pair = this.listeningIpcs[i];
      _ipc.removeListener( pair[0], pair[1] );
    }
    this.listeningIpcs.length = 0;
  }
}

module.exports = IpcListener;
