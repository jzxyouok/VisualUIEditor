"use strict";
Editor.polymerElement({
    properties: {
        info: {
            type: String,
            value: "Unknown"
        },
        path: {
            type: String,
            value: "",
            observer: "_pathChanged"
        },
        mtime: {
            type: Number,
            value: 0
        }
    },
    _getSize: function() {
        return {
            width: this._image.width, 
            height: this._image.height,
        }
    },
    _pathChanged: function() {
        if(!this.path) {
            return;
        }
        var t = this;
        this._image = new Image;
        this._image.onload = function() {
            var i = t._getSize();
            t.info = i.width + " x " + i.height, t.resize()
        };
        this._image.src = this.path;

    },
    resize: function() {
        var t = this.$.content.getBoundingClientRect(),
            i = this._getSize(),
            e = Editor.Utils.fitSize(i.width, i.height, t.width, t.height);
        
        this.$.canvas.width = Math.ceil(e[0]);
        this.$.canvas.height = Math.ceil(e[1]);
        this.repaint();
    },
    repaint: function() {
        var t = this;
        var i = this.$.canvas.getContext("2d");
        i.imageSmoothingEnabled = false;

        var e = this.$.canvas.width,
            h = this.$.canvas.height;
        i.drawImage(this._image, 0, 0, e, h);
    }
});