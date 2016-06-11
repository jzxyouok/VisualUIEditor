'use strict';

/**
 * @module Editor
 */
let Console = {};
module.exports = Console;

// requires
const Electron = require('electron');
const Util = require('util');
const Winston = require('winston');

const Ipc = require('./ipc');

let _consoleConnected = false;
let _logs = [];

// ==========================
// exports
// ==========================

/**
 * Trace the log
 * @method trace
 * @param {string} method - log method
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.trace = function (level,...args) {
  let text = Util.format.apply(Util, args);

  let err = new Error('dummy');
  let lines = err.stack.split('\n');

  // remove stack frame of Editor.error without allocating new Array
  lines.shift();
  lines[0] = text;
  text = lines.join('\n');

  if ( _consoleConnected ) {
    _logs.push({ type: level, message: text });
  }

  Winston[level](text);
  Ipc.sendToWins(`editor:console-${level}`,text);
};

/**
 * Log the normal message and show on the console.
 * The method will send ipc message `editor:console-log` to all windows.
 * @method log
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.log = function (...args) {
  let text = Util.format.apply(Util, args);

  if ( _consoleConnected ) {
    _logs.push({ type: 'log', message: text });
  }

  Winston.normal(text);
  Ipc.sendToWins('editor:console-log',text);
};

/**
 * Log the success message and show on the console
 * The method will send ipc message `editor:console-success` to all windows.
 * @method success
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.success = function (...args) {
  let text = Util.format.apply(Util, args);

  if ( _consoleConnected ) {
    _logs.push({ type: 'success', message: text });
  }

  Winston.success(text);
  Ipc.sendToWins('editor:console-success',text);
};

/**
 * Log the failed message and show on the console
 * The method will send ipc message `editor:console-failed` to all windows.
 * @method failed
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.failed = function (...args) {
  let text = Util.format.apply(Util, args);

  if ( _consoleConnected ) {
    _logs.push({ type: 'failed', message: text });
  }

  Winston.failed(text);
  Ipc.sendToWins('editor:console-failed',text);
};

/**
 * Log the info message and show on the console
 * The method will send ipc message `editor:console-info` to all windows.
 * @method info
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.info = function (...args) {
  let text = Util.format.apply(Util, args);

  if ( _consoleConnected ) {
    _logs.push({ type: 'info', message: text });
  }

  Winston.info(text);
  Ipc.sendToWins('editor:console-info',text);
};

/**
 * Log the warnning message and show on the console,
 * it also shows the call stack start from the function call it.
 * The method will send ipc message `editor:console-warn` to all windows.
 * @method warn
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.warn = function (...args) {
  let text = Util.format.apply(Util, args);

  if ( _consoleConnected ) {
    _logs.push({ type: 'warn', message: text });
  }

  Winston.warn(text);
  Ipc.sendToWins('editor:console-warn',text);
};

/**
 * Log the error message and show on the console,
 * it also shows the call stack start from the function call it.
 * The method will sends ipc message `editor:console-error` to all windows.
 * @method error
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.error = function (...args) {
  let text = Util.format.apply(Util, args);

  let err = new Error('dummy');
  let lines = err.stack.split('\n');

  // remove stack frame of Editor.error without allocating new Array
  lines.shift();
  lines[0] = text;
  text = lines.join('\n');

  if ( _consoleConnected ) {
    _logs.push({ type: 'error', message: text });
  }

  Winston.error(text);
  Ipc.sendToWins('editor:console-error',text);
};

/**
 * Log the fatal message and show on the console,
 * the app will quit immediately after that.
 * @method fatal
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.fatal = function (...args) {
  let text = Util.format.apply(Util, args);

  let e = new Error('dummy');
  let lines = e.stack.split('\n');

  // remove stack frame of Editor.error without allocating new Array
  lines.shift();
  lines[0] = text;
  text = lines.join('\n');

  if ( _consoleConnected ) {
    _logs.push({ type: 'fatal', message: text });
  }

  Winston.fatal(text);
  // NOTE: fatal error will close app immediately, no need for ipc.
};

/**
 * Connect to console panel. Once the console connected, all logs will kept in `core-level` and display
 * on the console panel in `page-level`.
 * @method connectToConsole
 */
Console.connectToConsole = function () {
  _consoleConnected = true;
};

/**
 * Clear the logs
 * @method clearLog
 */
Console.clearLog = function () {
  _logs = [];
  Ipc.sendToAll('editor:console-clear');
};

// ==========================
// Ipc Events
// ==========================

const ipcMain = Electron.ipcMain;

function _logInMain (level, text, ...args) {
  text = Util.format.apply(Util, [text,...args]);

  if ( _consoleConnected ) {
    _logs.push({ type: level, message: text });
  }

  if ( level === 'log' ) {
    Winston.normal(text);
  } else {
    Winston[level](text);
  }
  Ipc.sendToWins(`editor:console-${level}`,text);
}

ipcMain.on('editor:renderer-console-log', (event, ...args) => {
  _logInMain.apply(null, ['log',...args]);
});

ipcMain.on('editor:renderer-console-success', (event, ...args) => {
  _logInMain.apply(null, ['success',...args]);
});

ipcMain.on('editor:renderer-console-failed', (event, ...args) => {
  _logInMain.apply(null, ['failed',...args]);
});

ipcMain.on('editor:renderer-console-info', (event, ...args) => {
  _logInMain.apply(null, ['info',...args]);
});

ipcMain.on('editor:renderer-console-warn', (event, ...args) => {
  _logInMain.apply(null, ['warn',...args]);
});

ipcMain.on('editor:renderer-console-error', (event, ...args) => {
  _logInMain.apply(null, ['error',...args]);
});

ipcMain.on('editor:renderer-console-trace', (event, level, ...args) => {
  _logInMain.apply(null, [level,...args]);
});

ipcMain.on('editor:console-query', ( event ) => {
  event.reply(null,_logs);
});
