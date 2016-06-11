'use strict';

const Electron = require('electron');
const EventEmitter = require('events');
const Path = require('fire-path');
const _ = require('lodash');

const app = Electron.app;
const events = new EventEmitter();

/**
 * The Editor.App is your app.js module. Read more details in
 * [Define your application](https://github.com/cocos-creator/editor-framework/blob/master/docs/manual/define-your-app.md).
 * @property App
 * @type object
 */
module.exports = {
  /**
   * The name of your app. It is defined in the `name` field in package.json
   * @property name
   * @type string
   */
  name: app.getName(),

  /**
   * your app version
   * @property version
   * @type string
   */
  version: app.getVersion(),

  /**
   * The current app.js running directory.
   * @property path
   * @type string
   */
  path: app.getAppPath(),

  /**
   * Your application's data path. Usually it is `~/.{your-app-name}`
   * @property home
   * @type string
   */
  home: Path.join(app.getPath('home'), `.${app.getName()}`),

  /**
   * If application is focused
   * @property focused
   * @type boolean
   */
  focused: false,

  /**
   * Extends Editor.App
   * @property extend
   * @type function
   */
  extend ( proto ) {
    Object.assign( this, proto );
  },

  on () {
    return events.on.apply(this,arguments);
  },

  off () {
    return events.removeListener.apply(this,arguments);
  },

  once () {
    return events.once.apply(this,arguments);
  },

  emit () {
    return events.emit.apply(this,arguments);
  },
};
