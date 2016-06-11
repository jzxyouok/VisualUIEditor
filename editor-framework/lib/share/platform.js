'use strict';

/**
 * @module Platform
 */

let Platform = {};
module.exports = Platform;

// ==========================
// exports
// ==========================

/**
 * indicates whether executes in node.js application
 * @property isNode
 * @type {Boolean}
 */
Platform.isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);

/**
 * indicates whether executes in electron
 * @property isElectron
 * @type {Boolean}
 */
Platform.isElectron = !!(Platform.isNode && ('electron' in process.versions));

/**
 * indicates whether executes in native environment (compare to web-browser)
 * @property isNative
 * @type {Boolean}
 */
Platform.isNative = Platform.isElectron;

/**
 * indicates whether executes in common web browser
 * @property isPureWeb
 * @type {Boolean}
 */
Platform.isPureWeb = !Platform.isNode && !Platform.isNative; // common web browser

/**
 * indicates whether executes in common web browser, or editor's window process(electron's renderer context)
 * @property isRendererProcess
 * @type {Boolean}
 */
if (Platform.isElectron) {
  Platform.isRendererProcess = typeof process !== 'undefined' && process.type === 'renderer';
} else {
  Platform.isRendererProcess = (typeof __dirname === 'undefined' || __dirname === null);
}

/**
 * indicates whether executes in editor's core process(electron's browser context)
 * @property isMainProcess
 * @type {Boolean}
 */
Platform.isMainProcess = typeof process !== 'undefined' && process.type === 'browser';

if (Platform.isNode) {
  /**
   * indicates whether executes in OSX
   * @property isDarwin
   * @type {Boolean}
   */
  Platform.isDarwin = process.platform === 'darwin';

  /**
   * indicates whether executes in Windows
   * @property isWin32
   * @type {Boolean}
   */
  Platform.isWin32 = process.platform === 'win32';
} else {
  // http://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
  let platform = window.navigator.platform;
  Platform.isDarwin = platform.substring(0, 3) === 'Mac';
  Platform.isWin32 = platform.substring(0, 3) === 'Win';
}


/**
 * Check if running in retina display
 * @property isRetina
 * @type boolean
 */
Object.defineProperty(Platform, 'isRetina', {
  enumerable: true,
  get () {
    return Platform.isRendererProcess && window.devicePixelRatio && window.devicePixelRatio > 1;
  }
});
