"use strict";
Editor.polymerElement({
    properties: {
        value: {
            type: Object,
            value: {},
            notify: true
        }
    },
    _is: function(t) {
        return !!t
    },
    _compose: function(t, e) {
        t = t || 0, e || (t *= 100);
        var i = e ? "px" : "%";
        return "" + t.toFixed(2) + i
    },
    _decompose: function(t) {
        var e;
        return t.endsWith("%") || t.endsWith("％") ? (t = t.slice(0, -1), e = !1) : (t.endsWith("px") && (t = t.slice(0, -2)), e = !0), t = "" === t ? 0 : parseFloat(t), e || (t /= 100), {
            value: t,
            isAbsolute: e
        }
    },
    _changeMargin: function(t, e, i) {
        if (this.target) {
            var n = this._decompose(t);
            if (isNaN(n.value)) return Editor.warn('Invalid input: "%s"', t), !1;
            n.value !== this.target[e].value && this.set("value." + e + ".value", n.value), n.isAbsolute !== this.target[i].value && this.set("value." + i + ".value", n.isAbsolute)
        }
        return !0
    },
    _onTopChanged: function(t, e) {
        this._changeMargin(e.value, "top", "isAbsoluteTop")
    },
    _onLeftChanged: function(t, e) {
        this._changeMargin(e.value, "left", "isAbsoluteLeft")
    },
    _onRightChanged: function(t, e) {
        this._changeMargin(e.value, "right", "isAbsoluteRight")
    },
    _onBottomChanged: function(t, e) {
        this._changeMargin(e.value, "bottom", "isAbsoluteBottom")
    },
    _onLeftRightChecked: function(t, e) {
        this.set("value.isAlignHorizontalCenter", false)
    },
    _onTopBottomChecked: function(t, e) {
        this.set("value.isAlignVerticalCenter", false)
    },
    _onHorizontalCenterChecked: function(t, e) {
        if(e.value) {
            this.set("value.isAlignLeft", false);
            this.set("value.isAlignRight", false);
        }
    },
    _onVerticalCenterChecked: function(t, e) {
        if(e.value) {
            this.set("value.isAlignTop", false);
            this.set("value.isAlignBottom", false);
        }
    }
});