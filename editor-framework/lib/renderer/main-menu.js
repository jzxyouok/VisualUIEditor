'use strict';

/**
 * @module MainMenu
 */
let MainMenu = {};
module.exports = MainMenu;

// requires
const Ipc = require('./ipc');
const Menu = require('./menu');

// ==========================
// exports
// ==========================

MainMenu.init = function () {
  Ipc.sendToMain('main-menu:init');
};

MainMenu.apply = function () {
  Ipc.sendToMain('main-menu:apply');
};

MainMenu.update = function ( path, template ) {
  if ( Menu.checkTemplate(template) ) {
    Ipc.sendToMain('main-menu:update', path, template);
  }
};

MainMenu.add = function ( path, template ) {
  if ( Menu.checkTemplate(template) ) {
    Ipc.sendToMain('main-menu:add', path, template);
  }
};

MainMenu.remove = function ( path ) {
  Ipc.sendToMain('main-menu:remove', path);
};

MainMenu.set = function ( path, options ) {
  Ipc.sendToMain('main-menu:set', path, options);
};
