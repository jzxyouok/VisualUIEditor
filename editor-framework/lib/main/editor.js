'use strict';

/**
 * @module Editor
 */
let EditorM = {};
module.exports = EditorM;

// requires
const Electron = require('electron');
const Fs = require('fire-fs');
const Path = require('fire-path');
const Globby = require('globby');
const Chokidar = require('chokidar');
const Async = require('async');

const App = require('./app');
const Ipc = require('./ipc');
const Menu = require('./menu');
const Protocol = require('./protocol');
const Profile = require('./profile');
const Console = require('./console');
const Window = require('./window');
const Debugger = require('./debugger');
const Package = require('./package');
const Panel = require('./panel');
const MainMenu = require('./main-menu');
const i18n = require('./i18n');
const Selection = require('../share/selection');
const Undo = require('../share/undo');

// ==========================
// misc API
// ==========================

let _isClosing = false;
let _packageWatcher;

Object.defineProperty(EditorM, 'isClosing', {
  enumerable: true,
  get() {
    return _isClosing;
  }
});

EditorM.url = Protocol.url;

// NOTE: this can only be invoked in Editor.Window.main.on('closed') event
EditorM._quit = function () {
  _isClosing = true;

  if ( _packageWatcher ) {
    _packageWatcher.close();
  }

  let winlist = Window.windows;
  winlist.forEach(win => {
    win.close();
  });

  // TODO: make sure all win's closed event been called.

  // close debugger
  Debugger.stopRepl();
  Debugger.stopNodeInspector();

  if ( App.quit ) {
    App.quit(() => {
      // emit quit event
      App.emit('quit');

      // close app after all
      Electron.app.quit();
    });

    // DEBUG
    if ( EditorM.dev ) {
      setTimeout(() => {
        Console.warn('You still not quit your app, do you forget to invoke callback function in Editor.App.quit()?');
      }, 5000);
    }
  } else {
    // emit quit event
    App.emit('quit');

    // close app after all
    Electron.app.quit();
  }
};

EditorM.loadPackagesAt = function ( path, cb ) {
  let idx = Package.paths.indexOf(path);
  if ( idx === -1 ) {
    Console.warn( 'The package path %s is not registerred', path );
    return;
  }

  let paths = Globby.sync(`${path}/*/package.json`);

  Async.eachSeries( paths, ( path, done ) => {
    path = Path.normalize(path);
    let packagePath = Path.dirname(path);
    Package.load( packagePath, err => {
      if ( err ) {
        Console.failed( `Failed to load package at ${packagePath}: ${err.message}` );
      }
      done();
    });
  }, () => {
    if ( cb ) cb ();
  });
};

/**
 * Search and load all packages from the path you registerred
 * {{#crossLink "EditorM.registerPackagePath"}}{{/crossLink}}
 * @method loadAllPackages
 */
EditorM.loadAllPackages = function ( cb ) {
  let i, src = [];
  for ( i = 0; i < Package.paths.length; ++i ) {
    src.push( `${Package.paths[i]}/*/package.json` );
  }

  let paths = Globby.sync(src);

  Async.eachSeries( paths, ( path, done ) => {
    path = Path.normalize(path);
    let packagePath = Path.dirname(path);
    Package.load( packagePath, err => {
      if ( err ) {
        Console.failed( `Failed to load package at ${packagePath}: ${err.message}` );
      }
      done();
    });
  }, () => {
    if ( cb ) cb ();
  });
};

/**
 * Require module through url path
 * @method require
 * @param {string} url
 */
EditorM.require = function ( url ) {
  return require( EditorM.url(url) );
};

/**
 * Spawn child process that start from console
 * @method execSpawn
 * @param {string} command
 * @param {object} options
 */
EditorM.execSpawn = function ( command, options ) {
  let file, args;
  options = options || {};

  if (process.platform === 'win32') {
    file = 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
    options.windowsVerbatimArguments = true;
  } else {
    file = '/bin/sh';
    args = ['-c', command];
    options.windowsVerbatimArguments = false;
  }

  let spawn = require('child_process').spawn;
  return spawn(file, args, options);
};

