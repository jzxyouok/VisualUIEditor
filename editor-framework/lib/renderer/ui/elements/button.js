'use strict';

// ==========================
// exports
// ==========================

function ui_button (text) {
  let el = document.createElement('ui-button');
  if ( text ) {
    el.innerText = text;
  }

  return el;
}

module.exports = ui_button;

// ==========================
// internal
// ==========================

const JS = require('../../../share/js-utils');
const DomUtils = require('../utils/dom-utils');
const Focusable = require('../behaviors/focusable');
const ButtonState = require('../behaviors/button-state');

class ButtonElement extends window.HTMLElement {
  createdCallback () {
    let root = this.createShadowRoot();
    root.innerHTML = `
      <div class="inner">
        <content></content>
      </div>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/button.css'),
      root.firstChild
    );

    this._initFocusable(this);
    this._initButtonState();
  }
}

JS.addon(ButtonElement.prototype, Focusable);
JS.addon(ButtonElement.prototype, ButtonState);

ui_button.element = ButtonElement;
ui_button.tagName = 'UI-BUTTON';
