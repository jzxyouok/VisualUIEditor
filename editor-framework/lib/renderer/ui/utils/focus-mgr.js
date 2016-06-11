'use strict';

let FocusMgr = {};
module.exports = FocusMgr;

// requires
const Electron = require('electron');
const DockPanel = require('../panel/panel.js');
const PanelFrame = require('../panel/frame.js');
const DomUtils = require('./dom-utils.js');

// panel focus
let _focusedPanelFrame = null;
let _lastFocusedPanelFrame = null;

// global focus
let _focusedElement = null;
let _lastFocusedElement = null;

// ==========================
// exports
// ==========================

FocusMgr._isNavigable = function (el) {
  return el.focusable && !el.disabled && !el.unnavigable;
};

FocusMgr._focusPrev = function () {
  let root, el, lastEL;
  if ( _focusedPanelFrame ) {
    root = _focusedPanelFrame.shadowRoot;
    el = _focusedPanelFrame._focusedElement;
    lastEL = _focusedPanelFrame._lastFocusedElement;
  } else {
    root = document.body;
    el = _focusedElement;
    lastEL = _lastFocusedElement;
  }

  //
  if (!el) {
    if ( lastEL ) {
      FocusMgr._setFocusElement(lastEL);
      return true;
    }

    if ( root ) {
      el = FocusMgr._getFirstFocusableFrom(root, true);
      FocusMgr._setFocusElement(el);
    }

    return;
  }

  //
  let prev, cur = el;

  // if the first-focusable-element of prev-focusable-element is current element, skip it.
  while (1) {
    prev = FocusMgr._getPrevFocusable(cur);

    if ( !prev ) {
      break;
    }

    if ( prev._getFirstFocusableElement() !== cur ) {
      break;
    }

    cur = prev;
  }

  if ( !prev ) {
    return false;
  }

  FocusMgr._setFocusElement(prev);
  return true;
};

FocusMgr._focusNext = function () {
  let root, el, lastEL;
  if ( _focusedPanelFrame ) {
    root = _focusedPanelFrame.shadowRoot;
    el = _focusedPanelFrame._focusedElement;
    lastEL = _focusedPanelFrame._lastFocusedElement;
  } else {
    root = document.body;
    el = _focusedElement;
    lastEL = _lastFocusedElement;
  }

  //
  if ( !el ) {
    if ( lastEL ) {
      FocusMgr._setFocusElement(lastEL);
      return true;
    }

    if ( root ) {
      el = FocusMgr._getFirstFocusableFrom(root, true);
      FocusMgr._setFocusElement(el);
    }

    return;
  }

  let next = FocusMgr._getNextFocusable(el);
  if ( !next ) {
    return false;
  }

  FocusMgr._setFocusElement(next);
  return true;
};

FocusMgr._focusParent = function ( el ) {
  let parent = FocusMgr._getFocusableParent(el);
  if ( parent ) {
    if ( parent instanceof DockPanel ) {
      FocusMgr._setFocusElement(null);
      parent.activeTab.frameEL.focus();
    } else {
      FocusMgr._setFocusElement(parent);
    }
  }
};

FocusMgr._setFocusPanelFrame = function ( panelFrame ) {
  let blurPanel, focusPanel;

  // process panel
  if ( _focusedPanelFrame ) {
    blurPanel = _focusedPanelFrame.parentElement;
  }

  if ( panelFrame ) {
    focusPanel = panelFrame.parentElement;
  }

  if ( blurPanel !== focusPanel ) {
    if ( blurPanel ) {
      blurPanel._setFocused(false);
    }

    if ( focusPanel ) {
      focusPanel._setFocused(true);
    }
  }

  // process panel frame
  if ( _focusedPanelFrame !== panelFrame ) {
    if ( _focusedPanelFrame ) {
      _focusedPanelFrame.blur();

      // blur element
      if ( _focusedPanelFrame._focusedElement ) {
        _focusedPanelFrame._focusedElement._setFocused(false);
      }
    }

    _lastFocusedPanelFrame = _focusedPanelFrame;
    _focusedPanelFrame = panelFrame;

    if ( panelFrame ) {
      panelFrame.focus();

      // focus element
      if ( panelFrame._focusedElement ) {
        panelFrame._focusedElement._setFocused(true);
      }
    }
  }
};

