"use strict";
Editor.polymerElement({
    properties: {
        value: {
            type: Object,
            value: function() {
                return {
                    x: 0,
                    y: 0
                }
            },
            notify: true
        },
        disabled: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        readonly: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        }
    }
});