function _reloadPackages ( reloadInfos, cb ) {
  Async.each( reloadInfos, ( info, done ) => {
    let packageInfo = Package.packageInfo(info.path);
    if ( !packageInfo ) {
      done();
      return;
    }

    Async.series([
      next => {
        if ( !packageInfo.build ) {
          next();
          return;
        }

        Console.log( 'Rebuilding ' + packageInfo.name );
        Package.build( packageInfo._path, next );
      },

      next => {
        let testerWin = Panel.findWindow('tester.panel');

        // reload test
        if ( info.reloadTest ) {
          if ( testerWin ) {
            testerWin.send('tester:run-tests', packageInfo.name);
          }
          next();
          return;
        }

        // reload renderer
        if ( info.reloadRenderer ) {
          for ( let name in packageInfo ) {
            if ( name.indexOf('panel') !== 0 ) {
              continue;
            }

            let panelID = name.replace(/^panel/, packageInfo.name);
            Ipc.sendToWins('editor:panel-out-of-date', panelID);
          }

          if ( testerWin ) {
            testerWin.send('tester:run-tests', packageInfo.name);
          }
          next();
          return;
        }

        // reload main
        if ( info.reloadMain ) {
          Package.reload(packageInfo._path, {
            rebuild: false
          });
          next();
          return;
        }

        next();
      },
    ], err => {
      if ( err ) {
        Console.error( 'Failed to reload package %s: %s', packageInfo.name, err.message );
      }

      done();
    });
  }, err => {
    if ( cb ) {
      cb (err);
    }
  });
}

/**
 * Watch packages
 * @method watchPackages
 */
let _watchDebounceID = null;
let _packageReloadInfo = [];
EditorM.watchPackages = function ( cb ) {
  //
  if ( Package.paths.length === 0 ) {
    if ( cb ) cb ();
    return;
  }

  let src = Package.paths.filter( path => {
    return Fs.existsSync(path);
  });

  _packageWatcher = Chokidar.watch(src, {
    ignored: [
      // /[\/\\]\.(?!app-name)/: ignore /.hidden-files but skip ~/.app-name
      new RegExp('[\\/\\\\]\\.(?!' + App.name + ')'),
      /[\/\\]bin/,
      /[\/\\]test[\/\\](fixtures|playground)/,
    ],
    ignoreInitial: true,
    persistent: true,
  });

  _packageWatcher
    .on('add', path => {
      _packageWatcher.add(path);
    })
    .on('addDir', path => {
      _packageWatcher.add(path);
    })
    .on('unlink', path => {
      _packageWatcher.unwatch(path);
    })
    .on('unlinkDir', path => {
      _packageWatcher.unwatch(path);
    })
    .on('change', path => {
      // NOTE: this is not 100% safe, because 50ms debounce still can have multiple
      //       same packages building together, to avoid this, try to use Async.queue

      let packageInfo = Package.packageInfo(path);
      if ( !packageInfo ) {
        return;
      }

      //
      let reloadInfo;
      _packageReloadInfo.some(info => {
        if ( info.path === packageInfo._path ) {
          reloadInfo = info;
          return true;
        }
        return false;
      });

      if ( !reloadInfo ) {
        reloadInfo = {
          path: packageInfo._path,
          reloadTest: false,
          reloadRenderer: false,
          reloadMain: false,
        };
        _packageReloadInfo.push(reloadInfo);
      }

      // reload test
      if ( Path.contains(Path.join(packageInfo._path, 'test') , path) ) {
        reloadInfo.reloadTest = true;
      }
      // reload page
      else if (
        Path.contains(Path.join(packageInfo._path, 'page') , path) ||
        Path.contains(Path.join(packageInfo._path, 'panel') , path) ||
        Path.contains(Path.join(packageInfo._path, 'widget') , path) ||
        Path.contains(Path.join(packageInfo._path, 'element') , path)
      ) {
        reloadInfo.reloadRenderer = true;
      }
      // reload core
      else {
        reloadInfo.reloadMain = true;
      }

      // debounce write for 50ms
      if ( _watchDebounceID ) {
        clearTimeout(_watchDebounceID);
        _watchDebounceID = null;
      }

      _watchDebounceID = setTimeout(() => {
        _reloadPackages(_packageReloadInfo);
        _packageReloadInfo = [];
        _watchDebounceID = null;
      }, 50);
    })
    .on('error', err => {
      Console.error('Package Watcher Error: %s', err.message);
    })
    .on('ready', () => {
      if ( cb ) cb ();
    })
    // .on('raw', function(event, path, details) { Console.log('Raw event info:', event, path, details); })
    ;
};

