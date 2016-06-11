'use strict';

const Electron = require('electron');
const ipcRenderer = Electron.ipcRenderer;

// ==========================
// exports
// ==========================

let Dialog = {
  openFile (...args) {
    return ipcRenderer.sendSync.apply(ipcRenderer, [
      'dialog:open-file', ...args
    ]);
  },

  saveFile (...args) {
    return ipcRenderer.sendSync.apply(ipcRenderer, [
      'dialog:save-file', ...args
    ]);
  },

  messageBox (...args) {
    return ipcRenderer.sendSync.apply(ipcRenderer, [
      'dialog:message-box', ...args
    ]);
  },
};

module.exports = Dialog;
