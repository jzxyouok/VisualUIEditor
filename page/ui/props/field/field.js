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
            let element_name = "editor-unit-input"
            if(this.type == "vec2") {
                element_name = "fire-vec2";
            } else if(this.type == "size") {
                element_name = "fire-size";
            } else if(this.type == "color") {
                element_name = "fire-color";
            } else if(this.type == "select") {
                element_name = "editor-select";
            } else if(this.type == "check") {
                element_name = "editor-checkbox";
            } else if(this.type == "string") {
                element_name = "editor-input";
            } else if(this.type == "text") {
                element_name = "editor-textarea";
            } else if(this.type == "slider") {
                element_name = "editor-slider";
            } else if(this.type == "fire-asset") {
                element_name = "fire-asset";
            }
            let child = t.firstChild;
            let isRecreate = false;
            if(!t.firstChild || t.firstChild.localName != element_name) {
                child = document.createElement(element_name);
                isRecreate = true;
            }
            t.firstChild && t.removeChild(t.firstChild);    
            child.value = this.value;
            child.attrs = this.attrs;
            child.path = this.path;
            if(isRecreate) {
                if(this.type == "select") {
                    let selects = this.attrs.selects || {};
                    for(var k in selects) {
                        child.add(k, selects[k]);
                    }
                    child.text = selects[this.value];
                }
            }

            if(this.attrs.expand) {
                this.attrs.expand = null;
                for(var k in this.attrs) {
                    child[k] = this.attrs[k];
                }
            }

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