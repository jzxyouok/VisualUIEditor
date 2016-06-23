"use strict";
Editor.polymerElement({
    behaviors: [Editor.UI.PolymerFocusable],
    listeners: {
        focus: "_onFocus",
        blur: "_onBlur",
        focusin: "_onFocusIn",
        focusout: "_onFocusOut",
        mousedown: "_onMouseDown",
        keydown: "_onKeyDown"
    },
    properties: {
        prop: {
            value: function() {
                return {
                    path: "",
                    type: "",
                    name: "",
                    attrs: {},
                    value: null
                }
            },
            notify: !0
        },
        slidable: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        }
    },
    ready: function() {
        this._initFocusable(this)
    },
    _nameText: function(t) {
        return t ? Editor.UI._DomUtils.toHumanText(t) : "(Anonymous)"
    },
    _nameClass: function(t) {
        return t ? "name flex-1" : "name anonymous flex-1"
    },
    _onFocusIn: function() {
        this._setFocused(!0), this.$.field.editing = !0
    },
    _onFocusOut: function() {
        this._setFocused(!1), this.$.field.editing = !1
    },
    _onMouseDown: function(t) {
        var o = this;
        t.preventDefault(), t.stopPropagation();
        var e = Editor.UI._DomUtils.getFirstFocusableChild(this.$.field);
        if (e && e.focus(), this.slidable) {
            var n = this.prop.value,
                i = Number.NEGATIVE_INFINITY;
            "number" == typeof this.prop.attrs.min && (i = this.prop.attrs.min);
            var s = Number.POSITIVE_INFINITY;
            "number" == typeof this.prop.attrs.max && (s = this.prop.attrs.max), Editor.UI._DomUtils.startDrag("ew-resize", t, function(t, e, r, u, a) {
                o.set("prop.value", Editor.Math.clamp(n + u, i, s))
            }, function() {
                o.async(function() {
                    o.fire("end-editing")
                }, 1)
            })
        }
    },
    _onFieldMouseDown: function(t) {
        t.stopPropagation()
    },
    _onKeyDown: function(t) {
        if (13 === t.keyCode) {
            t.preventDefault(), t.stopPropagation();
            var o = Editor.UI._DomUtils.getFirstFocusableChild(this.$.field);
            o && o.focus()
        }
    }
});