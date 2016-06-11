'use strict';

// ==========================
// exports
// ==========================

function ui_select (text) {
  let el = document.createElement('ui-select');
  el.innerText = text;

  return el;
}

module.exports = ui_select;

// ==========================
// internal
// ==========================

const JS = require('../../../share/js-utils');
const DomUtils = require('../utils/dom-utils');
const FocusMgr = require('../utils/focus-mgr');
const Focusable = require('../behaviors/focusable');

class SelectElement extends window.HTMLElement {
  /**
   * @property value
   */
  get value () {
    return this._select.value;
  }
  set value (val) {
    this._select.value = val;
  }

  /**
   * @property selectedIndex
   */
  get selectedIndex () {
    return this._select.selectedIndex;
  }
  set selectedIndex (val) {
    this._select.selectedIndex = val;
  }

  /**
   * @property selectedText
   */
  get selectedText () {
    return this._select.item(this._select.selectedIndex).text;
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
      <select></select>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/select.css'),
      root.firstChild
    );

    // init _select
    this._select = root.querySelector('select');

    let list = [].slice.call( this.children, 0 );
    list.forEach(el => {
      this._select.add(el, null);
    });

    let initValue = this.getAttribute('value');
    if ( initValue !== null ) {
      this._select.value = initValue;
    }

    // init focusable
    this._initFocusable(this._select);

    // process events
    this.addEventListener('mousedown', this._mouseDownHandler);

    this._select.addEventListener('keydown', event => {
      if ( this.disabled ) {
        event.preventDefault();
        return;
      }

      if ( this.readonly ) {
        event.preventDefault();
        return;
      }

      // arrow-up & arrow-down should be used as navigation
      if (
        event.keyCode === 38 ||
        event.keyCode === 40
      ) {
        event.preventDefault();
      }

      // if this is not space key, prevent typing for select
      if ( event.keyCode !== 32 && !event.ctrlKey && !event.metaKey ) {
        event.preventDefault();
      }
    });

    this._select.addEventListener('change', event => {
      DomUtils.acceptEvent(event);
      DomUtils.fire(this, 'confirm', {
        bubbles: false,
        detail: {
          index: this.selectedIndex,
          value: this.value,
          text: this.selectedText,
        },
      });
    });
  }

  _mouseDownHandler (event) {
    event.stopPropagation();

    this._mouseStartX = event.clientX;
    if ( !this._inputFocused ) {
      this._selectAllWhenMouseUp = true;
    }
    FocusMgr._setFocusElement(this);

    if ( this.readonly ) {
      DomUtils.acceptEvent(event);
      return;
    }
  }

  addItem (value, text, beforeIndex) {
    let optEL = document.createElement("option");
    optEL.value = value;
    optEL.text = text;

    let beforeEL;
    if ( beforeIndex !== undefined ) {
      beforeEL = this._select.item(beforeIndex);
    } else {
      beforeEL = null;
    }
    this._select.add( optEL, beforeEL );
  }

  // NOTE: do not use remove which is DOM function
  removeItem (index) {
    this._select.remove(index);
  }

  clear () {
    DomUtils.clear(this._select);
  }
}

JS.addon(SelectElement.prototype, Focusable);

ui_select.element = SelectElement;
ui_select.tagName = 'UI-SELECT';
