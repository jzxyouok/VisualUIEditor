'use strict';

// ==========================
// exports
// ==========================

function ui_prop ( name ) {
  let el = document.createElement('ui-prop');
  el.name = name;

  return el;
}

module.exports = ui_prop;

// ==========================
// internal
// ==========================

const JS = require('../../../share/js-utils');
const DomUtils = require('../utils/dom-utils');
const FocusMgr = require('../utils/focus-mgr');
const Focusable = require('../behaviors/focusable');

class PropElement extends window.HTMLElement {
  /**
   * @property name
   */
  get name () {
    return this._name;
  }
  set name (val) {
    if (this._name !== val) {
      this._name = val;
      this._text.innerText = val;
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
    } else {
      this.removeAttribute('readonly');
    }
  }

  /**
   * @property slidable
   */
  get slidable () {
    return this.getAttribute('slidable') !== null;
  }
  set slidable (val) {
    if (val) {
      this.setAttribute('slidable', '');
    } else {
      this.removeAttribute('slidable');
    }
  }

  /**
   * @property movable
   */
  get movable () {
    return this.getAttribute('movable') !== null;
  }
  set movable (val) {
    if (val) {
      this.setAttribute('movable', '');
    } else {
      this.removeAttribute('movable');
    }
  }

  /**
   * @property removable
   */
  get removable () {
    return this.getAttribute('removable') !== null;
  }
  set removable (val) {
    if (val) {
      this.setAttribute('removable', '');
    } else {
      this.removeAttribute('removable');
    }
  }

  /**
   * @property foldable
   */
  get foldable () {
    return this.getAttribute('foldable') !== null;
  }
  set foldable (val) {
    if (val) {
      this.setAttribute('foldable', '');
    } else {
      this.removeAttribute('foldable');
    }
  }

  /**
   * @property autoHeight
   */
  get autoHeight () {
    return this.getAttribute('auto-height') !== null;
  }
  set autoHeight (val) {
    if (val) {
      this.setAttribute('auto-height', '');
    } else {
      this.removeAttribute('auto-height');
    }
  }

  /**
   * @property selected
   */
  get selected () {
    return this.getAttribute('selected') !== null;
  }
  set selected (val) {
    if (val) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
  }

  /**
   * @property hovering
   */
  get hovering () {
    return this.getAttribute('hovering') !== null;
  }
  set hovering (val) {
    if (val) {
      this.setAttribute('hovering', '');
    } else {
      this.removeAttribute('hovering');
    }
  }

  /**
   * @property indent
   */
  get indent () {
    return this._indent;
  }
  set indent (val) {
    if (this._indent !== val) {
      let indent = parseInt(val);
      this.setAttribute('indent', indent);
      this._label.style.paddingLeft = indent * 13 + 'px';
      this._indent = indent;
    }
  }

  /**
   * @property value
   */
  get value () {
    return this._value;
  }
  set value (val) {
    if (this._value !== val) {
      let old = this._value;
      this._value = val;

      if ( this.valueChanged ) {
        this.valueChanged(val,old);
      }
    }
  }

  /**
   * @property attrs
   */
  get attrs () {
    return this._attrs;
  }
  set attrs (val) {
    if (this._attrs !== val) {
      let old = this._attrs;
      this._attrs = val;

      if ( this.attrsChanged ) {
        this.attrsChanged(val,old);
      }
    }
  }

  /**
   * @property type
   */
  get type () {
    return this._type;
  }

  createdCallback () {
    let root = this.createShadowRoot();
    root.innerHTML = `
      <div class="wrapper">
        <div class="label">
          <i class="move icon-braille"></i>
          <i class="fold icon-fold-up"></i>
          <span class="text"></span>
          <div class="lock">
            <i class="icon-lock"></i>
          </div>
        </div>
        <div class="wrapper-content">
          <content select=":not(.child)"></content>
        </div>
        <div class="remove">
          <i class="icon-trash-empty"></i>
        </div>
      </div>
      <content select=".child"></content>
    `;
    root.insertBefore(
      DomUtils.createStyleElement('editor-framework://dist/css/elements/prop.css'),
      root.firstChild
    );

    this._label = root.querySelector('.label');
    this._moveIcon = root.querySelector('.move');
    this._removeIcon = root.querySelector('.remove');
    this._foldIcon = root.querySelector('.fold');
    this._text = root.querySelector('.text');

    // init _name
    let name = this.getAttribute('name');
    if ( name !== null ) {
      this._name = name;
    } else {
      this._name = '-';
    }

    // init _indent
    let indent = this.getAttribute('indent');
    if ( indent !== null ) {
      indent = parseInt(indent);
      this._label.style.paddingLeft = indent * 13 + 'px';
    } else {
      indent = 0;
    }
    this._indent = indent;

    // init _folded
    this._folded = this.getAttribute('folded') !== null;

    // init movable
    if ( indent >= 1 && this.movable ) {
      this._moveIcon.style.left = (indent-1) * 13 + 'px';
    }

    // update label
    this._text.innerText = this._name;

    this._initFocusable(this);
    this._initEvents();

    // parse type
    this._type = this.getAttribute('type');
    if ( this._type !== null ) {
      // TODO
    }

    // update disabled
    if ( this._disabled ) {
      DomUtils.walk(this, { excludeSelf: true }, el => {
        // TODO HACK: should allow user custom disable setup
        if ( el.tagName.indexOf('UI-') === 0 ) {
          el.setAttribute('disabled', '');
        }

        return false;
      });
    }
  }

