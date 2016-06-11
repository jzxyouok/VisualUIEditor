'use strict';

const Spawn = require('child_process').spawn;
const Async = require('async');
const Chalk = require('chalk');
const Fs = require('fire-fs');

const pjson = JSON.parse(Fs.readFileSync('./package.json'));
const electronVersion = pjson.devDependencies['electron-prebuilt'];

Async.series([
  next => {
    console.log(Chalk.cyan('========================================'));
    console.log(Chalk.cyan('npm install node-inspector'));
    console.log(Chalk.cyan('========================================\n'));

    let child = Spawn('npm', [
      'install', 'node-inspector'
    ], {
      stdio: 'inherit',
    });

    child.on('exit', code => {
      if ( code !== 0 ) {
        next( new Error('Failed to install node-inspector') );
        return;
      }

      next();
    });
  },

  next => {
    console.log(Chalk.cyan('========================================'));
    console.log(Chalk.cyan('npm install node-pre-gyp'));
    console.log(Chalk.cyan('========================================\n'));

    let child = Spawn('npm', [
      'install',
      'git+https://git@github.com/enlight/node-pre-gyp.git#detect-electron-runtime-in-find'
    ], {
      stdio: 'inherit',
    });

    child.on('exit', code => {
      if ( code !== 0 ) {
        next( new Error('Failed to install node-pre-gyp') );
        return;
      }

      next();
    });
  },

  next => {
    console.log(Chalk.cyan('========================================'));
    console.log(Chalk.cyan('recompile node-inspector'));
    console.log(Chalk.cyan('========================================\n'));

    let child = Spawn('./node_modules/.bin/node-pre-gyp', [
      `--target=${electronVersion}`,
      '--runtime=electron',
      '--fallback-to-build',
      '--directory',
      'node_modules/v8-debug/',
      '--dist-url=https://atom.io/download/atom-shell',
      'reinstall',
    ], {
      stdio: 'inherit',
    });

    child.on('exit', code => {
      if ( code !== 0 ) {
        next( new Error('Failed to recompile node-inspector') );
        return;
      }

      next();
    });
  },

  next => {
    let child = Spawn('./node_modules/.bin/node-pre-gyp', [
      `--target=${electronVersion}`,
      '--runtime=electron',
      '--fallback-to-build',
      '--directory',
      'node_modules/v8-profiler/',
      '--dist-url=https://atom.io/download/atom-shell',
      'reinstall',
    ], {
      stdio: 'inherit',
    });

    child.on('exit', code => {
      if ( code !== 0 ) {
        next( new Error('Failed to recompile node-inspector') );
        return;
      }

      next();
    });
  },
], err => {
  if ( err ) {
    console.log(Chalk.red(err));
  }
});
