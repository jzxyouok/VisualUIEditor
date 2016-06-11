'use strict';

/**
 * @module Ipc
 */
let Ipc = {};
module.exports = Ipc;

// requires
const Electron = require('electron');

const IpcBase = require('../share/ipc');
const Console = require('./console');
const Panel = require('./panel');

const ipcRenderer = Electron.ipcRenderer;

// get window id
const winID = Electron.remote.getCurrentWindow().id;

let _nextSessionId = 1000;
let _id2sessionInfo = {};
let _debug = false;

let _checkReplyArgs = IpcBase._checkReplyArgs;
let _popOptions = IpcBase._popOptions;
let _popReplyAndTimeout = IpcBase._popReplyAndTimeout;

let ErrorTimeout = IpcBase.ErrorTimeout;

// ==========================
// exports
// ==========================

// Communication Patterns

Ipc.option = IpcBase.option;

/**
 * Broadcast message with `...args` to all opened windows and main process
 * @method sendToAll
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options by Editor.Ipc.option({ excludeSelf: true })
 */
Ipc.sendToAll = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must be string');
    return;
  }

  ipcRenderer.send.apply( ipcRenderer, ['editor:ipc-renderer2all', message, ...args] );
};

/**
 * Broadcast message with `...args` to all opened window.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @method sendToWins
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @param {object} [options] - you can indicate the options by Editor.Ipc.option({ excludeSelf: true })
 */
Ipc.sendToWins = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must be string');
    return;
  }

  ipcRenderer.send.apply( ipcRenderer, ['editor:ipc-renderer2wins', message, ...args] );
};

/**
 * Send message with `...args` to main process synchronized and return a result which is responded from main process
 * @method sendToMainSync
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 * @return {Object} results
 */
Ipc.sendToMainSync = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must be string');
    return;
  }

  return ipcRenderer.sendSync.apply( ipcRenderer, [message, ...args] );
};

/**
 * Send message with `...args` to main process asynchronously.
 * @method sendToMain
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 */
Ipc.sendToMain = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must be string');
    return;
  }

  let opts = _popReplyAndTimeout(args);
  let sessionId;

  if ( opts ) {
    sessionId = _newSession(message, `${winID}@renderer`, opts.reply, opts.timeout);

    args = ['editor:ipc-renderer2main', message, ...args, Ipc.option({
      sessionId: sessionId,
      waitForReply: true,
      timeout: opts.timeout, // this is only used as debug info
    })];
  } else {
    args = [message, ...args];
  }

  ipcRenderer.send.apply( ipcRenderer, args );

  return sessionId;
};

/**
 * Send message with `...args` to main process by package name and the short name of the message
 * @method sendToPackage
 * @param {string} pkgName - the package name
 * @param {string} message - the short name of the message
 * @param {...*} [args] - whatever arguments the message needs
 */
Ipc.sendToPackage = function (pkgName, message, ...args) {
  return Ipc.sendToMain.apply(null, [`${pkgName}:${message}`, ...args]);
};

/**
 * Send message with `...args` to specific panel
 * @method sendToPanel
 * @param {string} panelID - the panel id
 * @param {string} message
 * @param {...*} [arg] - whatever arguments the message needs
 */
Ipc.sendToPanel = function (panelID, message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must string');
    return;
  }

  let opts = _popReplyAndTimeout(args);
  let sessionId;

  if ( opts ) {
    sessionId = _newSession(message, `${panelID}@renderer`, opts.reply, opts.timeout);

    args = ['editor:ipc-renderer2panel', panelID, message, ...args, Ipc.option({
      sessionId: sessionId,
      waitForReply: true,
      timeout: opts.timeout, // this is used in main to start a transfer-session timeout
    })];
  } else {
    args = ['editor:ipc-renderer2panel', panelID, message, ...args];
  }

  ipcRenderer.send.apply( ipcRenderer, args );

  return sessionId;
};

/**
 * Broadcast message with `...args` to main window.
 * The page is so called as atom shell's web side. Each application window is an independent page and has its own JavaScript context.
 * @method sendToMainWin
 * @param {string} message
 * @param {...*} [args] - whatever arguments the message needs
 */
