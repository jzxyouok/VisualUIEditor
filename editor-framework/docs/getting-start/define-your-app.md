In your `package.json`, you need to add `main` field, and assign your main-entry file to it.
Here is an exmaple `package.json` file:

```json
{
  "name": "your app name",
  "version": "0.0.1",
  "description": "A simple app based on editor-framework.",
  "dependencies": {},
  "main": "main.js" //<== Important!!! Must have.
}
```

## Main Entry Script

In your main entry script, extends `Editor.App` by calling `Editor.App.extend` and pass a definition to it.
Here is an example:

```javascript
'use strict';

// require editor-framework at the beginning
Editor = require('editor-framework');

// extends the app
Editor.App.extend({
  // optional, init yargs before app inited
  beforeInit ( yargs ) {
  },

  // init your app
  init ( opts, cb ) {
    if ( cb ) {
      cb ();
    }
  },

  // run your app
  run () {
    // create main window
    let mainWin = new Editor.Window('main', {
      title: 'My App',
      minWidth: 800,
      minHeight: 600,
      show: false,
      resizable: true,
    });
    Editor.mainWindow = mainWin;

    // load your app page
    mainWin.load( 'app://index.html' );

    // show and focus the main window
    mainWin.show();
    mainWin.focus();
  },
});
```

Read more details about App definition in [App lifecycle and events](./app-lifecycle-and-events.md).

## Yeoman Generator

To make things simple, we also provide a yeoman generator to create an editor-framework app --- [generator-editor-framework](https://github.com/cocos-creator/generator-editor-framework).
