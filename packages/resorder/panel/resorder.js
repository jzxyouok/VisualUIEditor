(() => {
  'use strict';

  var Fs = require('fire-fs');

  var dragIdName = "NodeMoveUUID";
  
  Editor.polymerPanel('resorder', {
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



    },

    build: function ( data ) {
        console.time('tree');

        data.forEach( function ( entry ) {
            var newEL = this.newEntryRecursively(entry);
            this.$.tree.addItem( this.$.tree, newEL);
            newEL.folded = false;
        }.bind(this));

        console.timeEnd('tree');
    },

    newEntryRecursively: function ( entry ) {
        var el = this.newEntry(entry);

        if ( entry.children ) {
            entry.children.forEach( function ( childEntry ) {
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
    dblclickItem: function(e) {
        Editor.log("dblclick");
        this.clearSelectInfo();
        if(e.currentTarget.doselect) {
            e.currentTarget.doselect(e);
        }
        if(e.currentTarget.isDirectory && e.currentTarget.foldable) {
            e.currentTarget.folded = !e.currentTarget.folded;
        }
        if(!e.currentTarget.isDirectory) {
            Editor.Ipc.sendToAll("ui:open_file", {path: e.currentTarget.path});
        }
        e.stopPropagation();
        e.preventDefault();
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
      item['ondblclick'] = this.dblclickItem.bind(this);
      let _item = item;
      item['doselect'] = (e) => {
          if(_item._isSlected) {
              return;
          }
          _item.style.background = 'blue';
          _item._isSlected = true;
        //   if(e)
        //     Editor.Ipc.sendToAll("ui:select_item", {uuid : _item._uuid, ctrlKey : e.ctrlKey});
      };

      item['dounselect'] = () => {
          _item._isSlected = false;
          _item.style.removeProperty('background');
      }

      item.name = entry.name;
      item.path = entry.path;
      item.isDirectory = entry.isDirectory;
      return item;
    },

    _onOpenFloder () {
        ChangeProjectFolder();
    },

    messages: {
      'ui:project_floder_change'(event, message) {
        var files = getFileList(message.folder, function(file) {
            if(file.length > 0 && file.charAt(0) == '.') {
                return true;
            }
            if(file.indexOf("bower_components") == 0 || file.indexOf("node_modules") == 0 || file.indexOf(".") == 0) {
                return true;
            }
            return false;
        });
        this.build(files);
      },
    },

  });

})();