FocusMgr._restoreFocusPanel = function () {
  if ( _focusedPanelFrame ) {
    let panel = _focusedPanelFrame.parentElement;
    panel._setFocused(true);

    // NOTE: if we have focused element, skip focus panel frame
    if ( _focusedPanelFrame._focusedElement ) {
      _focusedPanelFrame._focusedElement._setFocused(true);
      return;
    }

    _focusedPanelFrame.focus();
  }
};

FocusMgr._setFocusElement = function ( el ) {
  // NOTE: disabled object can be focused, it just can not be navigate.
  //       (for example, disabled prop can be fold/foldup by left/right key)
  // if ( el && el.disabled ) {
  //   el = null;
  // }

  // process focus element in focused panel frame
  if ( _focusedPanelFrame ) {
    let focusedElement = _focusedPanelFrame._focusedElement;
    if ( focusedElement !== el ) {
      if ( focusedElement ) {
        focusedElement._setFocused(false);
      }

      _focusedPanelFrame._lastFocusedElement = focusedElement;
      _focusedPanelFrame._focusedElement = el;

      _lastFocusedElement = _focusedElement;
      _focusedElement = el;

      if ( el ) {
        el._setFocused(true);
      } else {
        _focusedPanelFrame.focus();
      }
    }

    return;
  }

  // otherwise process focus element as if it is standalone
  if ( _focusedElement !== el ) {
    if ( _focusedElement ) {
      _focusedElement._setFocused(false);
    }

    _lastFocusedElement = _focusedElement;
    _focusedElement = el;

    if ( el ) {
      el._setFocused(true);
    }
  }
};

// NOTE: it does not consider shadowRoot and host
//       it does not consider visibility in hierarchy
FocusMgr._getFirstFocusableFrom = function ( el, excludeSelf ) {
  if ( !excludeSelf ) {
    if ( !DomUtils.isVisible(el) ) {
      return null;
    }

    if ( FocusMgr._isNavigable(el) ) {
      return el;
    }
  }

  let parentEL = el, curEL = el;
  if ( !curEL.children.length ) {
    return null;
  }

  curEL = curEL.children[0];
  while (1) {
    if ( !curEL ) {
      curEL = parentEL;
      if ( curEL === el ) {
        return null;
      }

      parentEL = parentEL.parentElement;
      curEL = curEL.nextElementSibling;
    }

    if ( curEL ) {
      // skip check children if current element is invisible
      if ( !DomUtils.isVisible(curEL) ) {
        curEL = curEL.nextElementSibling;
      } else {
        if ( FocusMgr._isNavigable(curEL) ) {
          return curEL;
        }

        if ( curEL.children.length ) {
          parentEL = curEL;
          curEL = curEL.children[0];
        } else {
          curEL = curEL.nextElementSibling;
        }
      }
    }
  }
};

// NOTE: it does not consider shadowRoot and host
//       it does not consider visibility in hierarchy
FocusMgr._getLastFocusableFrom = function ( el, excludeSelf ) {
  let lastFocusable = null;

  if ( !excludeSelf ) {
    if ( !DomUtils.isVisible(el) ) {
      return null;
    }

    if ( FocusMgr._isNavigable(el) ) {
      lastFocusable = el;
    }
  }

  let parentEL = el, curEL = el;
  if ( !curEL.children.length ) {
    return lastFocusable;
  }

  curEL = curEL.children[0];
  while (1) {
    if ( !curEL ) {
      curEL = parentEL;
      if ( curEL === el ) {
        return lastFocusable;
      }

      parentEL = parentEL.parentElement;
      curEL = curEL.nextElementSibling;
    }

    if ( curEL ) {
      // skip check children if current element is invisible
      if ( !DomUtils.isVisible(curEL) ) {
        curEL = curEL.nextElementSibling;
      } else {
        if ( FocusMgr._isNavigable(curEL) ) {
          lastFocusable = curEL;
        }

        if ( curEL.children.length ) {
          parentEL = curEL;
          curEL = curEL.children[0];
        } else {
          curEL = curEL.nextElementSibling;
        }
      }
    }
  }
};

FocusMgr._getFocusableParent = function ( el ) {
  let parent = el.parentNode;
  // shadow root
  if ( parent.host ) {
    parent = parent.host;
  }

  while ( parent ) {
    if ( parent.focusable && !parent.disabled ) {
      return parent;
    }

    parent = parent.parentNode;
    // shadow root
    if ( parent && parent.host ) {
      parent = parent.host;
    }
  }

  return null;
};

