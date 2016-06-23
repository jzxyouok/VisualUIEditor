"use strict";
Editor.polymerElement({
    behaviors: [Editor.UI.PolymerFocusable],
    listeners: {
        "disabled-changed": "_onDisabledChanged"
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
        folded: {
            type: Boolean,
            value: !0
        }
    },
    ready: function() {
        this._initFocusable(this.$.focus)
    },
    _nameText: function(e) {
        return e ? Editor.UI.DomUtils.toHumanText(e) : "(Anonymous)"
    },
    _nameClass: function(e) {
        return e ? "name flex-1" : "name anonymous flex-1"
    },
    _onKeyDown: function(e) {
        13 === e.keyCode || 32 === e.keyCode ? (e.preventDefault(), e.stopPropagation(), this.folded = !this.folded) : 37 === e.keyCode ? (e.preventDefault(), e.stopPropagation(), this.folded = !0) : 39 === e.keyCode && (e.preventDefault(), e.stopPropagation(), this.folded = !1)
    },
    _onFoldClick: function(e) {
        e.stopPropagation(), 1 === e.which && (this.folded = !this.folded)
    },
    _onDisabledChanged: function() {},
    _foldClass: function(e) {
        return e ? "fa fa-caret-right fold flex-none" : "fa fa-caret-down fold flex-none"
    }
});