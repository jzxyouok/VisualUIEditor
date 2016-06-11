Panel is the dockable "mini-windows" unit in Editor Framework. Each panel contains a panel frame.

You can define a polymer element as your panel frame, and register it in `package.json`. The Editor Framework will dynamically load your polymer element when the panel is opened.

To define a panel frame, just create a javascript file like this:

```javascript
Editor.Panel.extend({
  style: `
    h1 {
      color: #09f;
    }
  `,

  template: `
    <h1>This is a simple panel</h1>
  `,

  ready () {
  },
});
```

Then save it to your package's `panel` field. After that register the html file in `package.json`:

```json
{
  "name": "simple",
  "panel": {
    "main": "panel/panel.js",
    "type": "dockable",
    "title": "Simple",
    "width": 800,
    "height": 600
  }
}
```

Once your package is loaded, you can use `Editor.Panel.open('simple')` to open your panel.

## Panel ID

A panelID is a string equals to `{package-name}.{sub-name}`. It is used in most of the functions in `Editor.Panel` that needs to operate on a specific panel.

Suppose we have the following `package.json` file:

```json
{
  "name": "foo",
  "panel": {
    "frame": "panel/simple.html"
  },
  "panel.02": {
    "frame": "panel/simple.html"
  }
}
```

The file registers two panels `panel` and `panel.02`, so that we will have two panelID which are `foo` and `foo.02`.

## Register Template

TODO:

## Register Style

TODO:

## Register Behaviors

TODO:

## Register Selectors ($)

TODO:

## Register Ipc Messages

TODO:

## Register Shortcuts

TODO:

## Register Profiles

TODO:
