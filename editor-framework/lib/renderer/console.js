'use strict';

/**
 * @module Editor
 */
let Console = {};
module.exports = Console;

// requires
const Util = require('util');
const Ipc = require('./ipc');

// ==========================
// exports
// ==========================

/**
 * Trace the log
 * @method trace
 * @param {string} method - log method
 * @param {...*} [args] - whatever arguments the message needs
 */
Console.trace = function (level, text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, [text,...args]);
  } else {
    text = '' + text;
  }
  console.trace(text);

  let e = new Error('dummy');
  let lines = e.stack.split('\n');

  // remove stack frame of Editor.error without allocating new Array
  lines.shift();
  lines[0] = text;
  text = lines.join('\n');

  Ipc.sendToMain('editor:renderer-console-trace',level,text);
};

/**
 * Log the normal message and show on the console.
 * The method will send ipc message `editor:renderer-console-log` to core.
 * @method log
 * @param {...*} [arg] - whatever arguments the message needs
 */
Console.log = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.log(text);
  Ipc.sendToMain('editor:renderer-console-log', text);
};

Console.success = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.log('%c' + text, 'color: green');
  Ipc.sendToMain('editor:renderer-console-success', text);
};

Console.failed = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.log('%c' + text, 'color: red');
  Ipc.sendToMain('editor:renderer-console-failed', text);
};

Console.info = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.info(text);
  Ipc.sendToMain('editor:renderer-console-info', text);
};

Console.warn = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.warn(text);
  Ipc.sendToMain('editor:renderer-console-warn', text);
};

Console.error = function (text, ...args) {
  if ( args.length ) {
    text = Util.format.apply(Util, arguments);
  } else {
    text = '' + text;
  }
  console.error(text);

  let e = new Error('dummy');
  let lines = e.stack.split('\n');

  // remove stack frame of Editor.error without allocating new Array
  lines.shift();
  lines[0] = text;
  text = lines.join('\n');

  Ipc.sendToMain('editor:renderer-console-error',text);
};
