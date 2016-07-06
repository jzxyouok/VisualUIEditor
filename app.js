'use strict';

// const Editor = require('editor-framework');
const Editor = require('./editor-framework/index');
const Path = require('fire-path');

const MenuUtil = require('./js/MenuUtil.js');

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
        let fileSubMenu = [
          {
            label: Editor.T('打开项目'),
            click () {
              Editor.log("about!!!!!!!!!!!!!");
            }
          },
        ];

        let otherFileMenu = MenuUtil.createFileMenu();
        otherFileMenu.forEach(function(v) {
          fileSubMenu.push(v)
        });   

        // createFileMenu
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
          //File
          {
            label: Editor.T('文件'),
            role: 'file',
            id: 'file',
            params: [],
            submenu: fileSubMenu,
          },
                
          // Layout
          {
            label: Editor.T('MAIN_MENU.layout.title'),
            id: 'layout',
            submenu: [
              {
                label: Editor.T('MAIN_MENU.layout.default'),
                click () {
                  let layoutInfo = require(Editor.Window.defaultLayout);
                  Editor.Ipc.sendToMainWin( 'editor:reset-layout', layoutInfo);
                }
              },
              {
                label: Editor.T('MAIN_MENU.layout.empty'),
                dev: true,
                click () {
                  Editor.Ipc.sendToMainWin( 'editor:reset-layout', null);
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
