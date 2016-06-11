'use strict';

// ==========================
// exports
// ==========================

function ui_color_picker (color) {
  let el = document.createElement('ui-color-picker');
  if ( color ) {
    el.value = color;
  }

  return el;
}

module.exports = ui_color_picker;

// ==========================
// internal
// ==========================

const Chroma = require('chroma-js');

const JS = require('../../../share/js-utils');
const MathUtils = require('../../../share/math');
const DomUtils = require('../utils/dom-utils');
const FocusMgr = require('../utils/focus-mgr');
const Focusable = require('../behaviors/focusable');

class ColorPickerElement extends window.HTMLElement {
  get value () { return this._value; }
  set value (val) {
    let rgba = Chroma(val).rgba();
    if ( rgba !== this._value ) {
      this._value = rgba;

      this._updateHue();
      this._updateAlpha();
      this._updateColor();
      this._updateSliders();
      this._updateHexInput();
    }
  }

  createdCallback () {
    let root = this.createShadowRoot();
    root.innerHTML = `
      <div class="hbox">
        <div class="hue ctrl" tabindex="-1">
          <div class="hue-handle">
            <i class="icon-right-dir"></i>
          </div>
        </div>
        <div class="color ctrl" tabindex="-1">
          <div class="color-handle">
            <i class="icon-circle-empty"></i>
          </div>
        </div>
        <div class="alpha ctrl" tabindex="-1">
          <div class="alpha-handle">
            <i class="icon-left-dir"></i>
          </div>
        </div>
      </div>

      <div class="vbox">
        <div class="prop">
          <span class="red tag">R</span>
          <ui-slider id="r-slider"></ui-slider>
        </div>
        <div class="prop">
          <span class="green">G</span>
          <ui-slider id="g-slider"></ui-slider>
        </div>
        <div class="prop">
          <span class="blue">B</span>
          <ui-slider id="b-slider"></ui-slider>
        </div>
        <div class="prop">
          <span class="gray">A</span>
          <ui-slider id="a-slider"></ui-slider>
        </div>
        <div class="hex-field">
          <span>Hex Color</span>
          <ui-input id="hex-input"></ui-input>
        </div>
      </div>

      <div class="title">Presets</div>
      <div class="hbox presets">
        <div class="color-box" data-index="0"></div>
        <div class="color-box" data-index="1"></div>
        <div class="color-box" data-index="2"></div>
        <div class="color-box" data-index="3"></div>
        <div class="color-box" data-index="4"></div>
        <div class="color-box" data-index="5"></div>
        <div class="color-box" data-index="6"></div>
        <div class="color-box" data-index="7"></div>
        <div class="color-box" data-index="8"></div>
        <div class="color-box" data-index="9"></div>
        <div class="color-box" data-index="10"></div>
        <div class="color-box" data-index="11"></div>
        <div class="color-box" data-index="12"></div>
        <div class="color-box" data-index="13"></div>
      </div>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/color-picker.css'),
      root.firstChild
    );

    //
    this._hueHandle = root.querySelector('.hue-handle');
    this._colorHandle = root.querySelector('.color-handle');
    this._alphaHandle = root.querySelector('.alpha-handle');

    this._hueCtrl = root.querySelector('.hue.ctrl');
    this._colorCtrl = root.querySelector('.color.ctrl');
    this._alphaCtrl = root.querySelector('.alpha.ctrl');

    this._sliderR = root.querySelector('#r-slider');
    this._sliderG = root.querySelector('#g-slider');
    this._sliderB = root.querySelector('#b-slider');
    this._sliderA = root.querySelector('#a-slider');

    this._hexInput = root.querySelector('#hex-input');
    this._colorPresets = root.querySelectorAll('.color-box');

    // TODO: load _colorPresets from window.localStorage

    // init _value
    let value = this.getAttribute('value');
    if ( value !== null ) {
      this._value = Chroma(value).rgba();
    } else {
      this._value = [255,255,255,1];
    }

    // update control
    this._updateHue();
    this._updateColor();
    this._updateAlpha();
    this._updateSliders();
    this._updateHexInput();

    //
    this._initFocusable(this);

    //
    this._initEvents();
  }

  hide ( confirm ) {
    DomUtils.fire(this, 'hide', {
      bubbles: false,
      detail: {
        confirm: confirm,
      }
    });
  }

  _initEvents () {
    this.addEventListener('keydown', event => {
      // if space or enter, hide for confirm
      if (
        event.keyCode === 13 ||
        event.keyCode === 32
      ) {
        DomUtils.acceptEvent(event);
        this.hide(true);
      }
      // if esc, hide for cancel
      else if ( event.keyCode === 27 ) {
        DomUtils.acceptEvent(event);
        this.hide(false);
      }
    });

    // hue-ctrl

    this._hueCtrl.addEventListener('mousedown', event => {
      DomUtils.acceptEvent(event);
      FocusMgr._setFocusElement(this);
      this._hueCtrl.focus();

      let alpha = this._value[3];

      this._initValue = this._value;
      this._dragging = true;

      let rect = this._hueCtrl.getBoundingClientRect();
      let ratio = (event.clientY - rect.top)/this._hueCtrl.clientHeight;

      this._hueHandle.style.top = `${ratio*100}%`;
      let h = (1-ratio) * 360;
      let hsv = Chroma(this._value).hsv();

      this._value = Chroma(h,hsv[1],hsv[2],'hsv').rgba();
      this._value[3] = alpha;

      this._updateColor();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();

      this._emitChange();

      DomUtils.startDrag('ns-resize', event, event => {
        let ratio = (event.clientY - rect.top)/this._hueCtrl.clientHeight;
        ratio = MathUtils.clamp( ratio, 0, 1 );

        this._hueHandle.style.top = `${ratio*100}%`;
        let h = (1-ratio) * 360;
        let hsv = Chroma(this._value).hsv();

        this._value = Chroma(h,hsv[1],hsv[2],'hsv').rgba();
        this._value[3] = alpha;

        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();

        this._emitChange();
      }, () => {
        this._dragging = false;

        this._updateColor();
        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();

        this._emitConfirm();
      });
    });
    this._hueCtrl.addEventListener('keydown', event => {
      // keydown 'esc'
      if (event.keyCode === 27) {
        if ( this._dragging ) {
          DomUtils.acceptEvent(event);

          this._dragging = false;
          DomUtils.cancelDrag();

          this._value = this._initValue;

          this._updateHue();
          this._updateColor();
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();

          this._emitChange();
          this._emitCancel();
        }
      }
    });

    // alpha-ctrl

    this._alphaCtrl.addEventListener('mousedown', event => {
      DomUtils.acceptEvent(event);
      FocusMgr._setFocusElement(this);
      this._alphaCtrl.focus();

      this._initValue = this._value.slice();
      this._dragging = true;

      let rect = this._alphaCtrl.getBoundingClientRect();
      let ratio = (event.clientY - rect.top)/this._alphaCtrl.clientHeight;

      this._alphaHandle.style.top = `${ratio*100}%`;
      this._value[3] = 1-ratio;

      this._updateSliders();
      this._emitChange();

      DomUtils.startDrag('ns-resize', event, event => {
        let ratio = (event.clientY - rect.top)/this._hueCtrl.clientHeight;
        ratio = MathUtils.clamp( ratio, 0, 1 );

        this._alphaHandle.style.top = `${ratio*100}%`;
        this._value[3] = 1-ratio;

        this._updateSliders();
        this._emitChange();
      }, () => {
        this._dragging = false;

        this._updateSliders();
        this._emitConfirm();
      });
    });
    this._alphaCtrl.addEventListener('keydown', event => {
      // keydown 'esc'
      if (event.keyCode === 27) {
        if ( this._dragging ) {
          DomUtils.acceptEvent(event);

          this._dragging = false;
          DomUtils.cancelDrag();

          this._value = this._initValue;

          this._updateAlpha();
          this._updateSliders();

          this._emitChange();
          this._emitCancel();
        }
      }
    });

    // color-ctrl

    this._colorCtrl.addEventListener('mousedown', event => {
      DomUtils.acceptEvent(event);
      FocusMgr._setFocusElement(this);
      this._colorCtrl.focus();

      let hsv_h = (1-parseFloat(this._hueHandle.style.top)/100) * 360;
      let alpha = this._value[3];
      this._initValue = this._value.slice();
      this._dragging = true;

      let rect = this._colorCtrl.getBoundingClientRect();
      let x = (event.clientX - rect.left)/this._colorCtrl.clientWidth;
      let y = (event.clientY - rect.top)/this._colorCtrl.clientHeight;
      let c = y * y * ( 3 - 2 * y);
      c = c * 255;

      this._colorHandle.style.left = `${x*100}%`;
      this._colorHandle.style.top = `${y*100}%`;
      this._colorHandle.style.color = Chroma(c, c, c).hex();

      this._value = Chroma(hsv_h,x,1-y,'hsv').rgba();
      this._value[3] = alpha;

      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();
      this._emitChange();

      DomUtils.startDrag('default', event, event => {
        let x = (event.clientX - rect.left)/this._colorCtrl.clientWidth;
        let y = (event.clientY - rect.top)/this._colorCtrl.clientHeight;

        x = MathUtils.clamp( x, 0, 1 );
        y = MathUtils.clamp( y, 0, 1 );
        let c = y * y * ( 3 - 2 * y);
        c = c * 255;

        this._colorHandle.style.left = `${x*100}%`;
        this._colorHandle.style.top = `${y*100}%`;
        this._colorHandle.style.color = Chroma(c, c, c).hex();

        this._value = Chroma(hsv_h,x,1-y,'hsv').rgba();
        this._value[3] = alpha;

        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitChange();
      }, () => {
        this._dragging = false;

        this._updateAlpha();
        this._updateSliders();
        this._updateHexInput();
        this._emitConfirm();
      });
    });
    this._colorCtrl.addEventListener('keydown', event => {
      // keydown 'esc'
      if (event.keyCode === 27) {
        if ( this._dragging ) {
          DomUtils.acceptEvent(event);

          this._dragging = false;
          DomUtils.cancelDrag();

          this._value = this._initValue;

          this._updateColor();
          this._updateAlpha();
          this._updateSliders();
          this._updateHexInput();

          this._emitChange();
          this._emitCancel();
        }
      }
    });

    // slider-r
    this._sliderR.addEventListener('change', event => {
      event.stopPropagation();

      this._value[0] = parseInt(event.detail.value * 255);
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });
    this._sliderR.addEventListener('confirm', event => {
      event.stopPropagation();
      this._emitConfirm();
    });
    this._sliderR.addEventListener('cancel', event => {
      event.stopPropagation();

      this._emitChange();
      this._emitCancel();
    });

    // slider-g
    this._sliderG.addEventListener('change', event => {
      event.stopPropagation();

      this._value[1] = parseInt(event.detail.value * 255);
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });
    this._sliderG.addEventListener('confirm', event => {
      event.stopPropagation();
      this._emitConfirm();
    });
    this._sliderG.addEventListener('cancel', event => {
      event.stopPropagation();

      this._emitChange();
      this._emitCancel();
    });

    // slider-b
    this._sliderB.addEventListener('change', event => {
      event.stopPropagation();

      this._value[2] = parseInt(event.detail.value * 255);
      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateHexInput();
      this._emitChange();
    });
    this._sliderB.addEventListener('confirm', event => {
      event.stopPropagation();
      this._emitConfirm();
    });
    this._sliderB.addEventListener('cancel', event => {
      event.stopPropagation();

      this._emitChange();
      this._emitCancel();
    });

    // slider-a
    this._sliderA.addEventListener('change', event => {
      event.stopPropagation();

      this._value[3] = event.detail.value;
      this._updateAlpha();
      this._emitChange();
    });
    this._sliderA.addEventListener('confirm', event => {
      event.stopPropagation();
      this._emitConfirm();
    });
    this._sliderA.addEventListener('cancel', event => {
      event.stopPropagation();

      this._emitChange();
      this._emitCancel();
    });

    // hex-input
    this._hexInput.addEventListener('change', event => {
      event.stopPropagation();
    });
    this._hexInput.addEventListener('cancel', event => {
      event.stopPropagation();
    });
    this._hexInput.addEventListener('confirm', event => {
      event.stopPropagation();

      let alpha = this._value[3];
      this._value = Chroma(event.detail.value).rgba();
      this._value[3] = alpha;

      this._updateHue();
      this._updateColor();
      this._updateAlpha();
      this._updateSliders();
      this._updateHexInput();

      this._emitChange();
      this._emitConfirm();
    });
  }

  _updateHue () {
    let hsv = Chroma(this._value).hsv();
    if ( isNaN(hsv[0]) ) {
      hsv[0] = 360;
    }

    this._hueHandle.style.top = `${(1-hsv[0]/360)*100}%`;
  }

  _updateColor () {
    let cval = Chroma(this._value);
    let hsv = cval.hsv();
    if ( isNaN(hsv[0]) ) {
      hsv[0] = 360;
    }
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];
    let c = 1-v;
    c = c * c * ( 3 - 2 * c);
    c = c * 255;

    this._colorCtrl.style.backgroundColor = Chroma(h,1,1,'hsv').hex();
    this._colorHandle.style.left = `${s*100}%`;
    this._colorHandle.style.top = `${(1-v)*100}%`;
    this._colorHandle.style.color = Chroma(c, c, c).hex();
  }

  _updateAlpha () {
    this._alphaCtrl.style.backgroundColor = Chroma(this._value).hex();
    this._alphaHandle.style.top = `${(1-this._value[3])*100}%`;
  }

  _updateSliders () {
    this._sliderR.value = this._value[0]/255;
    this._sliderG.value = this._value[1]/255;
    this._sliderB.value = this._value[2]/255;
    this._sliderA.value = this._value[3];
  }

  _updateHexInput () {
    this._hexInput.value = Chroma(this._value).hex().toUpperCase();
  }

  _emitConfirm () {
    DomUtils.fire(this, 'confirm', {
      bubbles: false,
      detail: {
        value: this._value,
      },
    });
  }

  _emitCancel () {
    DomUtils.fire(this, 'cancel', {
      bubbles: false,
      detail: {
        value: this._value,
      },
    });
  }

  _emitChange () {
    DomUtils.fire(this, 'change', {
      bubbles: false,
      detail: {
        value: this._value,
      },
    });
  }
}

JS.addon(ColorPickerElement.prototype, Focusable);

ui_color_picker.element = ColorPickerElement;
ui_color_picker.tagName = 'UI-COLOR-PICKER';
