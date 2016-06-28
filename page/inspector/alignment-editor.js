"use strict";
Editor.polymerElement({
    properties: {
        target: {
            type: Object,
            value: null,
            notify: !0
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
            n.value !== this.target[e].value && this.set("target." + e + ".value", n.value), n.isAbsolute !== this.target[i].value && this.set("target." + i + ".value", n.isAbsolute)
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
        e.value && this.target && this.target.isAlignHorizontalCenter.value && this.set("target.isAlignHorizontalCenter.value", !1)
    },
    _onTopBottomChecked: function(t, e) {
        e.value && this.target && this.target.isAlignVerticalCenter.value && this.set("target.isAlignVerticalCenter.value", !1)
    },
    _onHorizontalCenterChecked: function(t, e) {
        e.value && this.target && (this.target.isAlignLeft.value || this.target.isAlignRight.value) && (this.set("target.isAlignLeft.value", !1), this.set("target.isAlignRight.value", !1))
    },
    _onVerticalCenterChecked: function(t, e) {
        e.value && this.target && (this.target.isAlignTop.value || this.target.isAlignBottom.value) && (this.set("target.isAlignTop.value", !1), this.set("target.isAlignBottom.value", !1))
    }
});