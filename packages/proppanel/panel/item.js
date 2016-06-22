(() => {
  'use strict';

  Editor.polymerElement({
    properties: {
      type: {
        type: String,
        value: 'log',
        reflectToAttribute: true,
      },

      count: {
        type: Number,
        value: 0,
      },

      icon: {
        type: String,
        value: '',
      },

      name: {
        type: String,
        value: '',
      },

      showCount: {
        type: Boolean,
        value: false,
      },

      folded: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
    },

    dragStart: function(ev) {
        ev.stopPropagation();
        ev.dataTransfer.dropEffect = 'move';
        ev.dataTransfer.clearData();
        ev.dataTransfer.setData("controlType",this.name);
        ev.target.style.opacity = "0.4";
    },

    dragEnd: function(ev) {
        ev.preventDefault();
        ev.target.style.opacity = "1";
    },

    ready () {
      this['ondragstart'] = this.dragStart.bind(this);
      this['ondragend'] = this.dragEnd.bind(this);

    },

  });
})();
