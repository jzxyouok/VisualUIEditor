"use strict";
Editor.polymerElement({
    behaviors: [Editor.UI.PolymerFocusable],
    hostAttributes: {
        droppable: "asset",
        "single-drop": true
    },
    listeners: {
        focus: "_onFocus",
        blur: "_onBlur",
        click: "_onClick",
        "dragover": "_onDropAreaOver",
        "drop": "_onDropAreaAccept"
    },
    properties: {
        value: {
            type: String,
            value: null,
            notify: true,
            observer: "_valueChanged"
        },
        type: {
            type: String,
            value: "Unknown"
        },
        path: {
            type: String,
            value: "Unknown"
        },
        highlighted: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        invalid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        }
    },
    ready: function() {
        this._initFocusable(this);
        this._assetName = "None";
    },

    _onClick: function(e) {
        e.stopPropagation(), Editor.Ipc.sendToAll("assets:hint", this.value)
    },
    _onDropAreaOver: function(ev) {
        var data = ev.dataTransfer.getData("asset");
        if(!data) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none"; 
            return;
        }
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; 

        ev.preventDefault();
        ev.stopPropagation();
    },
    _onDropAreaAccept: function(ev) {
        var data = ev.dataTransfer.getData("asset");
        if(!data) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();

        let subPath = calcRelativePath(window.projectFolder + "/", data);
        this.set("value", subPath);
        this.async(() => {
            this.fire('end-editing');
        }, 1);
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
        return e ? "script" === t : true
    },
    _valueChanged: function() {
        this._assetName = this.value;
    },
    _onBrowseClick: function(e) {
        e.stopPropagation();
    },
    _onClearClick: function(e) {
        e.stopPropagation();
        this.set("value", "");
        this.async(() => {
            this.fire("end-editing")
        }, 1)
    }
});