// ==========================
// extends
// ==========================

/**
 * Register a path, when loading packages, it will search the path you registerred.
 * {{#crossLink "Editor.loadPackages"}}{{/crossLink}}
 * @method registerDefaultLayout
 * @param {string} path - A absolute path for searching your packages.
 */
EditorM.registerDefaultLayout = function ( path ) {
  Window.defaultLayout = path;
};

/**
 * init editor during Editor.App.init
 * @method init
 * @param {object} opts - options
 * @param {object} profile - profile type to path
 * @param {array} package-search-path - package search path
 * @param {function} main-menu - a function return the new main-menu template
 * @param {string} panel-window - panel window url
 * @param {string} layout - default layout file
 * @param {array} selection - selection type
 * @param {array} i18n - i18n phrases
 * @param {number} debug-port - debug port
 */
EditorM.init = function ( opts ) {
  opts = opts || {};
  EditorM.reset(opts);

  // register i18n phrases
  // NOTE: i18n must before other registers, so that other modules can translate by i18n module
  let i18nPhrases = opts.i18n;
  if ( i18nPhrases ) {
    i18n.clear();
    i18n.extend(i18nPhrases);
  }

  // register profile path
  let profileInfo = opts.profile;
  if ( profileInfo ) {
    for ( let name in profileInfo ) {
      Fs.ensureDirSync(Path.join(profileInfo[name]));
      Profile.register( name, profileInfo[name] );
    }
  }

  // register package search path
  let searchPaths = opts['package-search-path'];
  if ( searchPaths && searchPaths.length ) {
    Package.addPath(searchPaths);
  }

  // register main menu
  let mainMenuTmpl = opts['main-menu'];
  if ( mainMenuTmpl ) {
    Menu.register('main-menu', mainMenuTmpl, true);
    MainMenu.init();
  }

  // register panel window
  let panelWindow = opts['panel-window'];
  if ( panelWindow ) {
    Panel.templateUrl = panelWindow;
  }

  // register layout
  let defaultLayout = opts.layout || EditorM.url('editor-framework://static/layout.json');
  if ( defaultLayout ) {
    EditorM.registerDefaultLayout(defaultLayout);
  }

  // register selection
  let selectionTypes = opts.selection;
  if ( selectionTypes && selectionTypes.length ) {
    selectionTypes.forEach( type => {
      Selection.register(type);
    });
  }

  // register undo commands
  let undoCommands = opts.undo;
  if ( undoCommands ) {
    for ( let id in undoCommands ) {
      Undo.register( id, undoCommands[id] );
    }
  }

  // TODO: EditorM.init
  // app.on('will-finish-launching', () => {
  //   if ( !EditorM.dev ) {
  //     let crashReporter = require('crash-reporter');
  //     crashReporter.start({
  //       productName: EditorM.App.name,
  //       companyName: 'Cocos Creator',
  //       submitURL: 'https://cocos-creator.com/crash-report',
  //       autoSubmit: false,
  //     });
  //   }
  // });

  // TODO:
  // let worker = new EditorM.Worker('online', {
  //   workerType: 'renderer',
  //   url: 'editor-framework://static/online-worker.html',
  // });
  // worker.on('editor:online-status-changed', ( event, status ) => {
  //   console.log(status);
  // });
  // worker.start();
};

/**
 * reset editor
 * @method reset
 */
EditorM.reset = function () {
  // reset i18n method
  i18n.clear();
  i18n.extend(require(`../../static/i18n/${EditorM.lang}.js`));

  // reset profile path
  Profile.reset();
  Profile.register( 'global', App.home );
  Profile.register( 'local', Path.join( App.home, 'local' ) );

  // reset package search path
  Package.resetPath();

  // reset main menu to builtin
  MainMenu._resetToBuiltin();

  // reset panel window
  Panel.templateUrl = 'editor-framework://static/window.html';

  // reset layout
  EditorM.registerDefaultLayout( EditorM.url('app://static/layout.json') );

  // reset selection
  Selection.reset();

  // reset undo
  Undo.reset();
};
