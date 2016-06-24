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
            let element_name = "editor-unit-input"
            if(this.type == "vec2") {
                element_name = "fire-vec2";
            } else if(this.type == "size") {
                element_name = "fire-size";
            }

            let child = document.createElement(element_name);
            child.value = this.value;
            child.attrs = this.attrs;
            child.path = this.path;
            t.appendChild(child);

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