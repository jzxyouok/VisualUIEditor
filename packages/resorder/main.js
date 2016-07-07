'use strict';

const Electron = require('electron');

module.exports = {
  load () {
    Editor.Menu.register( 'open-file-operate', () => {
      return [
        {
          label: Editor.T('新建'),
          params: [],
          submenu: MenuUtil.createFileMenu(),
        },
        { type: 'separator' },
        {
          label: Editor.T('重命名'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('ui:rename-file-or-folder');
          }
        },
        {
          label: Editor.T('删除'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('ui:delete-file-or-folder');
          }
        },
        {
          label: Editor.T('在资源浏览器中显示'),
          params: [],
          click () {
            Editor.Ipc.sendToAll('ui:show-in-explorer');
          }
        },
      ];
    }, true );
    
  },

  unload () {
    Editor.Menu.unregister( 'open-file-operate' );
  },

  messages: {
    'open' () {
      Editor.Panel.open('resorder');
    },

    'open-log-file': function () {
      Electron.shell.openItem(Editor.logfile);
    },

    'console:clear' () {
      Editor.clearLog();
    },
    'popup-open-file-menu': function (event, x, y) {
      let menuTmpl = Editor.Menu.getMenu('open-file-operate');

      let editorMenu = new Editor.Menu(menuTmpl, event.sender);
      x = Math.floor(x);
      y = Math.floor(y);
      editorMenu.nativeMenu.popup(Electron.BrowserWindow.fromWebContents(event.sender), x, y);
      editorMenu.dispose();
    }
  }
};
