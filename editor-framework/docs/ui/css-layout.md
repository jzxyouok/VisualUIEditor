When creating new editor window or package panel, we recommend using flexbox to layout your web page.

Editor Framework already has polymer's [iron-flex-layout](https://github.com/PolymerElements/iron-flex-layout) installed, with the CSS classes and properties it provides, we can easily create any layouts you want that conform to CSS3 standard.

## Flexbox Basics

To learn everything you need to know about flexbox, read through the following one page guide:

- [CSS-Tricks: A Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

## Iron-Flex-Layout

With the help of [iron-flex-layout](https://github.com/PolymerElements/iron-flex-layout), you don't have to write combination of flexbox related css properties one by one. It provides two ways of adding flexbox properties to your page element:

### Custom-style Mixin Layout

This method use css mixin to add properties to your existing css selectors.

First checkout [iron-flex-layout Custom-style](https://github.com/PolymerElements/iron-flex-layout/blob/master/iron-flex-layout.html).

You can see it includes almost every possible flexbox layout and item setup. To apply these settings to your own css:

```html
<div id="view">
  <div id="nav-bar" />
  <div id="scene" />
  <div id="status-bar" />
</div>

<style>
  #view {
    @apply(--layout-fit);
    @apply(--layout-vertical);
  }
  #nav-bar {
    @apply(--layout-horizontal);
  }
  #status-bar {
    @apply(--layout-horizontal);
  }
  #scene {
    @apply(--layout-flex-1);
  }
</style>
```

To learn more about how mixin works in Editor Framework, check out polymer docs [Custom CSS Mixins](https://www.polymer-project.org/1.0/docs/devguide/styling.html#custom-css-mixins).

### Class Layout

By adding CSS classes defined in [iron-flex-layout Classes](https://github.com/PolymerElements/iron-flex-layout/blob/master/classes/iron-flex-layout.html) to your element, they will be equipped with flexbox properties.

The same example above will now looks like:

```html
<div id="view" class="layout vertical fit">
  <div id="nav-bar" class="layout horizontal" />
  <div id="scene" class="flex-1" />
  <div id="status-bar" class="layout horizontal" />
</div>
```

### When to Use What

In general you can use any of both layout methods as you like. But there are some basic principle:

- If you are dynamically adding items/elements to your DOM, and want to apply layout to the element, it is recommended to use class layout, cause custom-style layout do not have effect on dynamic added elements, which explained here (https://www.polymer-project.org/1.0/docs/devguide/styling.html#style-api).
- If you want to use iron-flex-layout for host item, the only way to do this is use custom style:
    ```css
    :host {
      @apply(--layout-fit)
    }
    ```

## Import Iron-Flex-Layout

By default, Editor Framework install `iron-flex-layout` at `bower_components/iron-flex-layout`.

You can import both or either of layout methods in your web page html:

```html
<!-- Custom-style Layout -->
<link rel="import" href="app://bower_components/iron-flex-layout/iron-flex-layout.html">
<!-- Class Layout -->
<link rel="import" href="app://bower_components/iron-flex-layout/classes/iron-flex-layout.html">
```

You can also import Editor Framework's [lite.html](https://github.com/fireball-x/editor-framework/blob/master/page/ui/lite.html) environment with standard editor page dependencies.

## CSS Layout Tricks

Here we gathered CSS layout tricks that's helpful when developing web page with Editor Framework:

- [A Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Centering in CSS: A Complete Guide](https://css-tricks.com/centering-css-complete-guide/)
