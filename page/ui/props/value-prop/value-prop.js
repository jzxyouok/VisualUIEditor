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
        var _this = this;
        t.preventDefault(), t.stopPropagation();
        // var e = Editor.UI._DomUtils._getFirstFocusableChild(this.$.field);
        // e && e.focus();
        // if (this.slidable) {
        //     var n = this.prop.value,
        //         min = Number.NEGATIVE_INFINITY,
        //         max = Number.POSITIVE_INFINITY;
        //     "number" == typeof this.prop.attrs.min && (min = this.prop.attrs.min);
        //     "number" == typeof this.prop.attrs.max && (max = this.prop.attrs.max);
            
        //     Editor.UI._DomUtils.startDrag("ew-resize", t, function(t, e, r, u, a) {
        //         _this.set("prop.value", Editor.Math.clamp(n + u, min, max))
        //     }, function() {
        //         _this.async(function() {
        //             _this.fire("end-editing")
        //         }, 1)
        //     })
        // }
    },
    _onFieldMouseDown: function(t) {
        t.stopPropagation()
    },
    _onKeyDown: function(t) {
        if (13 === t.keyCode) {
            t.preventDefault(), t.stopPropagation();
            var o = Editor.UI._DomUtils._getFirstFocusableChild(this.$.field);
            o && o.focus()
        }
    }
});