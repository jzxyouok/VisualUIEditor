
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
            //load resources
            cc.LoaderScene.preload(["HelloWorld.png"], function () {
                var MyScene = _ccsg.Scene.extend({
                    ctor:function () {
                        this._super();
                        var size = cc.director.getWinSize();
                        // var sprite = cc.Sprite.create("HelloWorld.png");
                        // sprite.setPosition(size.width / 2, size.height / 2);
                        // sprite.setScale(0.8);
                        // this.addChild(sprite, 0);
                        var label = new cc.LabelTTF("Hello World", "Arial", 40);
                        label.setPosition(size.width / 2, size.height / 2);
                        label.setScale(2);
                        label.setRotation(45);
                        this.addChild(label, 1);
                    }
                });

                this.runScene = new MyScene();
                cc.director.runScene(this.runScene);
            }, this);
        }.bind(this));
        
      this.$.gameCanvas.setAttribute("left", "900");
    },

    attached: function() {
        // let rect = this.$.backgroud.getBoundingClientRect();
        let rect1 = this.$.gameCanvas.getBoundingClientRect();

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
