'use strict';

const Electron = require('electron');
const JS = require('../../../share/js-utils');
const Droppable = require('../behaviors/droppable');

const ipcRenderer = Electron.ipcRenderer;

// ==========================
// exports
// ==========================

class WebView extends window.HTMLElement {
  static get tagName () { return 'EDITOR-WEBVIEW'; }

  get src () {
    return this.getAttribute('src');
  }
  set src (val) {
    this.setAttribute('src', val);
  }

  createdCallback () {
    if ( this.src === null ) {
      this.src = 'editor-framework://static/empty.html';
    }

    let root = this.createShadowRoot();
    root.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          min-width: 100px;
          min-height: 100px;
        }

        .wrapper {
          background: #333;
        }

        .fit {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        [hidden] {
          display: none;
        }

        #loader {
          position: absolute;
          top: 10px;
          left: 10px;
          color: #333;
        }
      </style>
      <webview id="view" src="${this.src}"
        nodeintegration
        disablewebsecurity
        autosize="on"
      ></webview>
      <div id="loader">Loading...</div>
      <div id="dropArea" class="fit" hidden></div>
    `;

    // query element
    this.$ = {
      view: this.shadowRoot.querySelector('#view'),
      loader: this.shadowRoot.querySelector('#loader'),
      dropArea: this.shadowRoot.querySelector('#dropArea'),
    };

    // init events
    this.addEventListener('drop-area-enter', this._onDropAreaEnter.bind(this));
    this.addEventListener('drop-area-leave', this._onDropAreaLeave.bind(this));
    this.addEventListener('drop-area-accept', this._onDropAreaAccept.bind(this));
    this.$.view.addEventListener('console-message', this._onConsoleMessage.bind(this));
    this.$.view.addEventListener('ipc-message', this._onIpcMessage.bind(this));
    this.$.view.addEventListener('did-finish-load', this._onViewDidFinishLoad.bind(this));

    // init behaviors
    this._initDroppable( this.$.dropArea );

    // init ipc
    ipcRenderer.on('editor:dragstart', () => {
      this.$.dropArea.removeAttribute('hidden');
    });

    ipcRenderer.on('editor:dragend', () => {
      this.$.dropArea.setAttribute('hidden', '');
    });
  }

  reload () {
    this.$.loader.removeAttribute('hidden');
    this.$.view.reloadIgnoringCache();
  }

  openDevTools () {
    this.$.view.openDevTools();
  }

  _onConsoleMessage () {
  }

  _onIpcMessage () {
  }

  _onViewDidFinishLoad () {
    this.$.loader.setAttribute('hidden', '');
  }

  _onDropAreaEnter ( event ) {
    event.stopPropagation();
  }

  _onDropAreaLeave ( event ) {
    event.stopPropagation();
  }

  _onDropAreaAccept ( event ) {
    event.stopPropagation();
  }
}

JS.addon(WebView.prototype, Droppable);

module.exports = WebView;