FocusMgr._getNextFocusable = function ( el ) {
  let nextEL = FocusMgr._getFirstFocusableFrom(el, true);
  if ( nextEL ) {
    return nextEL;
  }

  let parentEL = el.parentElement, curEL = el.nextElementSibling;
  while (1) {
    if ( !curEL ) {
      curEL = parentEL;
      if ( curEL === null ) {
        return null;
      }

      parentEL = parentEL.parentElement;
      curEL = curEL.nextElementSibling;
    }

    if ( curEL ) {
      nextEL = FocusMgr._getFirstFocusableFrom(curEL);
      if ( nextEL ) {
        return nextEL;
      }

      curEL = curEL.nextElementSibling;
    }
  }
};

FocusMgr._getPrevFocusable = function ( el ) {
  let prevEL;
  let parentEL = el.parentElement, curEL = el.previousElementSibling;

  while (1) {
    if ( !curEL ) {
      curEL = parentEL;
      if ( curEL === null ) {
        return null;
      }

      if ( curEL.focusable && !curEL.disabled ) {
        return curEL;
      }

      parentEL = parentEL.parentElement;
      curEL = curEL.previousElementSibling;
    }

    if ( curEL ) {
      prevEL = FocusMgr._getLastFocusableFrom(curEL);
      if ( prevEL ) {
        return prevEL;
      }

      curEL = curEL.previousElementSibling;
    }
  }
};

Object.defineProperty(FocusMgr, 'lastFocusedPanelFrame', {
  enumerable: true,
  get () {
    return _lastFocusedPanelFrame;
  },
});

Object.defineProperty(FocusMgr, 'focusedPanelFrame', {
  enumerable: true,
  get () {
    return _focusedPanelFrame;
  },
});

Object.defineProperty(FocusMgr, 'lastFocusedElement', {
  enumerable: true,
  get () {
    if ( _focusedPanelFrame ) {
      return _focusedPanelFrame._lastFocusedElement;
    } else {
      return _lastFocusedElement;
    }
  },
});

Object.defineProperty(FocusMgr, 'focusedElement', {
  enumerable: true,
  get () {
    if ( _focusedPanelFrame ) {
      return _focusedPanelFrame._focusedElement;
    } else {
      return _focusedElement;
    }
  },
});

// ==========================
// Dom
// ==========================

window.addEventListener('focus', () => {
  if ( _focusedPanelFrame ) {
    let panel = _focusedPanelFrame.parentElement;
    // possible when panel not ready
    if ( panel ) {
      panel._setFocused(true);
    }
  }
});

window.addEventListener('blur', () => {
  if ( _focusedPanelFrame ) {
    let panel = _focusedPanelFrame.parentElement;
    // possible when panel closed
    if ( panel ) {
      panel._setFocused(false);
    }
  }
});

// keydown Tab in capture phase
window.addEventListener('keydown', event => {
  // tab
  if ( event.keyCode === 9 ) {
    if ( event.ctrlKey || event.metaKey ) {
      return;
    }

    // if the focused panel frame is not instance of PanelFrame, skip it
    if ( _focusedPanelFrame && !(_focusedPanelFrame instanceof PanelFrame) ) {
      return;
    }

    DomUtils.acceptEvent(event);
    let r;

    if ( event.shiftKey ) {
      r = FocusMgr._focusPrev();
    } else {
      r = FocusMgr._focusNext();
    }

    if ( FocusMgr.focusedElement ) {
      FocusMgr.focusedElement._navELs[0].focus();
    }

    if (!r) {
      Electron.shell.beep();
    }
  }
}, true);

// keydown up/down arrow in bubble phase
window.addEventListener('keydown', event => {
  // up-arrow
  if (event.keyCode === 38) {
    DomUtils.acceptEvent(event);
    let r = FocusMgr._focusPrev();
    if (!r) {
      Electron.shell.beep();
    }
  }
  // down-arrow
  else if (event.keyCode === 40) {
    DomUtils.acceptEvent(event);
    let r = FocusMgr._focusNext();
    if (!r) {
      Electron.shell.beep();
    }
  }
});
