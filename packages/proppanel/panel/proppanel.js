(() => {
  'use strict';

  var Fs = require('fire-fs');

  var dragIdName = "NodeMoveUUID";
  
  Editor.polymerPanel('proppanel', {
    properties: {
      filterText: {
        type: String,
        value: '',
      },
    },

    show_items: [
        {icon:"res/grid.png", name:"Sprite"},
        {icon:"res/grid.png", name:"LabelTTF"},
        {icon:"res/grid.png", name:"Sprite"},
    ],

    _getItems: function() {
        return this.show_items;
    },

    addFunc: function(data) {

    },

    ready: function () {
        this._scene = null;
        this._opnode = null;

        this.addEventListener("end-editing", function(e) {
            if(e.detail.cancel) {
                return;
            }
            let path = e.target.path, value = e.target.value;
            if(!path) {
                return;
            }
            this._opnode.setAttrib(path, value);
        });
        // var sprite = document.createElement('cc-sprite-inspector');
        // let subNode = this.$.node.$.addCompBtn;
        // let subParent = Polymer.dom(subNode).parentNode;
        // this.$.node.appendChild(sprite);
        // this.$.node.insertBefore(sprite, subParent);
        // let nodeItem = Polymer.dom(this.$.node);
        // nodeItem.appendChild(sprite);

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
    tryChangeItemPosition: function(sourceItem, parentItem) {
        if (Editor.UI.PolymerUtils.isSelfOrAncient(parentItem, sourceItem)) {
            return;
        }
        if (this._curOpMode == "top") {
            this.$.tree.setItemBefore(sourceItem, parentItem);
        } else if(this._curOpMode == "bottom") {
            this.$.tree.setItemAfter(sourceItem, parentItem);
        } else {
            this.$.tree.setItemParent(sourceItem, parentItem);
        }
    },  
    newEntry: function (entry) {
      var item = document.createElement('td-tree-item');
      item.draggable = true;
      item['ondragstart'] = this.dragStart.bind(this);
      item['ondragend'] = this.dragEnd.bind(this);
      item['ondragenter'] = this.dragEnter.bind(this);
      item['ondragover'] = this.dragOver.bind(this);
      item['ondragleave'] = this.dragLeave.bind(this);
      item['ondrop'] = this.dragDrop.bind(this);
      item.name = entry.name;
      item.path = entry.path;
      return item;
    },

    messages: {
      'ui:scene_change' ( event, message ) {
        Editor.log("ui:scene_change");
        this._scene = window.runScene;
        this._opnode = new NodeData(this._scene);
        this.$.node.target = this._opnode;
      },
      'ui:item_prop_change'(event, message) {
          if(this._opnode && this._opnode.uuid == message.uuid) {
            //   initNodeData(this._opnode);
            if(this._propUpdateTimeId) {
                return;
            }
            this._propUpdateTimeId = setTimeout((() => {
                if(this._opnode) {
                    this._opnode = new NodeData(this._opnode._node);
                    this.$.node.target = this._opnode;
                }
                this._propUpdateTimeId = null;
            }).bind(this), 200);
          }
      },
      'ui:select_items_change' (event, message) {
        let node = cocosGetItemByUUID(this._scene, message.select_items[0]);
        if(node == null) {
            node = this._scene;
        }
        this._opnode = new NodeData(node);
        this.$.node.target = this._opnode;
        // this.$.node.target = new NodeData(node);
        // this.selectItemsByData(message.select_items);
      }
    },

  });

})();
