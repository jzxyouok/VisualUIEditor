`Editor` is a module contains app-wide core editor functionality. You can access properties or methods of Editor module anytime, anywhere in your editor framework app (including Fireball).

This module can be categorized into the following parts:

## Paths

Editor module provides following properties to give user access to common paths:

  - `Editor.App.path`: The current app.js working directory path.
  - `Editor.App.home`: Your application's home path. Usually it is `~/.{your-app-name}`
  - `Editor.frameworkPath`: The editor framework module path. Usually it is `{your-app}/editor-framework/`

## Protocols

Due to the complicated situation of current working directory between core-level and page-level processes. We created the following custom protocols to give user easy access to key location inside editor-framework app and Fireball:

  - `editor-framework://`: Map to the editor framework module path.
  - `app://`: Map to the root path of your app.
  - `packages://{package-name}`: Map to the `{package-name}` path.
  - `packages://{package-name}/widget`: Map to a widget path.

If you know exactly how to reference a resource in your script, you can use absolute path or relative path as well.

Url with custom protocols can be used directly in HTML and CSS import. In page-level or core-level JavaScript, you should write:

```js
var myFilePath = Editor.url('app://myfolder/myfile.js');
```

`Editor.url` method will convert your url to absolute path of the file system of your OS.


## Options

  - `Editor.dev`: Indicate if the application running with `--dev` option.
  - `Editor.showDevtools`: Indicate if the application running with `--show-devtools`.

## Editor.App

The Editor.App is your app.js module. Read more in [Define your application](../../manual/define-your-app.md).


## TODO: introduce the submodules in both main and renderer process
