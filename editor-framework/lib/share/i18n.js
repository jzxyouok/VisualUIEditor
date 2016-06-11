'use strict';

const Polyglot = require('node-polyglot');

let polyglot = new Polyglot();
let i18nReg = /^i18n:/;

// ==========================
// exports
// ==========================

// TODO: dynamically switch language:
// To achieve this:
//  - automatically load and replace language phrases
//  - automatically update menus
//  - automatically update panel and widget

// TODO: menu i18n solution

// TODO: panel can have i18n solution inside it,
//       so that panel load will register its i18n phrases to polyglot
//       panel unload will clear its i18n phrases
// P.S. the panel i18n translate could be _T(key) it will turn to Editor.T(`${panelID}`.key)

module.exports = {
  format ( text ) {
    if ( i18nReg.test(text) ) {
      return polyglot.t(text.substr(5));
    }

    return text;
  },

  formatPath ( path ) {
    let texts = path.split('/');

    texts = texts.map(text => {
      return this.format(text);
    });

    return texts.join('/');
  },

  t ( key, option ) {
    return polyglot.t(key, option);
  },

  extend ( phrases ) {
    polyglot.extend(phrases);
  },

  replace ( phrases ) {
    polyglot.replace(phrases);
  },

  unset ( phrases ) {
    polyglot.unset(phrases);
  },

  clear () {
    polyglot.clear();
  },

  _phrases () {
    return polyglot.phrases;
  },

  get polyglot () {
    return polyglot;
  }
};
