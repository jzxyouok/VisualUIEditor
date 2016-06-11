Electron alread provide a way to detect online and offline for editor ---
[Online/Offline Event Detection](https://github.com/atom/electron/blob/master/docs/tutorial/online-offline-events.md)

Editor Framework make this even easy by wrapping it to a worker.

You can use it by putting the code in your editor init phase:

```javascript
Editor.App.extend({
  init ( opts, cb ) {
    let worker = new Editor.Worker('online', {
      workerType: 'renderer',
      url: 'editor-framework://static/online-worker.html',
    });
    worker.on('editor:online-status-changed', ( event, status ) => {
      console.log(status);
    });
    worker.start(cb);
  },
});
```

