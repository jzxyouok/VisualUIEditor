'use strict';

/**
 * @module Menu
 */
let Menu = {};
module.exports = Menu;

// requires
const Ipc = require('./ipc');
const Console = require('./console');

// ==========================
// exports
// ==========================

Menu.checkTemplate = function ( template ) {
  // ensure no click
  for ( var i = 0; i < template.length; ++i ) {
    var item = template[i];

    if ( item.click ) {
      Console.error('Not support to use click in page-level menu declaration, it may caused dead lock due to ipc problem in Electron');
      return false;
    }

    if ( item.submenu && !Menu.checkTemplate(item.submenu) ) {
      return false;
    }
  }
  return true;
};

/**
 * @param {object} template - menu template
 * @param {number} [x] - position x
 * @param {number} [y] - position y
 */
Menu.popup = function (template, x, y) {
  if ( Menu.checkTemplate(template) ) {
    Ipc.sendToMain('menu:popup', template, x, y);
  }
};

/**
 * @param {string} name - name of the register menu
 * @param {object} tmpl - menu template
 * @param {boolean} [force] - force to register a menu even it was registered before.
 */
Menu.register = function ( name, tmpl, force ) {
  if ( Menu.checkTemplate(tmpl) ) {
    Ipc.sendToMain('menu:register', name, tmpl, force);
  }
};

/**
 * @param {object[]|object} template
 * @param {function} fn
 */
Menu.walk = function ( template, fn ) {
  if ( !Array.isArray(template) ) {
    template = [template];
  }

  template.forEach(item => {
    fn(item);
    if ( item.submenu ) {
      Menu.walk( item.submenu, fn );
    }
  });
};
