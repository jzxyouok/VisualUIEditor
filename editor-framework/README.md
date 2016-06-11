# Editor Framework

[Documentation](https://github.com/cocos-creator/editor-framework/tree/master/docs) |
[Downloads](https://github.com/cocos-creator/editor-framework/releases/) |
[Install](#install) |
[Features](#features)

[![Circle CI](https://circleci.com/gh/cocos-creator/editor-framework.svg?style=svg)](https://circleci.com/gh/cocos-creator/editor-framework)
[![Build Status](https://travis-ci.org/cocos-creator/editor-framework.svg?branch=master)](https://travis-ci.org/cocos-creator/editor-framework)
[![Build status](https://ci.appveyor.com/api/projects/status/ugkft1nmcy2wklrl?svg=true)](https://ci.appveyor.com/project/jwu/editor-framework)
[![bitHound Overall Score](https://www.bithound.io/github/cocos-creator/editor-framework/badges/score.svg)](https://www.bithound.io/github/cocos-creator/editor-framework)
[![Dependency Status](https://david-dm.org/cocos-creator/editor-framework.svg)](https://david-dm.org/cocos-creator/editor-framework)
[![devDependency Status](https://david-dm.org/cocos-creator/editor-framework/dev-status.svg)](https://david-dm.org/cocos-creator/editor-framework#info=devDependencies)

Editor Framework gives you power to easily write professional multi-panel desktop software in HTML5 and node.js.

The framework is based on top of [Electron](http://github.com/atom/electron) ~~and [Polymer](http://github.com/polymer/polymer)~~(Polymer will be removed soon, and editor-framework will be unlimited for any gui framework).
It is designed conforming to Electron’s [main and renderer process architecture](https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md).
To make multiple windows communicate easily, Editor Framework extends [Electron’s IPC message API](https://github.com/atom/electron/blob/master/docs/api/ipc-renderer.md), making it easier to send and receive callbacks between the main and renderer processes.

It is designed for full extensibility. In the main process, we achieve this by introducing a package management module and several registration APIs. The user can load or unload packages on the fly without closing or restarting the app. In the renderer process, we use HTML5 Web Component standards. The user can extend the widgets and panels, then refresh the page to apply the changes.

![screen shot](https://cloud.githubusercontent.com/assets/174891/11186940/24a90d74-8cbf-11e5-9ea5-fc2610ebbd79.png)


## Install

Suppose you have an Electron project, if not, just create an empty directory and run `npm init` in it.
After that, install editor-framework as a package of your project:

```bash
npm install --save editor-framework
```

## Usage

Here is a simple example to show you how to use editor-framework in your Electron project.

**package.json**

```json
{
  "name": "your app name",
  "version": "0.0.1",
  "description": "A simple app based on editor-framework.",
  "dependencies": {},
  "main": "main.js"
}
```

**main.js**

```javascript
const Editor = require('editor-framework');

Editor.App.extend({
  init ( opts, cb ) {
    Editor.init({
      'package-search-path': [
        Editor.url('app://packages/'),
      ],
    });

    if ( cb ) {
      cb ();
    }
  },

  run () {
    // create main window
    let mainWin = new Editor.Window('main', {
      title: 'Editor Framework',
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
    mainWin.load( 'app://index.html' );
    mainWin.show();

    // open dev tools if needed
    if ( Editor.argv.showDevtools ) {
      // NOTE: open dev-tools before did-finish-load will make it insert an unused <style> in page-level
      mainWin.nativeWin.webContents.once('did-finish-load', function () {
        mainWin.openDevTools({
          detach: true
        });
      });
    }
    mainWin.focus();
  },
});
```

**index.html**

```html
<html>
  <head>
    <title>Main Window</title>
    <meta charset="utf-8">

    <style>
      #mainDock {
        position: relative;
      }
    </style>
  </head>

  <body class="layout vertical">
    <main-dock class="flex-1"></main-dock>
  </body>
</html>
```

## Features

 - Package Management
   - Dynamically load and unload packages
   - Can use any web language (Less, Sass, CoffeeScript, TypeScript, …) for your package; editor-framework will build it first before loading the package.
   - Watch package changes and reload or notify changes immediately
   - Manage your packages in [package manager](https://github.com/fireball-packages/package-manager)
 - Panel Management
   - Freely docks panel anywhere in multiple windows
   - Dynamically load user define panels from package
   - Easily register and respond to ipc messages for your panel
   - Easily register shortcuts (hotkeys) for your panel
   - Save and load layout in json
   - Save and load panel profiles
 - Menu Extends
   - Dynamically add and remove menu item
   - Dynamically change menu item state (enabled, checked, visible, …)
   - Load user menu from packages
 - Commands (under development)
   - Register and customize commands for your App
   - A powerful command window (CmdP) for searching and executing your commands
 - Profiles
   - Allow user to register different types of profile to their need (global, local, project, …)
   - Load and save profiles through unified API
 - Logs
   - Use Winston for low level logs
   - Log to file
   - Integrate with [console](https://github.com/fireball-packages/console) for display and query your logs
 - Global Selection
   - Selection cached and synced among windows
   - User can register his own selection type
   - Automatically filtering selections
 - Global Undo and Redo
 - Enhance the native Dialog (under development)
   - Remember dialog last edit position
 - Enhance IPC Programming Experience
   - Add more ipc methods to help sending and recieving ipc messages in different level
   - Allow sending ipc message to specific panel
   - Allow sending ipc message to specific window
   - Allow sending ipc request and waiting for the reply in callback function
   - Integrate with [ipc-debugger](https://github.com/fireball-packages/ipc-debugger) to help you writing better ipc code
 - An Auto-Test Workflow
   - Detect your package changes and automatically run tests under it in [tester](https://github.com/fireball-packages/tester)
   - Integrate [Mocha](mochajs.org), [Chai](http://chaijs.com/) and [Sinon](sinonjs.org) to our test framework
   - A ghost-tester to simulate UI events and behaviours for testing
   - Automatically recreate your test target (widgets, panels) after each test case

## Develop

### Getting Start

Clone the repo:

```bash
git clone https://github.com/cocos-creator/editor-framework
```

Run `npm install` in it:

```bash
npm install
npm run build # build styles
```

### Install and Run Examples

#### example-apps

```bash
git clone https://github.com/exsdk/example-apps
npm start ./example-apps/${example-name}
```

#### example-apps/demo

The example-apps provide a demo project to help user developing packages. To use the demo project,
first we need to install it. Go to the demo folder and run the following command:

```bash
cd ./example-apps/demo
npm install
bower install
gulp update
```

After you success to install it, you can run the demo in editor-framework root directory through the command:

```bash
npm start ./example-apps/demo
```

### Test Environment

To test the editor-framework itself, just run:

```bash
npm test [./your/test/file] -- [options]

## or

npm start ./test -- test ./your/test/file [options]
```

You can also run a single test or a bunch of tests in one directory by:

```bash
npm test ${your/test/path}
```

You can also force to run tests in renderer by `--renderer` option:

```bash
npm test ${your/test/path} -- --renderer
```

You can load specific package and run its tests by `--package` option:

```bash
npm test ${your/test/path} -- --package
```

To debug a test, use `--detail` option:

```bash
npm test ${your/test/path} -- --detail
```

To change a reporter, use `--reporter name` option:

```bash
npm test ${your/test/path} -- --reporter classic
```

### Write Your Test

**Main Process**

```js
suite(tap, 'Test Main Process', t => {
  t.test ('should be ok', t => {
    t.end();
  });
});
```

**Renderer Process**

```html
<template id="basic">
  <div class="title">Hello World</div>
</template>
```

```js
suite(tap, 'Test Renderer Process', t => {
  t.test('should be ok', t => {
    helper.runElement(
      'app://test/my-template.html', 'basic', 'div.title',
      el => {
        t.assert(el, 'element not found');
        t.equal(el.innertText, 'Hello World');

        t.end();
      }
    );
  });
});
```

**NOTE** The first describe callback can not use arrow function.

### Generate Documentation

To generate the document, just run:

```bash
npm run api
```

It will generate the API document in `./apidocs`, you can browse it by open `./apidocs/index.html`.

## License (MIT)

Copyright (c) 2015 Cocos Creator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
