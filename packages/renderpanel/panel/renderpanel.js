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

    isCollection: function(rectSrc, rectDest) {
        return !(   rectSrc.left + rectSrc.width < rectDest.left ||
                    rectDest.left + rectDest.width < rectSrc.left ||
                    rectSrc.top + rectSrc.height < rectDest.top || 
                    rectDest.top + rectDest.height < rectSrc.top );
    },

    addNodeControl: function(node) {
        let canvas = this.$.scene.getFabricCanvas();

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        let nodeRect = this.getNodeWorldRectToFabric(node);
        nodeRect.left -= forgeRect.left;
        nodeRect.top -= forgeRect.top;
        nodeRect.scaleX = nodeRect.scaleX || 1;
        nodeRect.scaleY = nodeRect.scaleY || 1;
        nodeRect.opacity = 0.5;
        nodeRect.fill = "red";
        nodeRect.hasRotatingPoint = true;
        var block = new fabric.Rect(nodeRect);
        block._innerItem = node;
        block._preInfo = nodeRect;
        block.hasRotatingPoint = true;
        canvas.add(block);
        return true;
    },

    recursiveAddChild: function(node, rect, isClick) {
        let canvas = this.$.scene.getFabricCanvas();

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        let nodeRect = this.getNodeWorldRectToFabric(node);
        nodeRect.left -= forgeRect.left;
        nodeRect.top -= forgeRect.top;
        let isCollect = this.isCollection(nodeRect, rect);

        if(isCollect) {
            this.addNodeControl(node);
            return true;
        }

        var children = node.getChildren();
        for(var i = 0; i < children.length; i++) {
            let isSuccessAdd = this.recursiveAddChild(children[i], rect, isClick);
            if(isClick && isSuccessAdd) {
                return true;
            }
        }

        return false;
    },

    updateForgeCanvas: function() {
        // let runScene = this.$.scene.getRunScene();
        // let children = runScene.getChildren();

        // var ctx = this.$.scene.$.forgeCanvas.getContext('2d');

        // let canvas = this.$.scene.getFabricCanvas();
        // canvas.clear();

        // let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();
        // children.forEach(function(element) {
        //     this.recursiveAddChild(element);
        // }, this);

    },

    isBaseType: function(node) {

    },

    getNodeWorldRectToFabric: function(node) {
        let rect = this.getWorldNodeRect(node);
        return {
            top : rect.y,
            left: rect.x,
            width: rect.width,
            height: rect.height,
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

    getWorldNodeRect: function(node) {
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

    getNodeRect: function(node) {
        let rect = node.getBoundingBox();
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
            'selection:preselect': this.preSelectorRect.bind(this),
            'mouseup:touchnull': this.mouseupTouchnull.bind(this),
        });

        // Editor.Ipc.sendToAll('ui:renderer-scene_change', "change!!!!!!!!!!!!!!");
        let scene = this.$.scene.getRunScene();
    },

    mouseupTouchnull: function(e) {
        let canvas = this.$.scene.getFabricCanvas();
        canvas.clear();

        this.preSelectorRect({selector: {
            ex : e.offsetX,
            ey : e.offsetY,
            left: 0,
            top: 0,
        }});

    },

    preSelectorRect: function(object) {
        let rect = object.selector;
        let left = Math.min(rect.ex, rect.ex + rect.left);
        let top = Math.min(rect.ey, rect.ey + rect.top);
        let isClick = rect.left == 0 && rect.top == 0;
        let width = Math.abs(rect.left), height = Math.abs(rect.top);
        
        rect = {left:left, top:top, width: width, height: height};

        let runScene = this.$.scene.getRunScene();
        let children = runScene.getChildren();

        let canvas = this.$.scene.getFabricCanvas();
        canvas.clear();

        let forgeRect = this.$.scene.$.forgeCanvas.getBoundingClientRect();

        for(var i = 0; i < children.length; i++) {
            let isSuccessAdd = this.recursiveAddChild(children[i], rect, isClick);
            if(isClick && isSuccessAdd) {
                return true;
            }
        }

        let objects = canvas.getObjects();
        let select_items = [];
        for(var i = 0; i < objects.length; i++) {
            let uuid = objects[i]._innerItem.uuid;
            if(uuid) 
                select_items.push(uuid);
        }

        Editor.Ipc.sendToAll("ui:select_items_change", {select_items : select_items});
        Editor.log("extPreSelector!!!!!!!!!!!!!!!!!");
    },

    canvasTargetChange: function(target, group) {
       let child = target._innerItem;
        let preInfo = target._preInfo;
        if(!child) {
            return;
        }
        let curInfo = {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            angle: target.getAngle(),
        };
        if(group) {
            curInfo.left = group.left + group.width / 2 + target.left;
            curInfo.top = group.top + group.height / 2 + target.top;
        }
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
        // curInfo.left -= group.left || 0;
        // curInfo.top -= group.top || 0;
        target._preInfo = curInfo;
        Editor.log("canvasItemChange!!!!!!!!!!!111111111111");
    },

    canvasItemChange: function(options) {
        Editor.log("canvasItemChange!!!!!!!!!!!");
        if (options.target._objects) {
            options.target._objects.forEach(function(target) {
                this.canvasTargetChange(target, options.target)
            }, this);
        }
        this.canvasTargetChange(options.target);
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

    getItemByUUID: function(uuid) {
        function recursiveGetChild(node, uuid) {
            if (node.uuid == uuid) {
                return node;
            }
            var children = node.getChildren();
            for(var i = 0; i < children.length; i++) {
                let subNode = recursiveGetChild(children[i], uuid);
                if(subNode) {
                    return subNode;
                }
            }
            return null;
        }
        return recursiveGetChild(this.$.scene.getRunScene(), uuid);
    },

    insertItemBefore: function(sourceNode, compareNode) {
        let compareParent = compareNode.getParent();
        if(!compareParent) {
            return;
        }
        sourceNode.removeFromParent(false);
        let afterNode = [];
        let children = compareParent.getChildren();
        let index = children.indexOf(compareNode);
        for(var i = index; i < children.length; i++) {
            afterNode.push(children[i]);
        }
        for(var i = index; i < children.length; i++) {
            children[i].removeFromParent(false);
        }
        compareParent.addChild(sourceNode);
        for(var i = 0; i < afterNode.length; i++) {
            compareParent.addChild(afterNode[i]);
        }
    },

    insertItemAfter: function(sourceNode, compareNode) {
        let compareParent = compareNode.getParent();
        if(!compareParent) {
            return;
        }
        sourceNode.removeFromParent(false);
        let afterNode = [];
        let children = compareParent.getChildren();
        let index = children.indexOf(compareNode);
        for(var i = index + 1; i < children.length; i++) {
            afterNode.push(children[i]);
        }
        for(var i = index + 1; i < children.length; i++) {
            children[i].removeFromParent(false);
        }

        compareParent.addChild(sourceNode);
        for(var i = 0; i < afterNode.length; i++) {
            compareParent.addChild(afterNode[i]);
        }
    },

    changeItemPosition : function(sourceUUID, compareUUID, mode) {
        let sourceNode = this.getItemByUUID(sourceUUID);
        let compareNode = this.getItemByUUID(compareUUID);
        if(!sourceNode || !compareNode || isSelfOrAncient(compareNode, sourceNode)) {
            return;
        }

        if(mode == "top") {
            this.insertItemBefore(sourceNode, compareNode);
        } else if(mode == "bottom") {
            this.insertItemAfter(sourceNode, compareNode);
        } else {
            sourceNode.removeFromParent(false);
            compareNode.addChild(sourceNode);
        }
    },

    changeItemSelect: function(info) {
        let sourceNode = this.getItemByUUID(info.uuid);
        if(!sourceNode) {
            return;
        }
        if(!info.ctrlKey) {
            this.$.scene.getFabricCanvas().clear();
        }
        this.addNodeControl(sourceNode);
    },

    messages: {
        "ui:change_item_position" (event, message) {
            this.changeItemPosition(message.sourceUUID, message.compareUUID, message.mode);
        },
        "ui:select_item" (event, message) {
            this.changeItemSelect(message);
        },
    },

  });

})();
