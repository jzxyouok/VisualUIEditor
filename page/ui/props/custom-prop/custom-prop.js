"use strict";
Editor.polymerElement({
    behaviors: [Editor.UI.PolymerFocusable],
    listeners: {
        focus: "_onFocus",
        blur: "_onBlur",
        focusin: "_onFocusIn",
        focusout: "_onFocusOut",
        mousedown: "_onMouseDown",
        keydown: "_onKeyDown",
        "disabled-changed": "_onDisabledChanged"
    },
    properties: {
        name: {
            type: String,
            value: ""
        }
    },
    ready: function() {
        this._initFocusable(this)
    },
    attached: function() {
        for (var o = Polymer.dom(this).children, e = 0; e < o.length; ++e) {
            var n = o[e];
            void 0 !== n.disabled && (n.disabled = this.disabled)
        }
    },
    _nameText: function(o) {
        return o ? Editor.UI._DomUtils.toHumanText(o) : "(Anonymous)"
    },
    _nameClass: function(o) {
        return o ? "name flex-1" : "name anonymous flex-1"
    },
    _onFocusIn: function() {
        this._setFocused(!0)
    },
    _onFocusOut: function() {
        this._setFocused(!1)
    },
    _onMouseDown: function(o) {
        o.preventDefault(), o.stopPropagation();
        for (var e = Polymer.dom(this).children, n = 0; n < e.length; ++n) {
            var t = Editor.UI._DomUtils.getFirstFocusableChild(e[n]);
            if (t) {
                t.focus();
                break
            }
        }
    },
    _onFieldMouseDown: function(o) {
        o.stopPropagation()
    },
    _onKeyDown: function(o) {
        if (13 === o.keyCode) {
            o.preventDefault(), o.stopPropagation();
            for (var e = Polymer.dom(this).children, n = 0; n < e.length; ++n) {
                var t = Editor.UI._DomUtils.getFirstFocusableChild(e[n]);
                if (t) {
                    t.focus();
                    break
                }
            }
        }
    },
    _onDisabledChanged: function(o) {
        for (var e = Polymer.dom(this).children, n = 0; n < e.length; ++n) {
            var t = e[n];
            void 0 !== t.disabled && (t.disabled = o.detail.value)
        }
    }
});