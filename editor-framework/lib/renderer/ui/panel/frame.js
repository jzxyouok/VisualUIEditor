'use strict';

// ==========================
// exports
// ==========================

class PanelFrame extends window.HTMLElement {
  static get tagName () { return 'UI-PANEL-FRAME'; }

  createdCallback () {
    this.createShadowRoot();
    this.classList.add('fit');
    this.tabIndex = -1;

    // for focus-mgr
    this._focusedElement = null;
    this._lastFocusedElement = null;
  }

  queryID ( id ) {
    return this.shadowRoot.getElementById(id);
  }

  query ( selector ) {
    return this.shadowRoot.querySelector(selector);
  }

  queryAll ( selector ) {
    return this.shadowRoot.querySelectorAll(selector);
  }
}

module.exports = PanelFrame;