  fold () {
    if ( this._folded ) {
      return;
    }

    this._folded = true;
    this._foldIcon.classList.remove('icon-fold-up');
    this._foldIcon.classList.add('icon-fold');
    this.setAttribute('folded', '');
  }

  foldup () {
    if ( !this._folded ) {
      return;
    }

    this._folded = false;
    this._foldIcon.classList.remove('icon-fold');
    this._foldIcon.classList.add('icon-fold-up');
    this.removeAttribute('folded');
  }

  // NOTE: override the focusable._getFirstFocusableElement
  _getFirstFocusableElement () {
    let el = FocusMgr._getFirstFocusableFrom(this,true);

    // do not focus on '.child'
    if ( el && el.parentElement && el.parentElement.classList.contains('child') ) {
      return null;
    }

    return el;
  }

  _initEvents () {
    this.addEventListener('focus-changed', event => {
      /**
       * NOTE:
       * A parent ui-prop must be selected if its structure is like this:
       * <ui-prop> # parent will recieve focus-changed event
       *   <ui-prop>A</ui-prop> # <== when we click on it
       *   <ui-prop>B</ui-prop>
       * </ui-prop>
       *
       * A parent ui-prop will not selected if children is in .child block
       * <ui-prop> # parent will *NOT* recieve focus-changed event
       *   <div class="child">
       *     <ui-prop>A</ui-prop> # <== when we click on it
       *     <ui-prop>B</ui-prop>
       *   </div>
       * </ui-prop>
       */
      if ( !(this.parentElement instanceof PropElement) ) {
        event.stopPropagation();
      }

      this.selected = event.detail.focused;

      // focus on first focusable child element if we focus on this and it is not disabled
      if ( !this.disabled && event.detail.focused && event.target === this ) {
        let focusableEL = this._getFirstFocusableElement();
        if ( focusableEL ) {
          FocusMgr._setFocusElement(focusableEL);
        }
      }
    });

    this.addEventListener('mouseover', event => {
      event.stopImmediatePropagation();
      this.hovering = true;
    });

    this.addEventListener('mouseout', event => {
      event.stopImmediatePropagation();
      this.hovering = false;
    });

    this._moveIcon.addEventListener('mouseenter', () => {
      this.style.backgroundColor = 'rgba(0,0,0,0.1)';
    });

    this._moveIcon.addEventListener('mouseleave', () => {
      this.style.backgroundColor = '';
    });

    this._removeIcon.addEventListener('mouseenter', () => {
      this.style.backgroundColor = 'rgba(255,0,0,0.3)';
      this.style.outline = '1px solid rgba(255,0,0,1)';
    });

    this._removeIcon.addEventListener('mouseleave', () => {
      this.style.backgroundColor = '';
      this.style.outline = '';
    });

    this.addEventListener('mousedown', event => {
      DomUtils.acceptEvent(event);

      // NOTE: we can not use 'point-event: none' in css, since _folded needs mousedown event
      if ( this.disabled ) {
        FocusMgr._setFocusElement(this);
        return;
      }

      if ( this.slidable ) {
        // start drag
        DomUtils.startDrag('ew-resize', event, event => {
          DomUtils.fire(this, 'slide', {
            bubbles: false,
            detail: {
              dx: event.movementX,
              dy: event.movementY,
            }
          });
        }, () => {
          // TODO
          // confirm
        });
      }

      // NOTE: this will make sure we can re-enter focus when click on label
      FocusMgr._setFocusElement(null);

      let focusableEL = this._getFirstFocusableElement();
      if ( focusableEL ) {
        FocusMgr._setFocusElement(focusableEL);
      } else {
        FocusMgr._setFocusElement(this);
      }
    });

    this.addEventListener('keydown', event => {
      // keydown 'enter'
      if (event.keyCode === 13) {
      }
      // keydown 'left'
      else if (event.keyCode === 37) {
        DomUtils.acceptEvent(event);
        this.fold();
      }
      // keydown 'right'
      else if (event.keyCode === 39) {
        DomUtils.acceptEvent(event);
        this.foldup();
      }
    });

    this._foldIcon.addEventListener('mousedown', () => {
      // NOTE: do not stopPropagation
      if ( this._folded ) {
        this.foldup();
      } else {
        this.fold();
      }
    });
  }
}

JS.addon(PropElement.prototype, Focusable);

ui_prop.element = PropElement;
ui_prop.tagName = 'UI-PROP';
