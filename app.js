'use strict';

// const Editor = require('editor-framework');
const Editor = require('./editor-framework/index');
const Path = require('fire-path');


const {Menu, MenuItem} = require('electron');

function InitUIEditorMenu() {
    const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        role: 'togglefullscreen'
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      },
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('http://electron.atom.io'); }
      },
    ]
  },
];

if (process.platform === 'darwin') {
  const name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      },
    ]
  });
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ];
}

// Editor.MainMenu.clear();
      // let menuTmpl = Editor.Menu.getMenu('main-menu');
      // menuTmpl.clear();
// const menu = Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);
}

    // Editor.Menu.register( 'main-menu', () => {
    //   return [
    //     {
    //       label: Editor.T('CONSOLE.editor_log'),
    //       params: [],
    //       click () {
    //         console.info("xxxxxxxxxxxxxxxxxxxx");
    //         Editor.Ipc.sendToMain('console:open-log-file');
    //       }
    //     },
    //     {
    //       label: Editor.T('CONSOLE.cocos_console_log'),
    //       params: [],
    //       click () {
    //         Editor.Ipc.sendToMain('app:open-cocos-console-log');
    //       }
    //     },
    //   ];
    // }, true );

Editor.App.extend({
  init ( opts, cb ) {
    let settingsPath = Path.join(Editor.App.path, '.settings');
    

    // Electron.app.on('activate', () => {
    //   if(window.localStorage["projectFolder"]) {
    //     let path = window.localStorage["projectFolder"];
    //     window["projectFolder"] = path;
    //     Editor.Ipc.sendToAll("ui:project_floder_change", {folder: path});
    //   }
    // });

    Editor.init({
      'package-search-path': [
        Editor.url('app://packages/'),
        Editor.url('app://third/packages/'),
      ],
      'panel-window': 'app://window.html',
      'layout': Editor.url('app://layout.json'),
      'main-menu': () => {
        return [
          {
            label: Editor.T('VisualUIEditor'),
            role: 'about',
            id: 'about',
            params: [],
            submenu: [
              {
                label: Editor.T('关于'),
                click () {
                  Editor.log("about!!!!!!!!!!!!!");
                }
              },
              { type: 'separator' },
              {
                label: Editor.T('Quit'),
                accelerator: 'CmdOrCtrl+Q',
                click () {
                  Window.main.close();
                }
              },
            ]
          },
          // Developer
          {
            label: Editor.T('MAIN_MENU.developer.title'),
            id: 'developer',
            submenu: [
              {
                label: Editor.T('MAIN_MENU.developer.reload'),
                accelerator: 'CmdOrCtrl+R',
                click ( item, focusedWindow ) {
                  // DISABLE: Console.clearLog();
                  focusedWindow.webContents.reload();
                }
              },
              {
                label: Editor.T('MAIN_MENU.developer.reload_no_cache'),
                accelerator: 'CmdOrCtrl+Shift+R',
                click ( item, focusedWindow ) {
                  // DISABLE: Console.clearLog();
                  focusedWindow.webContents.reloadIgnoringCache();
                }
              },
              { type: 'separator' },
              {
                label: Editor.T('MAIN_MENU.developer.inspect'),
                accelerator: 'CmdOrCtrl+Shift+C',
                click () {
                  let nativeWin = Electron.BrowserWindow.getFocusedWindow();
                  let editorWin = Window.find(nativeWin);
                  if ( editorWin ) {
                    editorWin.send( 'editor:window-inspect' );
                  }
                }
              },
              {
                label: Editor.T('MAIN_MENU.developer.devtools'),
                accelerator: (() => {
                  if (process.platform === 'darwin') {
                    return 'Alt+Command+I';
                  } else {
                    return 'Ctrl+Shift+I';
                  }
                })(),
                click ( item, focusedWindow ) {
                  if ( focusedWindow ) {
                    focusedWindow.openDevTools();
                    if ( focusedWindow.devToolsWebContents ) {
                      focusedWindow.devToolsWebContents.focus();
                    }
                  }
                }
              },
              { type: 'separator' },
            ]
          },
        ];
      },
    });

    if ( cb ) {
      cb ();
    }
  },

  run () {



    // create main window
    let mainWin = new Editor.Window('main', {
      title: 'VisualUIEditor',
      width: 900,
      height: 700,
      minWidth: 900,
      minHeight: 700,
      show: false,
      resizable: true,
    });
    Editor.Window.main = mainWin;

    // restore window size and position
    mainWin.restorePositionAndSize();

    // load and show main window
    mainWin.show();

    // page-level test case
    mainWin.load( 'app://index.html' );

    // open dev tools if needed
    if ( Editor.argv.showDevtools ) {
      // NOTE: open dev-tools before did-finish-load will make it insert an unused <style> in page-level
      mainWin.nativeWin.webContents.once('did-finish-load', function () {
        // mainWin.openDevTools();
      });
    }
    mainWin.focus();

InitUIEditorMenu();
  },
});
