'use strict';

/**
 * @module Editor.Dialog
 */
let Dialog = {};
module.exports = Dialog;

// requires
const Electron = require('electron');
const Console = require('./console');

const dialog = Electron.dialog;

// ==========================
// exports
// ==========================

Dialog.openFile = function (...args) {
  try {
    return dialog.showOpenDialog.apply( dialog, args );
  } catch (err) {
    Console.error(err);
  }
  return null;
};

Dialog.saveFile = function (...args) {
  try {
    return dialog.showSaveDialog.apply( dialog, args );
  } catch (err) {
    Console.error(err);
  }
  return null;
};

Dialog.messageBox = function (...args) {
  try {
    return dialog.showMessageBox.apply( dialog, args );
  } catch (err) {
    Console.error(err);
  }
  return null;
};

// ==========================
// Ipc
// ==========================

const ipcMain = Electron.ipcMain;

ipcMain.on('dialog:open-file', function (event, ...args) {
  let result = Dialog.openFile.apply( Dialog, args );
  if ( result === undefined ) {
    result = -1;
  }
  event.returnValue = result;
});

ipcMain.on('dialog:save-file', function (event, ...args) {
  let result = Dialog.saveFile.apply( Dialog, args );
  if ( result === undefined ) {
    result = -1;
  }
  event.returnValue = result;
});

ipcMain.on('dialog:message-box', function (event, ...args) {
  let result = Dialog.messageBox.apply( Dialog, args );
  if ( result === undefined ) {
    result = -1;
  }
  event.returnValue = result;
});
