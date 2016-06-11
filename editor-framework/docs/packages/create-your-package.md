Editor Framework loads package before App runs. By default it loads packages from `editor-framework://builtin/` and `~/.{app-name}/packages/`. If you are working with [Fireball](https://github.com/fireball-x/fireball), then it will load packages from `fireball/builtin` and `~/.fireball/packages` folder.

You can customize the location it loads package from through the method `Editor.registerPackagePath` in your `App.init` function.

## Structure

In general, packages should have the following structure:

```plain
MyPackage
  |--(optional)panel
  |   |--panel.js
  |   |--(optional)template.html
  |   |--(optional)style.css
  |--main.js
  |--package.json
```

Some key parts explained:

- `main.js`: main entry file, read the [Main Entry](#main-entry) section.
- `package.json`: package description file, not used for [npm](https://www.npmjs.com/), read [Package Description](#package-description) section.
- `panel`: this folder is necessary if your package need to open a panel to work.

For panels and widgets, you can combine script and styles to a single html file. See [this simple test case](/test/fixtures/packages/simple/panel/panel.js) as an example. You can also write script and styles in any file format that compiles to JavaScript or CSS, such as [coffeescript](http://coffeescript.org/), [stylus](https://learnboost.github.io/stylus/), [less](http://lesscss.org/), [sass](http://sass-lang.com/). Check out [Building Packages](load-and-build-packages.md) documentation for details.

## Package Description

Each package uses a `package.json` file to describe itself. Just create this file in your package project folder.

For example:

```js
{
  "name": "demo-simple",
  "version": "0.0.1",
  "description": "Simple Demo",
  "author": "Firebox Technology",
  "main": "main.js",
  "menus": {
    "Examples/Simple": {
      "message": "demo-simple:open"
    }
  },
  "panels": {
    "panel": {
      "frame": "panel/panel.html",
      "type": "dockable",
      "title": "Simple",
      "width": 800,
      "height": 600,
      "messages": [
      ]
    }
  }
}
```

Explanation for each key-value pair:

  - `name` *String* - Name of the package, this name must be unique, otherwise it can not be published online.
  - `version` *String* - The version number that follows [semver](http://semver.org/) pattern.
  - `description` *String* (Optional) - A simple description of what your package does.
  - `author` *String* (Optional) - Who created this package.
  - `build` *Boolean* (Optional) - If build the package to `bin/dev`
  - `hosts` *Object* (Optional) - The version of the hosts required for this package.
  - `main` *String* (Optional) - A file path to the main entry javascript. Usually `main.js`, you can also use other filename and specify it here.
  - `menus` *Object* (Optional) - The menu list.
    - `key` *String* - Menu path, example: `foo/bar/foobar`
    - `value` *Object* - Menu options
      - [Editor Menu Template](https://github.com/fireball-x/editor-framework/blob/master/docs/api/core/menu.md)
  - `panel[.sub-name]` *Object* (Optional) - Panel info
    - `main` *String* - The panel main entry file.
    - `ui` *String* (Optional) - The ui-framework used in this panel. Default is `none`, can be `polymer`.
    - `type` *String* (Optional) - Default is `dockable`, can be `dockable`, `float`, `fixed-size`, `quick`, `simple`.
    - `title` *String* (Optional) - The panel title shows in the tab label, default to the panelID.
    - `popable` *Boolean* (Optional) - Default is `true`, indicate if the panel is popable.
    - `width` *Integer* (Optional) - The width of the panel frame.
    - `height` *Integer* (Optional) - The height of the panel frame.
    - `min-width` *Integer* (Optional) - The min-width of the panel frame.
    - `min-height` *Integer* (Optional) - The min-height of the panel frame.
    - `shortcuts` *Object* (Optional) - The keyboard shortcut for the panel.
      - `key` *String* - define the key combination (example: `command+k`).
      - `value` *String* - The method name defined in the panel frame.
    - `messages` *Array* (Optional) - The ipc message name list.
    - `profiles` *Object* (Optional) - The list of default profile settings.
      - `key` *String* - The profile type, by default it can be `local` or `global`. You can register more profile type through `Editor.registerProfilePath`.
      - `value` *Object* - The default setting values.
  - `widgets` *Object* (Optional) - The widget list.
    - `key` *String* - Widget name, this name will be used as host name in `widgets://{host-name}/` protocol.
    - `value` *Object* - The widget folder path
  - `packages` *Object* (Optional) - The editor-framework package dependencies list.
  - `dependencies` *Object* (Optional) - The node module dependencies list.

## Main Entry

The `main.js` file (or any file you register as main entry in `package.json`) serves as main entry of the package program. Main entry usually looks like this:

```js
'use strict';

module.exports = {
  load () {
    // callback when package has been loaded
  },

  unload () {
    // callback when package has been unloaded
  },

  // an IPC message receiver
  messages: {
    open () {
      Editor.Panel.open('demo-simple');
    },
  }
};
```

### module.exports

Fireball run each package's main entry as a module with `require`, so you must expose properties and method in your main entry with `module.exports`. See [iojs module API docs](https://iojs.org/api/modules.html#modules_module_exports) for details.

### IPC Message

In the above example, main entry listen to an IPC message `open` (it is short name for `demo-simple:open`) and call `Editor.Panel.open` to open a package panel. This is the most common way to open a package panel. To learn more about IPC messages and how package communicate between core and page level, read [IPC Channel docs](ipc-channel.md).

The initial `demo-simple:open` message is registered in `main-menu['Examples/Simple'].message` property of `package.json`. See the above `package.json` example.

### Main Process

Main entry runs in main-process, you can do following things in main-process:

- Use full [Node.js API](https://nodejs.org/api/)
- Use [Electron's API](https://github.com/atom/electron/tree/master/docs#api-references) that listed under 'modules for the main process' or 'modules for both processes'
- Require any main, local or npm module. For npm modules.

## Menu Path

Menu paths are defined in `main-menu` property of `pacakge.json`. Menu paths definition should looks like this:

```json
"main-menu": {
  "Examples/Simple": {
    "message": "demo-simple:open"
  },
  "Examples/Advanced": {
    "message": "demo-simple:advance"
  }
}
```

A menu path looks like `MenuName/ItemName`. You can also write `MenuName/GroupName/ItemName`, results in the following menu:
![image](https://cloud.githubusercontent.com/assets/344547/8249697/89da532e-169f-11e5-9f69-d49731ea0ca6.png)

When a menu item is clicked, it sends an IPC message from page-level. That's why we usually make a "package-name:open" IPC message receiver to actually open the package panel.
