'use strict';

// ==========================
// exports
// ==========================

function ui_num_input (value) {
  let el = document.createElement('ui-num-input');
  if ( !isNaN(value) ) {
    el.value = value;
  }

  return el;
}

module.exports = ui_num_input;

// ==========================
// internal
// ==========================

const JS = require('../../../share/js-utils');
const Utils = require('../../../share/utils');
const DomUtils = require('../utils/dom-utils');
const FocusMgr = require('../utils/focus-mgr');
const Focusable = require('../behaviors/focusable');
const InputState = require('../behaviors/input-state');

class NumInputElement extends window.HTMLElement {
  get value () { return this._value; }
  set value ( val ) {
    if ( this._value !== val ) {
      this._value = parseFloat(val);
      this._input.value = this._formatValue(this.value);
    }
  }

  get precision () { return this._precision; }
  set precision ( val ) {
    if ( this._precision !== val ) {
      this._precision = parseInt(val);
      this._input.value = this._formatValue(this.value);
    }
  }

  get step () { return this._step; }
  set step ( val ) {
    if ( this._step !== val ) {
      this._step = parseFloat(val);
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
      <input></input>
      <div class="spin-wrapper" tabindex="-1">
        <div class="spin up">
          <i class="icon-up-dir"></i>
        </div>
        <div class="spin-div"></div>
        <div class="spin down">
          <i class="icon-down-dir"></i>
        </div>
      </div>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/num-input.css'),
      root.firstChild
    );

    // init _precision
    let precision = this.getAttribute('precision');
    if ( precision !== null ) {
      this._precision = parseInt(precision);
    } else {
      this._precision = 7;
    }

    // init _value
    let value = this.getAttribute('value');
    if ( value !== null ) {
      this._value = parseFloat(value);
    } else {
      this._value = null;
    }

    // init _step
    let step = this.getAttribute('step');
    if ( step !== null ) {
      this._step = parseFloat(step);
    } else {
      this._step = 0.1;
    }

    // get _input
    this._input = root.querySelector('input');
    this._input.value = this._formatValue(this.value);
    this._input.placeholder = '-';
    this._input.readOnly = this.getAttribute('readonly') !== null;

    // get _spinWrapper
    this._spinWrapper = root.querySelector('.spin-wrapper');
    this._spinWrapper.addEventListener('keydown', event => {
      // keydown 'esc'
      if (event.keyCode === 27) {
        if ( this._holdingID ) {
          DomUtils.acceptEvent(event);

          this.cancel();
          this._curSpin.removeAttribute('pressed');
          this._stopHolding();
        }
      }
    });

    // get _spinUp
    this._spinUp = root.querySelector('.spin.up');
    DomUtils.installDownUpEvent(this._spinUp);

    this._spinUp.addEventListener('down', event => {
      DomUtils.acceptEvent(event);

      FocusMgr._setFocusElement(this);
      this._spinWrapper.focus();
      this._spinUp.setAttribute('pressed', '');

      if ( !this.readonly ) {
        this._stepUp();

        // process holding
        this._startHolding(this._spinUp, this._stepUp);
      }
    });
    this._spinUp.addEventListener('up', event => {
      DomUtils.acceptEvent(event);
      this._spinUp.removeAttribute('pressed', '');

      if ( this._holdingID ) {
        this._stopHolding();
        this.confirm();
      }
    });

    // get _spinDown
    this._spinDown = root.querySelector('.spin.down');
    DomUtils.installDownUpEvent(this._spinDown);

    this._spinDown.addEventListener('down', event => {
      DomUtils.acceptEvent(event);

      FocusMgr._setFocusElement(this);
      this._spinWrapper.focus();
      this._spinDown.setAttribute('pressed', '');

      if ( !this.readonly ) {
        this._stepDown();

        // process holding
        this._startHolding(this._spinDown, this._stepDown);
      }
    });
    this._spinDown.addEventListener('up', event => {
      DomUtils.acceptEvent(event);
      this._spinDown.removeAttribute('pressed', '');

      if ( this._holdingID ) {
        this._stopHolding();
        this.confirm();
      }
    });

    //
    this._initFocusable(this, this._input);
    this._initInputState(this._input);

    //
    this._initEvents();
  }

  _initEvents () {
    this.addEventListener('mousedown', this._mouseDownHandler);
    this.addEventListener('keydown', this._keyDownHandler);
    this.addEventListener('focus-changed', this._focusChangedHandler);
  }

