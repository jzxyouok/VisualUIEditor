## Main and Renderer Process

editor-framework mainly has two type of processes:

- Main Process: In charge of creating window and web pages, share data among renderer processes.
- Renderer Process: Render HTML web page and run client-side JavaScript. Each window is a separated renderer process.

To better understand these two type of processes, read [Electron's introduction document](https://github.com/atom/electron/blob/master/docs/tutorial/quick-start.md). If you're still confused, think of main process as a node.js server, and renderer process as a web client.

In short, an editor-framework application starts from the main process, and can have several renderer processes (windows) running on top of it.

## Inter-Process Communication (IPC)

Each process has its own JavaScript context and you can not directly access the memory data from other process. To exchange information, you have to sending message in one process and listening the specific message in the target process. Also known as inter-process communication (IPC).

Electron provides two IPC modules [ipcMain ](https://github.com/atom/electron/blob/master/docs/api/ipc-main.md) and [ipcRenderer](https://github.com/atom/electron/blob/master/docs/api/ipc-renderer.md) to help users communication between main and renderer processes. The editor-framework encapsulate them to make it even easier for more complex scenarios.

## IPC Message Identifier

An IPC message is a string to identify the message between processes. The message sender sends the message with a specific identifier. And message receiver in other process who listen to the identifier code will recieve the message.

We recommend the following pattern for an IPC message identifier:

```javascript
'module-name:action-name'
// or
'package-name:action-name'
```

Basically you can use any string as message identifier, but we strongly recommend you use your package name (if you are sending message in your package) or module name (if you are handling sub-module tasks) with a colon to make a message identifier. Let's see it in action:

```javascript
'app:save-file'
```

The `app` indicate that this message is an application-level task, `save-file` is the action you wish to do.

Here is another example:

```javascript
'my-simple-package:query-user-info'
```

The `my-simple-package` is the your package name, and `query-user-info` is the action.
