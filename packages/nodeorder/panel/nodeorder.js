(() => {
  'use strict';

  var Fs = require('fire-fs');

  var dragIdName = "NodeMoveUUID";
  
  Editor.polymerPanel('nodeorder', {
    properties: {
      filterText: {
        type: String,
        value: '',
      },
    },

    addFunc: function(data) {

    },

    ready: function () {
      Editor.UI.DockUtils.root.draggable = false;
      this._dragprop = [];
      this._curOpMode = "center";
      this._scene = null;

    },

    build: function ( data ) {
        console.time('tree');
        this.$.tree.clear();
        if(!this._scene) {
            return;
        }

        var newEL = this.newEntryRecursively(this._scene);
        this.$.tree.addItem( this.$.tree, newEL);
        newEL.folded = false;

        console.timeEnd('tree');
    },

    newEntryRecursively: function ( entry ) {
        var el = this.newEntry(entry);
        let children = entry.getChildren();
        if ( children ) {
            children.forEach( function ( childEntry ) {
                var childEL = this.newEntryRecursively(childEntry);
                this.$.tree.addItem( el, childEL );
                childEL.folded = true;
            }.bind(this) );
        }

        return el;
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
        var data = ev.dataTransfer.getData(dragIdName);
        if(!data) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none"; // drop it like it's hot
            return;
        }
        ev.target.style.background = 'blue';
    },
    dragOver: function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        
        var data = ev.dataTransfer.getData(dragIdName);
        if(!data) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none"; // drop it like it's hot
            return;
        }
        
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot

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
    clickItem: function(e) {
        if(!e.ctrlKey) {
            this.clearSelectInfo();
        }
        if(e.currentTarget.doselect) {
            e.currentTarget.doselect(e);
        }
        e.stopPropagation();
        e.preventDefault();
    },
    clearSelectInfo: function() {
        function recursiveClearSelect(item) {
            if(item.dounselect) {
                item.dounselect();
            }
            let children = Polymer.dom(item).children;
            for ( let i = 0; i < children.length; ++i ) {
                recursiveClearSelect(children[i]);
            }
        }
        recursiveClearSelect(this.$.tree);
    },
    selectItemsByData: function(select_items) {
        this.clearSelectInfo();
        function recursiveItemSelect(item, select_items) {
            if(select_items.indexOf(item._uuid) >= 0 && item.doselect) {
                item.doselect();
            }
            let children = Polymer.dom(item).children;
            for ( let i = 0; i < children.length; ++i ) {
                recursiveItemSelect(children[i], select_items);
            }
        }
        recursiveItemSelect(this.$.tree, select_items);
    },
    getItemByUUID: function(uuid) {
        function recursiveGetItemByUUID(item, uuid) {
            if(uuid === item._uuid) {
                return item;
            }
            let children = Polymer.dom(item).children;
            for ( let i = 0; i < children.length; ++i ) {
                let selectItem = recursiveItemSelect(children[i], uuid);
                if(selectItem) {
                    return selectItem;
                }
            }
            return null;
        }
        return recursiveGetItemByUUID(this.$.tree, uuid);
    },
    sceneItemAdd: function(uuid) {
        let child = cocosGetItemByUUID(this._scene, uuid);
        if(!child) {
            return;
        }
        let parent = child.getParent();
        let parentItem = this.$.tree;
        if(parent) {
            parentItem = this.$.tree.getItemById(parent.uuid) || this.$.tree;
        }
        let item = this.newEntry(child);
        this.$.tree.addItem(parentItem, item);
    },
    sceneItemDelete: function(uuid) {
        function recursiveItemDelete(item, delete_items) {
            if(delete_items.indexOf(item._uuid) >= 0) {
                let parentItem = Polymer.dom(item).parentNode;
                Polymer.dom(parentItem).removeChild(item);
            }
        }
        recursiveItemDelete(this.$.tree, [uuid]);
    },
    tryChangeItemPosition: function(sourceItem, parentItem) {
        if (Editor.UI.PolymerUtils.isSelfOrAncient(parentItem, sourceItem)) {
            return;
        }
        let uuid = {sourceUUID : sourceItem._uuid, compareUUID : parentItem._uuid, mode : this._curOpMode};
        Editor.Ipc.sendToAll("ui:change_item_position", uuid);
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
      item['onclick'] = this.clickItem.bind(this);
      let _item = item;
      item['doselect'] = (e) => {
          if(_item._isSlected) {
              return;
          }
          _item.style.background = 'blue';
          _item._isSlected = true;
          if(e)
            Editor.Ipc.sendToAll("ui:select_item", {uuid : _item._uuid, ctrlKey : e.ctrlKey});
      };

      item['dounselect'] = () => {
          _item._isSlected = false;
          _item.style.removeProperty('background');
      }

      item.name = entry._className || "Node";
      item._uuid = entry.uuid;
      return item;
    },

    messages: {
      'ui:scene_change' ( event, message ) {
        this._scene = window.runScene;
        this.build();
      },
      'ui:select_items_change' (event, message) {
        this.selectItemsByData(message.select_items);
      },
      'ui:scene_item_add'(event, message) {
        Editor.log("ui:scene_item_add");
        this.sceneItemAdd(message.uuid);
      }
    },

  });

})();