Ipc.sendToMainWin = function (message, ...args) {
  if ( typeof message !== 'string' ) {
    Console.error('The message must be string');
    return;
  }

  ipcRenderer.send.apply( ipcRenderer, ['editor:ipc-renderer2mainwin', message, ...args] );
};

/**
 * Cancel request sent to core by sessionId
 * @method cancel
 * @param {number} sessionId
 */
// TODO: callback ??
Ipc.cancelRequest = function (sessionId) {
  _closeSession(sessionId);
};

Object.defineProperty(Ipc, 'debug', {
  enumerable: true,
  get () { return _debug; },
  set ( value ) { _debug = value; },
});

// ========================================
// Internal
// ========================================

function _newSession ( message, prefix, fn, timeout ) {
  let sessionId = `${prefix}:${_nextSessionId++}`;
  let timeoutId;

  if ( timeout !== -1 ) {
    timeoutId = setTimeout(() => {
      let info = _id2sessionInfo[sessionId];

      if ( info ) {
        delete _id2sessionInfo[sessionId];

        info.callback(new ErrorTimeout( message, sessionId, timeout ));
      }

      // DISABLE
      // if ( _debug ) {
      //   Console.warn(`ipc timeout. message: ${message}, session: ${sessionId}`);
      // }
    }, timeout);
  }

  _id2sessionInfo[sessionId] = {
    sessionId: sessionId,
    timeoutId: timeoutId,
    callback: fn,
  };

  return sessionId;
}

function _closeSession ( sessionId ) {
  let info = _id2sessionInfo[sessionId];

  if ( info ) {
    delete _id2sessionInfo[info.sessionId];

    if ( info.timeoutId ) {
      clearTimeout(info.timeoutId);
    }
  }

  return info;
}

function _main2rendererOpts (event, message, ...args) {
  if ( args.length === 0 ) {
    return ipcRenderer.emit( message, event );
  }

  // process waitForReply option
  let opts = _popOptions(args);
  if ( opts && opts.waitForReply ) {
    // NOTE: do not directly use event.sender, Console in event.reply, it will cause Electron devtools crash
    let sender = event.sender;
    let msg = message;
    event.reply = function (...replyArgs) {
      if ( _debug && !_checkReplyArgs(replyArgs) ) {
        Console.warn(`Invalid argument for event.reply of "${msg}": the first argument must be instance of Error or null`);
        // return; // TEMP DISABLE
      }

      let replyOpts = Ipc.option({
        sessionId: opts.sessionId
      });
      replyArgs = [`editor:ipc-reply`, ...replyArgs, replyOpts];
      return sender.send.apply( sender, replyArgs );
    };
  }

  // refine the args
  args = [message, event, ...args];
  return ipcRenderer.emit.apply( ipcRenderer, args );
}

// ========================================
// Ipc
// ========================================

ipcRenderer.on('editor:ipc-main2panel', (event, panelID, message, ...args) => {
  // process waitForReply option
  let opts = _popOptions(args);
  if ( opts && opts.waitForReply ) {
    // NOTE: do not directly use event, message in event.reply, it will cause Electron devtools crash
    let sender = event.sender;
    let msg = message;
    event.reply = function (...replyArgs) {
      if ( _debug && !_checkReplyArgs(replyArgs) ) {
        Console.warn(`Invalid argument for event.reply of "${msg}": the first argument must be instance of Error or null`);
        // return; // TEMP DISABLE
      }

      let replyOpts = Ipc.option({
        sessionId: opts.sessionId
      });
      replyArgs = [`editor:ipc-reply`, ...replyArgs, replyOpts];
      return sender.send.apply( sender, replyArgs );
    };
  }

  // refine the args
  args = [panelID, message, event, ...args];
  Panel._dispatch.apply( Panel, args );
});

ipcRenderer.on('editor:ipc-main2renderer', (event, message, ...args) => {
  if ( _main2rendererOpts.apply ( null, [event, message, ...args] ) === false ) {
    Console.failed( `Message "${message}" from main to renderer failed, not responded.` );
  }
});

ipcRenderer.on('editor:ipc-reply', (event, ...args) => {
  let opts = _popOptions(args);

  // NOTE: we must close session before it apply, this will prevent window.close() invoked in
  // reply callback will make _closeSession called second times.
  let info = _closeSession(opts.sessionId);
  if (info) {
    info.callback.apply(null, args);
  }
});
