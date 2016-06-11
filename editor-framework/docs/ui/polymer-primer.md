Fireball and Editor Framework use [Polymer](polymer-project.org) to build the whole editor front end. This doc is for crediting Polymer as the perfect UI system solution for building a complex game editor toolset. Also we'd like to point to some core polymer documentation that will help you get start with developing app with Editor Framework.

## Why Polymer

Fireball is a single cross-platform app with a lot of panels. We evaluated CSS frameworks such as Zurb Foundation and Semantic-UI. But they are all too heavy and not precise enough for a game editing tools. We decided to build our own light weight custom element UI system, to populate panels with UI elements and components.

The UI elements we created is not just for Fireball's core editor, we'd like our users to be able to reuse Fireball's custom-elements or even build their own elements to extend the editor UI and create tools to fit their exact needs.

Currently there are several contenders in custom element domain, such as Angular, Ember and React. But they are all too heavy with MV* patterns. Polymer is the only one that keep it light and focus on UI creating.

On another important note, Fireball's UI panels are designed to be able to extend by users. We need to make sure there are no CSS pollution between core panels and user created panels. Shadow DOM technology used by Polymer is by far the best solution for our need.

Polymer utilizes the power of Custom Element, Shadow DOM and Data Binding without importing irrelevant functions. The design pattern is on the same track as Fireball. Fireball aims to use HTML5 web development technology (Elements, Styles, Data Attributes) to create the core of a powerful but flexible Editor UI system, and Polymer is the wheel we don't have to reinvent.

## Fireball UI Library and Packages Built With Polymer

- [UI-kit](https://github.com/fireball-packages/ui-kit) is the new standard Fireball UI component and widget library. It's also a builtin package of Editor Framework so any app you create with it can use these elements.
- [Editor UI](https://github.com/fireball-x/deprecated-editor-ui) is the old UI library for Fireball 0.4 and previous versions. It's deprecated but you can still take them if you want.
- Besides UI elements (widgets), we create all of our editor panels and tools (Such as scene editor, asset manager and console) as Polymer templates. Most packages from [fireball-packages](https://github.com/fireball-packages) organization are built with Polymer. Fell free to check them out and learn how to make your own!

## Get Started With Polymer

Please read the following material to learn enough Polymer for building app with Editor Framework.

- [Polymer Quick Tour](https://www.polymer-project.org/1.0/docs/start/quick-tour.html) Get familiar with the structure and pattern of Polymer custom elements.
- [Polymer Properties](https://www.polymer-project.org/1.0/docs/devguide/properties.html)
- [Styling Local DOM](https://www.polymer-project.org/1.0/docs/devguide/styling.html)
- [Events](https://www.polymer-project.org/1.0/docs/devguide/events.html)
- [Data Binding](https://www.polymer-project.org/1.0/docs/devguide/data-binding.html)

Feel free to read through polymer documentations to fully understand the technology!

## Polymer Elements

Polymer has an official elements library called [Catalog](https://elements.polymer-project.org/). You can browse through the library, see demo of elements and read their documentation.

If you'd like to use some of them in your app, simply install them with bower. And import the element's html file into your template.
