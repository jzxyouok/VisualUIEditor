"use strict";
Editor.polymerElement({
    properties: {
        path: {
            type: String,
            value: ""
        },
        type: {
            type: String,
            value: "",
            observer: "_typeChanged"
        },
        attrs: {
            type: Object,
            value: function() {
                return {}
            },
            observer: "_attrsChanged"
        },
        value: {
            value: null,
            notify: !0,
            observer: "_valueChanged"
        },
        slidable: {
            type: Boolean,
            value: !1,
            notify: !0
        },
        disabled: {
            type: Boolean,
            value: !1,
            notify: !0,
            reflectToAttribute: !0,
            observer: "_disabledChanged"
        },
        editing: {
            value: null,
            notify: !0,
            reflectToAttribute: !0
        }
    },
    factoryImpl: function(t, e) {
        this.value = t, this.attrs = e
    },
    ready: function() {
        this.rebuild()
    },
    rebuild: function() {
        var t = this;
        this.debounce("rebuild", function() {
            t._rebuild()
        }, 50)
    },
    _isExpectedValue: function(t) {
        if (void 0 === t || void 0 === this.attrs["default"]) return !0;
        var e = typeof t,
            r = typeof this.attrs["default"];
        return e === r
    },
    _isExpectedType: function(t) {
        var e = this.attrs.type;
        return e ? t === e ? !0 : this.attrs["extends"] && -1 !== this.attrs["extends"].indexOf(e) ? !0 : "Number" === t && ("Enum" === e || "Float" === e || "Integer" === e) : !0
    },
    _rebuild: function() {
        if ("Object" !== this.type && "Array" !== this.type) {
            var t = Polymer.dom(this),
                e = void 0;
            t.firstChild && t.removeChild(t.firstChild);
            let child = document.createElement('editor-unit-input');
            child.value = "1";
            this.set('slidable', true);
            t.appendChild(child);

            // if (void 0 !== this.attrs && void 0 !== this.type) {
            //     null !== this.value && void 0 !== this.value || (e = "null-or-undefined"), "error-unknown" === this.type && (e = "error-unknown"), this.attrs["extends"] && -1 !== this.attrs["extends"].indexOf("cc.Component") && (e = "cc.Component"), e || (this.attrs.type ? e = this.attrs.type : this.type ? e = this.type : (e = typeof this.value, e = e.charAt(0).toUpperCase() + e.slice(1)));
            //     var r = void 0;
            //     if ("error-unknown" === e && (r = Editor.properties.error("Unknown Type")), !r && null !== this.value && void 0 !== this.value) {
            //         var i = this.type;
            //         i || (i = typeof this.value, i = i.charAt(0).toUpperCase() + i.slice(1)), this._isExpectedType(i) && this._isExpectedValue(this.value) || (Editor.error("Failed to create field " + i + ". type not the same " + i + ":" + this.attrs.type), r = Editor.properties.error("Error: type not the same", !0, this.path, this.attrs.type))
            //     }
            //     var s = void 0;
            //     if (r || (s = Editor.properties[e], s || (Editor.error("Failed to create field " + e + "."), r = Editor.properties.error("Error: type '" + e + "' not found"))), !r) try {
            //         r = s(this, {
            //             value: this.value,
            //             attrs: this.attrs,
            //             type: e,
            //             path: this.path
            //         }), r.readonly = this.attrs.readonly, r.disabled = this.disabled
            //     } catch (o) {
            //         Editor.error("Failed to create field " + e + ". Message: " + o.stack), r = Editor.properties.error("Error: type '" + e + "' create failed")
            //     }
            //     "Number" !== e && "Float" !== e && "Integer" !== e || this.set("slidable", !0), t.appendChild(r)
            // }
        }
    },
    _valueChanged: function(t, e) {
        return null !== e && void 0 !== e || null === t || void 0 === t ? typeof t != typeof e ? void this.rebuild() : void 0 : void this.rebuild()
    },
    _attrsChanged: function() {
        this.rebuild()
    },
    _typeChanged: function() {
        this.rebuild()
    },
    _disabledChanged: function(t) {
        var e = Polymer.dom(this);
        e.firstChild && (e.firstChild.disabled = t)
    }
});