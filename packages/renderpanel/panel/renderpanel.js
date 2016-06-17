(() => {
  'use strict';

  var Fs = require('fire-fs');

  var dragIdName = "NodeMoveUUID";
  
  Editor.polymerPanel('renderpanel', {
    properties: {
      filterText: {
        type: String,
        value: '',
      },

      zoomScale: {
        type: Number,
        value: 1,
        observer: '_zoomScaleChange'
      }
    },

    listeners: {
        'panel-resize': 'resize',
        'mousemove' : "_mouseMove",
        'mousewheel' : "_mouseWheel",
        'mousedown' : "_mouseDown",
    },

    _mouseDown : function(ev) {
        Editor.log("_mouseDown");  
    },

    _zoomScaleChange: function(newValue, location) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        Editor.log("zoomChange " + newValue);
        let isNeedFix = false;
        let preLocation = null;
        if(location) {
            isNeedFix = true;
            preLocation = this.calcSceneLocation(location.x, location.y);
        }
        let rect = gameCanvas.getBoundingClientRect();
        gameCanvas.style.zoom = "" + newValue;
        if(!isNeedFix) {
            return;
        }
        let rect1 = gameCanvas.getBoundingClientRect();
        let nowLocation = this.calcSceneLocation(location.x, location.y);
        let stepX = nowLocation.x - preLocation.x, stepY = nowLocation.y - preLocation.y;
        
        gameCanvas.style.left = parseFloat(gameCanvas.style.left)  + stepX + "px";
        gameCanvas.style.top = parseFloat(gameCanvas.style.top) + stepY + "px";

        let afterFix = this.calcSceneLocation(location.x, location.y);
    },

    _mouseWheel: function(ev) {
        Editor.log("_mouseWheel");

        this.$.zoomSlider.value = this.$.zoomSlider.value + (ev.deltaY < 0 ? 0.05 : -0.05);
        this._zoomScaleChange(this.$.zoomSlider.value, {x : ev.clientX, y : ev.clientY});

        this.updateForgeCanvas();
    },

    _mouseMove: function(ev) {
        Editor.log("_mouseMove");
        let location = this.calcSceneLocation(ev.clientX, ev.clientY);
        this.$.location.textContent = location.x + "X" + location.y;
    },

    sceneToDom: function(x, y) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let rect = gameCanvas.getBoundingClientRect();
        let ratio = this.calcGameCanvasZoom();
        y = rect.height - y;
        return {x : (rect.left + x) * ratio, y : (rect.top + y) * ratio};
    },

    calcGameCanvasZoom: function() {
        let zoom = this.$.scene.$.gameCanvas.style.zoom;
        if(zoom) {
            if(zoom.indexOf("%") >= 0) {
                return parseFloat(zoom) / 100;
            } else {
                return parseFloat(zoom);
            }
        }
        return 1
    },

    calcSceneLocation: function(x, y) {
        let gameCanvas = this.$.scene.$.gameCanvas;
        let rect = gameCanvas.getBoundingClientRect();
        let zoom = gameCanvas.style.zoom;
        let left = rect.left, top = rect.top;
        let ratio = this.calcGameCanvasZoom();
        left = left * ratio;
        top = top * ratio;
        x = (x - left) / ratio;
        y = (y - top) / ratio;
        return {x : x.toFixed(1), y : (rect.height - y).toFixed(1)};
    },

    updateForgeCanvas: function() {
        let runScene = this.$.scene.getRunScene();
        let children = runScene.getChildren();

        var ctx = this.$.scene.$.forgeCanvas.getContext('2d');

        let canvas = this.$.scene.getFabricCanvas();
        canvas.clear();

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        for(var i = 0; i < children.length; i++) {
            let child = children[i];
            let rect = child.getBoundingBoxToWorld();
            let nodeRect = this.getNodeRectToFabric(child);
            nodeRect.left -= forgeRect.left;
            nodeRect.top -= forgeRect.top;
            nodeRect.scaleX = nodeRect.scaleX || 1;
            nodeRect.scaleY = nodeRect.scaleY || 1;
            nodeRect.opacity = 0.5;
            nodeRect.fill = "red";
            nodeRect.hasRotatingPoint = true;
            var block = new fabric.Rect(nodeRect);
            block._innerItem = child;
            block._preInfo = nodeRect;
            block.hasRotatingPoint = true;
            canvas.add(block);
        }

    },

    getNodeRectToFabric: function(node) {
        let rect = this.getNodeRect(node);
        return {
            top : rect.y + rect.height / 2,
            left: rect.x + rect.width / 2,
            width: rect.width,
            height: rect.height,
        }
    },

    getNodeRect: function(node) {
        let rect = node.getBoundingBoxToWorld();
        let start = this.sceneToDom(rect.x, rect.y);
        let zoom = this.calcGameCanvasZoom();
        let height = rect.height * zoom;

        return {
            x : start.x, y : start.y - height,
            width: rect.width * zoom,
            height: height,
        }
    },

    resize: function() {
        this.$.scene.fixForgeCanvas();
        this.$.scene.initGameCanvas();
    },

    addFunc: function(data) {

    },

    ready: function () {
        this.$.zoomSlider.addEventListener('change', (event => {
            event.stopPropagation();
            this._zoomScaleChange(event.detail.value);
        }).bind(this));

        let canvas = this.$.scene.getFabricCanvas();
        canvas.on({
            'object:moving': this.canvasItemChange.bind(this),
            'object:scaling': this.canvasItemChange.bind(this),
            'object:rotating': this.canvasItemChange.bind(this),
        });
    },

    canvasItemChange: function(options) {
        Editor.log("canvasItemChange!!!!!!!!!!!");
        let child = options.target._innerItem;
        let preInfo = options.target._preInfo;
        if(!child) {
            return;
        }
        let target = options.target;
        let curInfo = {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            angle: target.getAngle(),
        };
        let ratio = this.calcGameCanvasZoom();

        if(curInfo.left != preInfo.left) {
            child.setPositionX(child.getPositionX() + (curInfo.left - preInfo.left) / ratio)
        }

        if(curInfo.top != preInfo.top) {
            child.setPositionY(child.getPositionY() - (curInfo.top - preInfo.top) / ratio)
        }

        if(curInfo.scaleX != preInfo.scaleX) {
            child.setScaleX(child.getScaleX() * (curInfo.scaleX / preInfo.scaleX))
        }

        if(curInfo.scaleY != preInfo.scaleY) {
            child.setScaleY(child.getScaleY() * (curInfo.scaleY / preInfo.scaleY))
        }
        preInfo.angle = preInfo.angle || 0;
        if(curInfo.angle != preInfo.angle) {
            child.setRotation(child.getRotation() + (curInfo.angle - preInfo.angle));
        }

        target._preInfo = curInfo;
        Editor.log("canvasItemChange!!!!!!!!!!!111111111111");
        // options.target.setCoords();
        // canvas.forEachObject(function(obj) {
        // if (obj === options.target) return;
        // obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.5 : 1);
        // });
    },

    dragStart: function(ev) {
        ev.stopPropagation();   
        ev.dataTransfer.dropEffect = 'move';
        ev.dataTransfer.setData(dragIdName,ev.target._uuid);
        ev.target.style.opacity = "0.4";
    },
    dragEnd: function(ev) {
        ev.preventDefault();
        ev.target.style.opacity = "1";
    },
    dragEnter: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        ev.target.style.background = 'blue';
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
    },
    dragOver: function(ev) {
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
        ev.preventDefault();
        ev.stopPropagation();
        var rect = ev.currentTarget.getBoundingClientRect();
        if (ev.clientY - rect.top < rect.height / 4) {
            ev.target.style.background = "red";
            this._curOpMode = "top";
        } else if(rect.bottom - ev.clientY < rect.height / 4) {
            ev.target.style.background = "yellow";
            this._curOpMode = "bottom";
        } else {
            ev.target.style.background = "blue";
            this._curOpMode = "center";
        }

        var data = ev.dataTransfer.getData(dragIdName);
        Editor.log("dragOver!!!!!!!!!!!!!!!!!!!" + ev.target._uuid + data);
    },
    dragLeave: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.target.style.removeProperty("background");
    },
    dragDrop: function(ev) {
        Editor.log("dragDrop!!!!!!!!!!!!!!!!!!!");
        ev.preventDefault();
        ev.stopPropagation();
        ev.target.style.removeProperty("background");
        
        var data = ev.dataTransfer.getData(dragIdName);
        
        var item = this.$.tree.getItemById(data);
        if (item === null || item == undefined) {
            return;
        }
        this.tryChangeItemPosition(item, ev.currentTarget);
    },

    messages: {

    },

  });

})();
