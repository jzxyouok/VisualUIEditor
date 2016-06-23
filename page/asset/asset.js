"use strict";
Editor.polymerElement({
    behaviors: [Editor.UI.PolymerFocusable, Editor.UI.Droppable],
    hostAttributes: {
        droppable: "asset",
        "single-drop": !0
    },
    listeners: {
        focus: "_onFocus",
        blur: "_onBlur",
        click: "_onClick",
        "drop-area-enter": "_onDropAreaEnter",
        "drop-area-leave": "_onDropAreaLeave",
        "drop-area-accept": "_onDropAreaAccept"
    },
    properties: {
        value: {
            type: String,
            value: null,
            notify: !0,
            observer: "_valueChanged"
        },
        type: {
            type: String,
            value: "Unknown"
        },
        highlighted: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        },
        invalid: {
            type: Boolean,
            value: !1,
            reflectToAttribute: !0
        }
    },
    ready: function() {
        this._initFocusable(this), this._initDroppable(this.$.dropArea), this._assetName = "None"
    },
    _isTypeValid: function(e) {
        return e === this.type ? !0 : cc.isChildClassOf(Editor.assets[e], Editor.assets[this.type])
    },
    _onDragOver: function(e) {
        var t = Editor.UI.DragDrop.type(e.dataTransfer);
        return "asset" !== t ? void Editor.UI.DragDrop.allowDrop(e.dataTransfer, !1) : (e.preventDefault(), e.stopPropagation(), void(this.highlighted ? this.invalid ? (Editor.UI.DragDrop.updateDropEffect(e.dataTransfer, "none"), Editor.UI.DragDrop.allowDrop(e.dataTransfer, !1)) : (Editor.UI.DragDrop.updateDropEffect(e.dataTransfer, "copy"), Editor.UI.DragDrop.allowDrop(e.dataTransfer, !0)) : (Editor.UI.DragDrop.updateDropEffect(e.dataTransfer, "none"), Editor.UI.DragDrop.allowDrop(e.dataTransfer, !1))))
    },
    _onClick: function(e) {
        e.stopPropagation(), Editor.Ipc.sendToAll("assets:hint", this.value)
    },
    _onDropAreaEnter: function(e) {
        var t = this;
        e.stopPropagation();
        var i = e.detail.dragItems;
        this._requestID && (Editor.Ipc.cancelRequest(this._requestID), this._requestID = null);
        var r = i[0];
        this.invalid = !0, this._requestID = Editor.assetdb.queryMetaInfoByUuid(r, function(e, i) {
            if (t._requestID = null, t.highlighted = !0, t._cacheUuid = r, t.invalid = !t._isTypeValid(i.assetType), t.invalid) {
                var a = JSON.parse(i.json),
                    s = Object.keys(a.subMetas);
                if (1 === s.length) {
                    var o = a.subMetas[s[0]].uuid;
                    t._requestID = Editor.assetdb.queryInfoByUuid(o, function(e, i) {
                        t._cacheUuid = o, t.invalid = !t._isTypeValid(i.type)
                    })
                }
            }
        })
    },
    _onDropAreaLeave: function(e) {
        e.stopPropagation(), this._requestID && (Editor.Ipc.cancelRequest(this._requestID), this._requestID = null), this.highlighted = !1, this.invalid = !1
    },
    _onDropAreaAccept: function(e) {
        var t = this;
        e.stopPropagation(), this._requestID && (Editor.Ipc.cancelRequest(this._requestID), this._requestID = null), this.highlighted = !1, this.invalid = !1;
        var i = this._cacheUuid;
        this.set("value", i), i || (this._assetName = "None"), this.async(function() {
            t.fire("end-editing")
        }, 1)
    },
    _assetClass: function(e) {
        return e ? "name" : "null name"
    },
    _labelLeftClass: function(e, t) {
        return this._shouldHide(e, t) ? "label" : "label left"
    },
    _labelRightClass: function(e, t) {
        return this._shouldHide(e, t) ? "label" : "label right"
    },
    _shouldHide: function(e, t) {
        return e ? "script" === t : !0
    },
    _valueChanged: function() {
        var e = this;
        return this.value ? Editor.assetdb ? void Editor.assetdb.queryUrlByUuid(this.value, function(t, i) {
            var r = require("fire-url");
            e._assetName = r.basenameNoExt(i)
        }) : void(this._assetName = "Unkown") : void(this._assetName = "None")
    },
    _onBrowseClick: function(e) {
        e.stopPropagation();
        var t = this.type;
        "script" === this.type && (t = "javascript,coffeescript"), this.fire("search-asset", this), Editor.Ipc.sendToPanel("assets", "assets:search", "t:" + t)
    },
    _onClearClick: function(e) {
        var t = this;
        e.stopPropagation(), this.set("value", ""), this.async(function() {
            t.fire("end-editing")
        }, 1)
    }
});