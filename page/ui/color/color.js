"use strict";
! function() {
    var o = require("chroma-js");
    Editor.polymerElement({
        behaviors: [Editor.UI.PolymerFocusable],
        listeners: {
            focus: "_onFocus",
            blur: "_onBlur",
            focusin: "_onFocusIn",
            keydown: "_onKeyDown"
        },
        properties: {
            noAlpha: {
                type: Boolean,
                value: !1,
                reflectToAttribute: !0
            },
            value: {
                type: Object,
                value: function() {
                    return {
                        r: 255,
                        g: 255,
                        b: 255,
                        a: 255
                    }
                },
                notify: !0
            }
        },
        ready: function() {
            this._initFocusable(this)
        },
        _backgroundStyle: function(t, e, i) {
            return "background-color:" + o(0 | this.value.r, 0 | this.value.g, 0 | this.value.b).css("rgb") + ";"
        },
        _alphaStyle: function(o) {
            return "width:" + o / 255 * 100 + "%;"
        },
        _onColorClick: function(o) {
            o.stopPropagation(), this._colorPicker ? this._closeColorPicker() : this._openColorPicker()
        },
        _updateColorPicker: function() {
            window.requestAnimationFrame(function() {
                if (this._colorPicker) {
                    var o = document.body.getBoundingClientRect(),
                        t = this.getBoundingClientRect(),
                        e = this._colorPicker.getBoundingClientRect(),
                        i = this._colorPicker.style;
                    i.position = "fixed", i.left = t.right - e.width + "px", i.zIndex = 999, document.body.clientHeight - t.bottom <= e.height + 10 ? i.top = t.top - o.top - e.height - 10 + "px" : i.top = t.bottom - o.top + 10 + "px", this._updateColorPicker()
                }
            }.bind(this))
        },
        _openColorPicker: function() {
            Editor.UI._DomUtils.addHitGhost("cursor", "998", function() {
                this._closeColorPicker()
            }.bind(this)), this._colorPicker = document.createElement("color-picker"), this._colorPicker.noAlpha = this.noAlpha, this._colorPicker.setColor({
                r: 0 | this.value.r,
                g: 0 | this.value.g,
                b: 0 | this.value.b,
                a: 0 | this.value.a
            }), this._colorPicker.addEventListener("value-changed", function(o) {
                var t, e = o.target.value;
                t = this.value instanceof cc.Color ? new cc.Color({
                    r: e.r,
                    g: e.g,
                    b: e.b,
                    a: e.a
                }) : {
                    r: e.r,
                    g: e.g,
                    b: e.b,
                    a: e.a
                }, this.set("value", t)
            }.bind(this)), Polymer.dom(this).appendChild(this._colorPicker), this._updateColorPicker()
        },
        _closeColorPicker: function() {
            var o = this;
            this._colorPicker && (Polymer.dom(this).removeChild(this._colorPicker), this._colorPicker = null), Editor.UI._DomUtils.removeHitGhost(), this.focus(), this.async(function() {
                o.fire("end-editing")
            }, 1)
        },
        _onFocusIn: function(o) {
            this._setFocused(!0)
        },
        _onKeyDown: function(o) {
            13 === o.keyCode || 32 === o.keyCode ? (o.preventDefault(), o.stopPropagation(), this._colorPicker ? this._closeColorPicker() : this._openColorPicker()) : 27 === o.keyCode && (o.preventDefault(), o.stopPropagation(), this._colorPicker ? this._closeColorPicker() : (this.setBlur(), Editor.UI.DomUtils.focusParent(this)))
        }
    })
}();