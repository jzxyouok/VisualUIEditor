'use strict';

// ==========================
// exports
// ==========================

function ui_color (color) {
  let el = document.createElement('ui-color');
  if ( color ) {
    el.value = color;
  }

  return el;
}

module.exports = ui_color;

// a global color picker
let _colorPicker;

// ==========================
// internal
// ==========================

const Chroma = require('chroma-js');

const JS = require('../../../share/js-utils');
const DomUtils = require('../utils/dom-utils');
const FocusMgr = require('../utils/focus-mgr');
const Focusable = require('../behaviors/focusable');
const ColorPicker = require('./color-picker');

class ColorElement extends window.HTMLElement {

  get value () { return this._value; }
  set value (val) {
    let rgba = Chroma(val).rgba();
    if ( rgba !== this._value ) {
      this._value = rgba;

      this._updateRGB();
      this._updateAlpha();
    }
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
      this._input.readOnly = true;
    } else {
      this.removeAttribute('readonly');
      this._input.readOnly = false;
    }
  }

  createdCallback () {
    let root = this.createShadowRoot();
    root.innerHTML = `
      <div class="inner">
        <div class="rgb"></div>
        <div class="alpha"></div>
      </div>
      <div class="mask"></div>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/color.css'),
      root.firstChild
    );

    this._rgb = root.querySelector('.rgb');
    this._alpha = root.querySelector('.alpha');
    this._showing = false;

    // init _value
    let value = this.getAttribute('value');
    if ( value !== null ) {
      this._value = Chroma(value).rgba();
    } else {
      this._value = [255,255,255,1];
    }

    // update control
    this._updateRGB();
    this._updateAlpha();

    //
    this._initFocusable(this);
    this._initEvents();

    // init global color-picker
    if ( !_colorPicker ) {
      _colorPicker = new ColorPicker();
      _colorPicker.style.position = 'fixed';
      _colorPicker.style.zIndex = 999;
      _colorPicker.style.display = 'none';
    }
  }

  _initEvents () {
    this.addEventListener('mousedown', event => {
      if ( this.disabled ) {
        return;
      }

      DomUtils.acceptEvent(event);

      FocusMgr._setFocusElement(this);

      if ( this.readonly ) {
        return;
      }

      if ( this._showing ) {
        this._showColorPicker(false);
      } else {
        this._showColorPicker(true);

        _colorPicker.value = this.value;
      }
    });

    this.addEventListener('keydown', event => {
      if ( this.readonly || this.disabled ) {
        return;
      }

      // space or enter
      if (
        event.keyCode === 13 ||
        event.keyCode === 32
      ) {
        DomUtils.acceptEvent(event);

        this._showColorPicker(true);
      }
    });

    // color picker events
    this._hideFn = event => {
      if ( event.detail.confirm ) {
        this._initValue = this.value;

        DomUtils.fire(this, 'confirm', {
          bubbles: false,
          detail: {
            value: this.value,
          },
        });
      } else {
        this.value = this._initValue;

        DomUtils.fire(this, 'change', {
          bubbles: false,
          detail: {
            value: this.value,
          },
        });

        DomUtils.fire(this, 'cancel', {
          bubbles: false,
          detail: {
            value: this.value,
          },
        });
      }
      this._showColorPicker(false);
    };

    this._changeFn = event => {
      DomUtils.acceptEvent(event);
      this.value = event.detail.value;

      DomUtils.fire(this, 'change', {
        bubbles: false,
        detail: {
          value: this.value,
        },
      });
    };
  }

  _updateRGB () {
    this._rgb.style.backgroundColor = Chroma(this._value).hex();
  }

  _updateAlpha () {
    this._alpha.style.width = `${this._value[3]*100}%`;
  }

  _equals ( val ) {
    if ( this._value.length !== val.length ) {
      return false;
    }

    return this._value[0] === val[0]
      && this._value[1] === val[1]
      && this._value[2] === val[2]
      && this._value[3] === val[3]
      ;
  }

  _showColorPicker (show) {
    if ( this._showing === show ) {
      return;
    }

    // DISABLE
    // // if the color-picker is showing for different target, hide it first
    // if ( _colorPicker._target && _colorPicker._target !== this ) {
    //   let target = _colorPicker._target;
    //   target._showColorPicker(false);
    // }

    this._showing = show;
    if ( show ) {
      this._initValue = this.value;

      // add event listeners
      _colorPicker.addEventListener('hide', this._hideFn);
      _colorPicker.addEventListener('change', this._changeFn);
      _colorPicker.addEventListener('confirm', this._confirmFn);
      _colorPicker.addEventListener('cancel', this._cancelFn);

      // hit-ghost
      // NOTE: we use transparent hit-ghost because we want artist adjust color in the scene without any mask
      DomUtils.addHitGhost('default', 998, () => {
        _colorPicker.hide(true); // hide & confirm
      });

      // color-picker
      document.body.appendChild( _colorPicker );
      _colorPicker._target = this;
      _colorPicker.style.display = 'block';
      this._updateColorPickerPosition();

      // focus-mgr
      FocusMgr._setFocusElement(_colorPicker);
    } else {
      // remove event listeners
      _colorPicker.removeEventListener('hide', this._hideFn);
      _colorPicker.removeEventListener('change', this._changeFn);
      _colorPicker.removeEventListener('confirm', this._confirmFn);
      _colorPicker.removeEventListener('cancel', this._cancelFn);

      // hit-ghost
      DomUtils.removeHitGhost();

      // color-picker
      _colorPicker._target = null;
      _colorPicker.remove();
      _colorPicker.style.display = 'none';

      // focus-mgr
      FocusMgr._setFocusElement(this);
    }
  }

  _updateColorPickerPosition () {
    window.requestAnimationFrame( () => {
      if ( !this._showing ) {
        return;
      }

      let bodyRect = document.body.getBoundingClientRect();
      let thisRect = this.getBoundingClientRect();
      let colorPickerRect = _colorPicker.getBoundingClientRect();

      let style = _colorPicker.style;
      style.left = (thisRect.right - colorPickerRect.width) + 'px';

      if ( document.body.clientHeight - thisRect.bottom <= colorPickerRect.height + 10 ) {
        style.top = (thisRect.top - bodyRect.top - colorPickerRect.height - 10) + 'px';
      } else {
        style.top = (thisRect.bottom - bodyRect.top + 10) + 'px';
      }

      if ( document.body.clientWidth - thisRect.left <= colorPickerRect.width ) {
        style.left = (thisRect.right - bodyRect.left - colorPickerRect.width) + 'px';
      } else {
        style.left = (thisRect.left - bodyRect.left) + 'px';
      }

      this._updateColorPickerPosition();
    });
  }
}

JS.addon(ColorElement.prototype, Focusable);

ui_color.element = ColorElement;
ui_color.tagName = 'UI-COLOR';
