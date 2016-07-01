
(() => {
  'use strict';

  Editor.polymerElement({
    properties: {
      enableDrag: Boolean,
    },

    listeners: {
        'panel-resize': 'resize',
    },

    resize: function() {
        this._isInitGameCanvas = false;
    },

    fixForgeCanvas: function() {
        let rect = this.getBoundingClientRect();
        let canvas = this.$.forgeCanvas;
        canvas.width = rect.width - 5;
        canvas.height = rect.height - 5;
        this.fabricCanvas.setWidth(rect.width - 5);
        this.fabricCanvas.setHeight(rect.height - 5);
    },

    initGameCanvas: function() {
        if (this._isInitGameCanvas) {
            return;
        }
        let rect = this.getBoundingClientRect();
        let canvas = this.$.gameCanvas;
        let canvasRect = canvas.getBoundingClientRect();
        canvas.style.left = (rect.width - canvasRect.width) / 2;
        canvas.style.top = (rect.height - canvasRect.height) / 2;
        this._isInitGameCanvas = true;
    },

    getRunScene: function() {
        return this.runScene;
    },

    getFabricCanvas: function() {
        return this.fabricCanvas;
    },

    ready () {
        this.fabricCanvas = new fabric.Canvas(this.$.forgeCanvas);
        this.runScene = null;
        cc.game.run({
            "debugMode"     : 1,
            "showFPS"       : false,
            "frameRate"     : 20,
            "id"            : "gameCanvas",
            "renderMode"    : 0,
            "element"       : this.$.gameCanvas,
            
        }, function() {
            // //load resources
            // cc.LoaderScene.preload(["res/grid.png"], function () {
            //     var MyScene = _ccsg.Scene.extend({
            //         ctor:function () {
            //             this._super();
            //             var size = cc.director.getWinSize();
            //             var sprite = new _ccsg.Sprite("res/grid.png");
            //             sprite.setPosition(size.width / 2, size.height / 2);
            //             sprite.uiname = "Sprite";
            //             sprite.uuid = gen_uuid();
            //             this.addChild(sprite, 0);

            //             var label = new cc.LabelTTF("Hello World0", "Arial", 40);
            //             label.setPosition(size.width / 2, size.height / 2);
            //             label.setScale(2);
            //             label.setRotation(45);
            //             label.uiname = "LabelTTF";
            //             label.uuid = gen_uuid();
            //             this.addChild(label);

            //             // var label1 = new cc.LabelTTF("Hello World", "Arial", 40);
            //             // label1.setPosition(size.width / 3, size.height / 3);
            //             // label1.setScale(0.5);
            //             // label1.setRotation(45);
            //             // label1.uiname = "LabelTTF";
            //             // label1.uuid = gen_uuid();
            //             // this.addChild(label1);

            //             var node = new _ccsg.Node();
            //             node.setPosition(size.width / 4, size.height / 4);
            //             node.setScale(0.5);
            //             node.uiname = "Node";
            //             node.uuid = gen_uuid();
            //             this.addChild(node);

            //             {
            //                 var label = new cc.LabelTTF("Hello World1", "Arial", 40);
            //                 label.setPosition(50, 50);
            //                 label.setScale(2);
            //                 label.setRotation(45);
            //                 label.uiname = "LabelTTF";
            //                 label.uuid = gen_uuid();
            //                 node.addChild(label);

            //                 var label1 = new cc.LabelTTF("Hello World2", "Arial", 40);
            //                 label1.setPosition(10, 10);
            //                 label1.setScale(0.5);
            //                 label1.setRotation(45);
            //                 label1.uiname = "LabelTTF";
            //                 label1.uuid = gen_uuid();
            //                 node.addChild(label1);
            //             }
            //         }
            //     });

            //     this.runScene = new MyScene();
            //     this.runScene.uiname = "Scene";
            //     window.runScene = this.runScene;
            //     cc.director.runScene(this.runScene);
            //     Editor.Ipc.sendToAll('ui:scene_change', {});
            // }, this);
        }.bind(this));


    },

    attached: function() {
    },


    created: function() {
        
    },

    messages: {
        'editor:panel-resize' (event, messages) {
            Editor.log("editor:panel-resize!!!!!!!!!!!!!!!!!!");
        }
    },
    
  });

})();
