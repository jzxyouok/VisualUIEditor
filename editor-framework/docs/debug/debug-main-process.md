Debug main process in editor-framework is the same as Electron. You can find the
details in Electron's document --- [Debugging the Main Process](http://electron.atom.io/docs/tutorial/debugging-main-process/). However,
editor-framework ease the use of it by providing menu option and building script.

## Build and install node-inspector for Electron

Just run:

```bash
npm run build:node-inspector
```

It will automatically install and rebuild node-inspector by following the the Electron's instruction: [Use node-inspector for Debugging](http://electron.atom.io/docs/tutorial/debugging-main-process/#use-node-inspector-for-debugging).

## Run node-inspector

Once you install the node-inspector above, run editor-framework, and go to the menu item: `Main Menu / Developer / Debug Main Process (Node Inspector)`.

If everything goes well, you will see a console log:

```
node-inspector started: http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=3030
```

Now you can open your chrome browser, then paste the url to start debugging main process. 
