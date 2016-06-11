'use strict';

let DevTools = {
  focus ( editorWin ) {
    let nativeWin = editorWin.nativeWin;
    nativeWin.webContents.openDevTools();
    nativeWin.devToolsWebContents.focus();
  },

  executeJavaScript ( editorWin, script ) {
    let nativeWin = editorWin.nativeWin;
    nativeWin.webContents.openDevTools();
    nativeWin.devToolsWebContents.executeJavaScript(script);
  },

  enterInspectElementMode ( editorWin ) {
    DevTools.executeJavaScript(
      editorWin,
      'DevToolsAPI.enterInspectElementMode()'
    );
  },
};

module.exports = DevTools;
