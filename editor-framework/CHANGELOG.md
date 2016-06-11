## CHANGELOG

### v0.6.2 (developing)

 - Upgrade to Electron v1.2.1
 - Friendly support node-inspector for debugging main process
 - Fix package watcher not work
 - Many bugs fixed in internal ui-kit
 - Rename Editor.JS.mixin to Editor.JS.assign
 - Rename Editor.JS.mixinExcept to Editor.JS.assignExcept
 - Rename Editor.UI.DomUtils to Editor.UI._DomUtils, move all its properties to Editor.UI
 - Rename Editor.UI.FocusMgr to Editor.UI._FocusMgr, move some of its properties to Editor.UI
 - Rename Editor.UI.ResMgr to Editor.UI._ResMgr, move all its properties to Editor.UI

### v0.6.1

 - Upgrade to Electron v1.1.3
 - Add more internal ui-kit
   - ui-color
   - ui-color-picker
   - ui-num-input
   - ui-prop
   - ui-select
   - ui-slider
   - ui-text-area

### v0.6.0

 - Upgrade to Electron v1.0.1
 - Fix `Editor.log` will not show message on Console panel
 - Add `Editor.UI.FocusMgr` to manage focus for panel
 - Add default styles sheets (dark theme) for internal ui-kit
 - Add internal ui-kit
   - ui-button
   - ui-checkbox
   - ui-input

### v0.5.3

 - Remove strict mode for yargs
 - Fix "build" command report error when search path not found
 - Add `<panel-frame>` custom element as panel frame container
 - Remove Polymer code from `<main-dock>`
 - Add `Editor.App.loadPackage` and `Editor.App.unloadPackage`, user can use their custom keyword for additional extension of the package
 - Add `listeners` in panel-frame for listening dom events
 - Add `close` lifecycle callback in `<panel-frame>`
 - BREAKING CHANGES
   - Remove `editor:panel-run` message from panel, use `run` function instead
   - Change dom event `resize` to `panel-resize` in `<panel-frame>`

### v0.5.2

 - Upgrade to Electron v0.37.6
 - Support non-polymer panel by default
 - Fix set break point in an ipc message in renderer will lead to devtools crash
 - Fix console error stack will add main-process call stack when we raise a renderer process error
 - Add `Editor.Protocol.register` in renderer process
 - Add `deprecate` function in global and window
 - Add `Editor.trace` for trace log in main and renderer process
 - deprecate `pkgDependencies` in `package.json`, use `packages` instead
 - deprecate `panels` in `package.json`, use `panel` instead. for multiple panel registry, use `panel.x` for the additional panel.
 - deprecate `Editor.registerPanel`, use `Editor.polymerPanel` instead
 - deprecate `Editor.registerElement`, use `Editor.polymerElement` instead
 - BREAKING CHANGES
   - Change panel ipc message registry from `package.json`'s `messages` field to panel's js file
   - Change panel entry field from `frame` to `main` in `package.json`
   - Polymer panel needs add field `ui: "polymer"` in your panel define in `package.json`

### v0.5.1

 - Provide `Editor.App.quit` callback for user to control the quiting phase in Editor
 - Fix `Editor.Ipc.sendTo` will swallow last argument if it is a number
 - Simplify `Editor.Ipc.sendToPanel` message
 - Require the first argument for `event.reply` be `null` or instance of `Error`
 - Add explicit timeout error for callback in `Editor.sendXXXX`
 - Add explicit panel not found error for callback in `Editor.sendToPanel`
 - Add explicit message not found error for callback in `Editor.sendToPanel`

