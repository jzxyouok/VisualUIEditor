'use strict';

const Electron = require('electron');

module.exports = {
  load () {
    Editor.Menu.register( 'create-node-menu', () => {
      return MenuUtil.createNodeMenu();
    })
    
    Editor.Menu.register( 'operate-node-menu', () => {
      return [
        {
          label: Editor.T('新建'),
          params: [],
          submenu: MenuUtil.createNodeMenu(),
        },
        { type: 'separator' },
        {
          label: Editor.T('拷贝'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('node:copy_item');
          }
        },
        {
          label: Editor.T('粘贴'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('node:paste_item');
          }
        },
        {
          label: Editor.T('复制节点'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('node:copy_paste_item');
          }
        },
        {
          label: Editor.T('删除节点'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('node:delete_item');
          }
        },
      ];
    }, true );
  },

  unload () {
    Editor.Menu.unregister( 'create-node-menu' );
  },

  messages: {
    'open' () {
      Editor.Panel.open('nodeorder');
    },

    'open-log-file': function () {
      Electron.shell.openItem(Editor.logfile);
    },

    'console:clear' () {
      Editor.clearLog();
    },
    'popup-open-node-menu': function (event, x, y) {
      let menuTmpl = Editor.Menu.getMenu('create-node-menu');
      let editorMenu = new Editor.Menu(menuTmpl, event.sender);
      x = Math.floor(x);
      y = Math.floor(y);
      editorMenu.nativeMenu.popup(Electron.BrowserWindow.fromWebContents(event.sender), x, y);
      editorMenu.dispose();
    },

    'popup-operate-node-menu': function (event, x, y) {
      let menuTmpl = Editor.Menu.getMenu('operate-node-menu');
      let editorMenu = new Editor.Menu(menuTmpl, event.sender);
      x = Math.floor(x);
      y = Math.floor(y);
      editorMenu.nativeMenu.popup(Electron.BrowserWindow.fromWebContents(event.sender), x, y);
      editorMenu.dispose();
    },
  }
};
