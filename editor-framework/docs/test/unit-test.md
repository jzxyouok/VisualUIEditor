In Editor Framework, we can make and run unit test easily with our Test Suite.

## Package Test

Any package can run test for itself using [Tester](https://github.com/fireball-packages/Tester). Open the Package Manager, and click `Test` button of the package you want to run test with. It will run tests you registered in the `test` filed of your package's `package.json`.

![image](https://cloud.githubusercontent.com/assets/344547/8370061/888597ee-1bf5-11e5-8132-b7ca4db4f4b6.png)

If the test is a `.html` file, Tester will run it as a page-level test. If it is a `.js` file, Tester will run it in the core process as a core-level test.

```js
// your pacakge.json
...
"test": [
  "test/basic.html", // <= this will be test in page-level
  "test/basic-asset-db.js", // <= this will be test in core-level
],
```

How to choose process to run your test? If you are developing **Widget**, **Panel**, you should provide `.html` file and test them in Tester's page-level environment. You can check following builtin packages for example:

- [ui-kit](https://github.com/fireball-packages/ui-kit),
- [console](https://github.com/fireball-packages/console)

If you are developing **Assets**, **Meta**, you should provide `.js` file and test them in Tester's core-level environment. Example packages:

- [canvas-assets](https://github.com/fireball-packages/canvas-assets)

### Write Page-Level Test

The page-level test suite provides three environment:
- [env-widget.html](https://github.com/fireball-packages/tester/blob/master/env/env-widget.html)
- [env-panel.html](https://github.com/fireball-packages/tester/blob/master/env/env-panel.html)
- [env-canvas-studio.html](https://github.com/fireball-packages/tester/blob/master/env/env-canvas-studio.html)

Each test environment import necessary files for your test to run.

For example, if you are writing a panel for editor-framework, you can write your test html like this:

```html
<html>
    <head>
        <meta charset="utf-8">
        <link rel="import" href="packages://tester/env/env-panel.html">
    </head>

    <body>
        <panel-fixture id="panel" panel-id="my.panel"></panel-fixture>
        <script src="basic.js"></script>
    </body>
</html>
```

The `basic.js` file is a standard [mocha](http://mochajs.org/#getting-started) test file with [chai](http://chaijs.com/) assertions. You can use helper functions in your test file depending on your test environment. Go through each environment files to see what helper library they have included.

Check out the builtin package test examples to see what you can do. Such as [console](https://github.com/fireball-packages/console/tree/master/test).

If you are working with Fireball, change the `env-panel` to `env-canvas-studio` instead, it will load the additional script that Fireball needs before running your test.

### Write Core-Level Test

You don't need to worry about test environment for your core-level test in Tester.

When Tester run a `.js` test file registered in `package.json`, it will send a ipc message `tester:run-test` to core-level script (Tester's `main.js`). Then it will spawn a child process using Electron as executable, and run the `js` file with `--test path/to/test/file --report-detials` arguments. If there are any test result that need to report back from the child process, it will send over ipc message, and the message is handled in one of [ipcHandlers](https://github.com/fireball-packages/tester/blob/master/main.js#L28-L63) of `main.js`.

Core-level testing is useful for packages that dealing with Meta and Asset import/export. You can learn more about core-level testing by reading the test method for editor and engine below.

## Editor and Engine Test

For Fireball and Editor Framework developer, we have two ways to run unit test.

### Test In Terminal

The framework can test itself or its submodules by running these shell commands:

- `your-app --test <your/test/file>` Running a single test and output test report in terminal or command line tool you use.
- `your-app --test <your/test/file> --report-failures` Running a single test and collect its failures to the main-process, useful when doing full test
- `your-app --test <your/test/file> --report-details` Running a single test and collect every detail of the test to the main-process, useful when you try to test core-level modules in Tester

By default, `--test` use `DefaultReporter` and print the result in terminal. But sometimes we need to run tests in the child process and report back to main process. Editor Framework provides two additional [reporters](https://github.com/mochajs/mocha/wiki/Third-party-reporters) for doing this.

With the `--report-failures` argument, it will report if there are any failure during the tests, then sending back the data below when test process finished:
```js
{
  channel: 'process:end',
  failures: ${failure count},
  path: ${current test path},
}
```

With the `--report-details` argument it will send every mocha test event and its data back to main process. These test events including: `start`, `end`, `suite`, `suite end`, `test`, `test end`, see [test-runner](https://github.com/fireball-x/editor-framework/blob/master/core/test-runner.js#L183-L244) for details.

### Test In Editor

You can also run tests within Editor Framework's graphical editor UI.

Go to the main menu `Developer/Run Tests` and Editor Framework will run all the tests and report the result in a panel(not implement yet). This is almost the same as Test in Terminal, except the report is output to a editor panel and you don't need a terminal for that. (Means user with release version of Fireball or Editor-Framework app can see the test report as well)


## Conclusion

Let's put all these test method together to help users better understand the pipeline.

#### Test in Terminal

`--test <file>` -> `core/test-runner.js` -> `Test.run(file)` -> results

#### Test in Editor Framework

Editor Framework -> Menu `Developer/Run Tests` -> `Test.liveRun()` -> `Editor.sendToWindow ( details )`

#### Test in Tester (Page Environment)

Package Manager -> Test Button -> `Tester._run` -> Tester's webview load ( your-test-html ) -> `sendToHost` (send back result to Tester)

#### Test in Tester (Core Environment)

Package Manager -> Test Button -> `Tester._run` -> `Editor.sendToCore( 'tester:run-test', your-test-js )` -> `child_process --test <your-test-js> --report-details` -> listen on the details -> `Editor.sendToPanel( 'tester.panel', details )`