### v0.5.0

 - upgrade to Electron v0.37.5
 - modulize the code
 - use shadow dom for panel content
 - disableAutoHideCursor by default for Editor.Window
 - add mouse hint for tests
 - add REPL interaction for main process
 - add `Editor.DevTools` in main process
 - upgrade `globby` and `del` to latest version (the promise one)
 - replace `commander.js` with `yargs`
 - BREAKING CHANGES
   - change the way of register ipc messages in package's entry point
   - change the field to register main menu item in `package.json` from `menus` to `main-menu`
   - replace `Editor.runMode` with `Editor.argv._command`
   - replace `Editor.runOpts` with `Editor.argv`
   - replace `Editor.isDev` with `Editor.dev`
   - replace `Editor.showDevtools` with `Editor.argv.showDevtools`
   - remove `Editor.events`, use `Editor.App` `on`, `off`, `once` and `emit` instead
   - replace `Editor.mainWindow` with `Editor.Window.main`
   - replace `Editor.loadProfile` with `Editor.Profile.load`
   - replace `Editor.registerProfilePath` with `Editor.Profile.register`
   - replace `Editor.registerProtocol` with `Editor.Protocol.register`
   - replace `Editor.focused` with `Editor.App.focused`
   - replace `Editor.isCoreLevel` with `Editor.isMainProcess`
   - replace `Editor.isPageLevel` with `Editor.isRendererProcess`
   - put `Editor.sendXXXX` functions to `Editor.Ipc` module
   - replace `Editor.sendToCore` to `Editor.Ipc.sendToMain`
   - replace `Editor.sendToCoreSync` to `Editor.Ipc.sendToMainSync`
   - replace `Editor.sendToMainWindow` to `Editor.Ipc.sendToMainWin`
   - replace `Editor.sendToPanel` to `Editor.Ipc.sendToPanel`
   - replace `Editor.sendToPackage` to `Editor.Ipc.sendToPackage`
   - replace `Editor.sendToWindows` to `Editor.Ipc.sendToWins`
   - replace `Editor.sendToAll` to `Editor.Ipc.sendToAll`
   - replace `Editor.Window.sendToPage` to `Editor.Window.send`
   - remove `Editor.sendRequestXXX`, just add your callback directly in `sendToMain`, `Window.send` and `sendToPanel`
   - replace `EditorUI` with `Editor.UI`
   - put `EditorUI.bind` and several functions to `Editor.UI.PolymerUtils`
   - all `window:` message becomes `editor:window-`
   - all `package:` message becomes `editor:package-`
   - all `panel:` message becomes `editor:panel-`
   - all `console:` message becomes `editor:console-`
   - the first parameter of the panel ipc message will be `event`
   - replace `reply` callback with `event.reply` for `sendRequestXXX` replys

### v0.4.0

 - upgrade to Electron v0.36.3
 - writing the code in es6 (working in progress)
 - define the entry app through `Editor.App.extend` instead of `global.__app`
 - replace `Editor.name` with `Editor.App.name`
 - replace `Editor.appPath` with `Editor.App.path`
 - replace `Editor.appHome` with `Editor.App.home`
 - replace `Editor.App.initCommander` with `Editor.App.beforeInit`
 - remove `Editor.App.load`, `Editor.App.unload`
 - `Editor.App` no longer accept ipc-message `app:*` register in it
 - support minify editor-framework in final product
 - move `core/` to `lib/main/`
 - move `page/` to `lib/renderer/`
 - move `share/` to `lib/share/`
 - change the unit test working pipeline
 - replace `Editor.registerPackagePath` with `Editor.Package.addPath`
 - replace `Editor.unregisterPackagePath` with `Editor.Package.removePath`
 - replace `Editor._packagePathList` with `Editor.Package.paths`
 - support load dependent packages through `pkgDependencies` in `package.json`
 - add `Editor.init` and `Editor.reset` which can help register environment quickly
 - replace `panel:open` ipc to `panel:run` in renderer process
 - add `panel-ready` function in panel element, it will invoked when panel been totally setup
 - add `Editor.Undo` module
 - support `path` when define a menu template
 - add `Editor.Menu.update` which can update a submenu without change its position
 - add `Editor.Menu.walk` which can walking the menu template tree
 - add `Editor.Menu.register` and add `Editor.Menu.getMenu`, useful when caching a menu template
 - add i18n solution
