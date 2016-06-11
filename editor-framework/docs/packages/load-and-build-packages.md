Packages can be developed in any of the following file format:

- HTML
- JavaScript with ES6 and ES7 features
- [Stylus](https://learnboost.github.io/stylus/)
- [Less](http://lesscss.org/)
- [Sass](http://sass-lang.com/)
- [CoffeeScript](http://coffeescript.org/) will be supported, PR is welcome!
- [TypeScript](http://www.typescriptlang.org/) will be supported, PR is welcome!

To make sure package users facing consistent file format, Editor-Framework provides a pipeline to automatically build any of the above file format to vanila ES5 JavaScript and CSS. Here's how.

## Loading Packages

To load packages into your Editor-Framework app, you need to either:

- Specify a path to load your packages from by running the method `Editor.registerPackagePath` in your `App.init` function. Then put all your packages into that path folder.
- By default, Editor-Framework load all packages in [/demo](/demo) folder. You can also created your packages here to quickly see it in Package Manager list.
- You can also put your packages into `~/.{app-name}/packages` folder, read [create packages](create-your-package.md#create-your-package) doc for details.

To load packages for [Fireball](https://github.com/fireball-x/fireball), you can open Package-studio with the following parameter:

```bash
# Open Fireball Package Studio with all packages in editor-framework/demo loaded
gulp package-studio --path editor-framework/demo
```

This way you can specify any folder you like to hold all your packages and they will be loaded by Package-studio automatically.

## Building Package

You can enable building for any loaded package, just add the property `"build": "true"` to your package's `package.json` file.

If a package has building enabled(`"build":"true"`), Editor-framework will build the package and put the compiled file into `package-name/bin/dev` folder. Then load the package from `package-name/bin/dev`.  The `"build": "true"` property will also be removed from the compiled package's `package.json` file, making it ready to ship.

A package will also be rebuild when `package-name/bin/dev/package.json` has a different version number than `package-name/package.json`.

If a package has no `build` property or has it disabled, Editor-framework will load the package as it is from `package-name` folder. No build or rebuild process will be applied to this package.

## File Change Watch

When Editor-framework is running, it will watch all loaded packages. If you modified files in your package:

- File change notification fired by package watcher.
- If package has building enabled, rebuild the package.
- If building disabled or rebuild success, go through the dirty notify pipeline. If rebuild failed, stop the process.

Dirty notification has different pipeline for `page-level` changes and `core-level` changes:

- For `page-level` changes, for example you changed the html or style in your `panel.html` file, it will send ipc message to panel indicating panel out-of-date. And your panel's tab will turn red. You can reload the editor page to remove the 'out-of-date' state of page by select `Developer/Reload` or press Command+R (on Mac) or Control+R (on Windows).
![red tab](https://cloud.githubusercontent.com/assets/344547/8019179/70f804fe-0c73-11e5-8736-8df1a71e34a4.png)
- For `core-level` changes, for example modification to `main.js` file, it will unload and reload the package.

## Manual Reload Package

With your package loaded in Package Manager, you can also reload your package by clicking 'Reload' button in your package item:

![image](https://cloud.githubusercontent.com/assets/344547/8019037/beb6e248-0c6c-11e5-868d-9fe40c056155.png)

When 'Reload' button is clicked, Package Manager will:

- Check if the package has building enabled. If yes, rebuild it.
- If rebuild success, unload the package. If an error raised while compiling, don't go to next step.
- Load the package again.
