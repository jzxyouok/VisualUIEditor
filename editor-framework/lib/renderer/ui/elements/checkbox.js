'use strict';

// ==========================
// exports
// ==========================

function ui_checkbox (checked, text) {
  let el = document.createElement('ui-checkbox');
  if ( text ) {
    el.innerText = text;
  }
  el.checked = checked;

  return el;
}

module.exports = ui_checkbox;

// ==========================
// internal
// ==========================

const JS = require('../../../share/js-utils');
const DomUtils = require('../utils/dom-utils');
const Focusable = require('../behaviors/focusable');
const ButtonState = require('../behaviors/button-state');

class CheckboxElement extends window.HTMLElement {
  /**
   * @property checked
   */
  get checked () {
    return this.getAttribute('checked') !== null;
  }
  set checked (val) {
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
  }

  /**
   * @property value
   */
  get value () {
    return this.checked;
  }
  set value (val) {
    this.checked = val;
  }

  /**
   * @property readonly
   */
  get readonly () {
    return this.getAttribute('readonly') !== null;
  }
  set readonly (val) {
    if (val) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
  }

  createdCallback () {
    let root = this.createShadowRoot();
    root.innerHTML = `
      <div class="box">
        <i class="checker icon-ok"></i>
      </div>
      <label>
        <content></content>
      </label>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/checkbox.css'),
      root.firstChild
    );

    this._initFocusable(this);
    this._initButtonState();
  }

  _clickHandler ( event ) {
    if ( this.readonly ) {
      return;
    }

    if ( this._canceledByEsc ) {
      DomUtils.acceptEvent(event);
      return;
    }

    this.checked = !this.checked;
    DomUtils.fire(this, 'change', {
      bubbles: false,
      detail: {
        value: this.checked,
      },
    });
    DomUtils.fire(this, 'confirm', {
      bubbles: false,
      detail: {
        value: this.checked,
      },
    });
  }
}
JS.addon(CheckboxElement.prototype, Focusable);
JS.addon(CheckboxElement.prototype, ButtonState);

ui_checkbox.element = CheckboxElement;
ui_checkbox.tagName = 'UI-CHECKBOX';