  _formatValue (val) {
    if ( val === null || val === '' ) {
      return '';
    }

    if ( this._precision === 0 ) {
      return Utils.toFixed(val, this._precision);
    } else {
      return Utils.toFixed(val, this._precision, this._precision);
    }
  }

  _parseInput () {
    if ( this._input.value === null || this._input.value === '' ) {
      return null;
    }

    let val = parseFloat(this._input.value);
    if ( isNaN(val) ) {
      val = parseFloat(this._input._initValue);
      val = parseFloat(this._formatValue(val));
    } else {
      val = parseFloat(this._formatValue(val));
    }

    // TODO
    // val = MathUtils.clamp( val, this.min, this.max );

    return val;
  }

  _stepUp () {
    let val = this._value + this._step;
    this._input.value = this._formatValue(val);
    this._onInputChange();
  }

  _stepDown () {
    let val = this._value - this._step;
    this._input.value = this._formatValue(val);
    this._onInputChange();
  }

  _startHolding ( spin, fn ) {
    this._curSpin = spin;
    this._holdingID = setTimeout(() => {
      this._stepingID = setInterval(() => {
        fn.apply(this);
      }, 50);
    }, 500);
  }

  _stopHolding () {
    clearInterval(this._holdingID);
    this._holdingID = null;

    clearTimeout(this._stepingID);
    this._stepingID = null;

    this._curSpin = null;
  }

  clear () {
    this._input.value = '';
    this.confirm();
  }

  confirm () {
    this._onInputConfirm(this._input);
  }

  cancel () {
    this._onInputCancel(this._input);
  }

  _onInputConfirm ( inputEL, pressEnter ) {
    if ( !this.readonly ) {
      if ( inputEL._initValue !== inputEL.value ) {
        let value = this._parseInput();
        let valueText = this._formatValue(value);

        inputEL.value = valueText;
        inputEL._initValue = valueText;
        this._value = value;

        DomUtils.fire(this, 'confirm', {
          bubbles: false,
          detail: {
            value: this._value,
            confirmByEnter: pressEnter,
          },
        });
      }
    }

    if ( pressEnter ) {
      // blur inputEL, focus to :host
      this.focus();
    }
  }

  _onInputCancel ( inputEL, pressEsc ) {
    if ( !this.readonly ) {
      if ( inputEL._initValue !== inputEL.value ) {
        // reset to init value
        inputEL.value = inputEL._initValue;
        let value = this._parseInput();
        let valueText = this._formatValue(value);

        inputEL.value = valueText;
        inputEL._initValue = valueText;
        this._value = value;

        DomUtils.fire(this, 'change', {
          bubbles: false,
          detail: {
            value: this._value,
          },
        });
        DomUtils.fire(this, 'cancel', {
          bubbles: false,
          detail: {
            value: this._value,
            cancelByEsc: pressEsc,
          },
        });
      }
    }

    if ( pressEsc ) {
      // blur inputEL, focus to :host
      inputEL.blur();
      this.focus();
    }
  }

  _onInputChange () {
    let value = this._parseInput();

    this._value = value;

    DomUtils.fire(this, 'change', {
      bubbles: false,
      detail: {
        value: this._value,
      },
    });
  }

  _mouseDownHandler (event) {
    event.stopPropagation();
    FocusMgr._setFocusElement(this);
  }

  _keyDownHandler (event) {
    if ( this.disabled ) {
      return;
    }

    // keydown 'enter' or 'space'
    if (event.keyCode === 13 || event.keyCode === 32) {
      DomUtils.acceptEvent(event);
      this._input._initValue = this._input.value;
      this._input.focus();
      this._input.select();
    }

    // DISABLE
    // // keydown 'esc'
    // else if (event.keyCode === 27) {
    //   DomUtils.acceptEvent(event);
    //   // FocusMgr._focusParent(this); // DISABLE
    //   this.focus();
    // }
  }

  _focusChangedHandler () {
    if ( this.focused ) {
      this._input._initValue = this._input.value;
    } else {
      this._unselect(this._input);
    }
  }
}
JS.addon(NumInputElement.prototype, Focusable);
JS.addon(NumInputElement.prototype, InputState);

ui_num_input.element = NumInputElement;
ui_num_input.tagName = 'UI-NUM-INPUT';
