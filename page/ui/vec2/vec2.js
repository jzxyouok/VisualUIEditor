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
            notify: !0
        },
        disabled: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        },
        readonly: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        }
    }
});