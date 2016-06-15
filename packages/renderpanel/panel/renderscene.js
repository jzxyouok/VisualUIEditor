(() => {
  'use strict';

  Editor.polymerElement({
    properties: {
      enableDrag: Boolean,
    },

    ready () {
      this._id2el = {};
      this._activeElement = null;
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
                        this.addChild(label, 1);
                    }
                });
                
                cc.director.runScene(new MyScene());
            }, this);
        });
    },


    created: function() {
    },

    // messages: {
    // },
    
  });

})();
