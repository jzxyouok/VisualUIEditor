(() => {
  'use strict';

  var Fs = require('fire-fs');

  var dragIdName = "ResMoveUUID";
  
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
      this._curSelectItem = null;
      this._curMouseOverItem = null;

      this.addEventListener("mousedown", function(e) {
          if(e.button=='2') {
              Editor.Ipc.sendToPackage('resorder', 'popup-open-file-menu', e.clientX, e.clientY);
          }
      });


    },

    build: function ( data ) {
        console.time('tree');
        this.$.tree.clear();

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
    },
    dragOver: function(ev) {
        var data = ev.dataTransfer.getData(dragIdName);
        if(!data) {
            ev.dataTransfer.effectAllowed = "none";
            ev.dataTransfer.dropEffect = "none"; // drop it like it's hot
            return;
        }
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
        ev.preventDefault();
        ev.stopPropagation();

        var rect = ev.currentTarget.getBoundingClientRect();
        let ratio = 4;
        if(!ev.currentTarget.isDirectory) {
            ratio = 2;
        }
        if (ev.clientY - rect.top < rect.height / ratio) {
            ev.target.style.background = "red";
            this._curOpMode = "top";
        } else if(rect.bottom - ev.clientY < rect.height / ratio) {
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
        let dest = parentItem.path;
        if(this._curOpMode == "top" || this._curOpMode == "bottom") {
            let parentNode = Polymer.dom(parentItem).parentNode;
            if(!parentNode || !parentNode.path) {
                return;
            }
            dest = parentNode.path;
        }
        dest = dest + "/" + sourceItem.name;

        fs.rename(sourceItem.path, dest, (function (err) {
            if(err) {
                console.error(err);
                return;
            }
            
            sourceItem.path = dest;
            if (this._curOpMode == "top") {
                this.$.tree.setItemBefore(sourceItem, parentItem);
            } else if(this._curOpMode == "bottom") {
                this.$.tree.setItemAfter(sourceItem, parentItem);
            } else {
                this.$.tree.setItemParent(sourceItem, parentItem);
            }
        }).bind(this));
    },
    dblclickItem: function(e) {
        Editor.log("dblclick");
        this.clearSelectInfo();

        if(!e.currentTarget.isDirectory) {
            if(e.currentTarget.doselect) {
                e.currentTarget.doselect(e);
            }
            Editor.Ipc.sendToAll("ui:open_file", {path: e.currentTarget.path});
        }
        e.stopPropagation();
        e.preventDefault();
    },
    clickItem: function(e) {
        if(e.currentTarget.isDirectory && e.currentTarget.foldable) {
            e.currentTarget.folded = !e.currentTarget.folded;
        } else {
            if(!e.ctrlKey) {
                this.clearSelectInfo();
            }
            if(e.currentTarget.doselect) {
                e.currentTarget.doselect(e);
            }
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

      item["onmouseover"] = (function(e) {
          this._curMouseOverItem = item;
          if(!item._isSlected) {
            _item.style.background = 'LightSkyBlue';
          }
          e.preventDefault();
          e.stopPropagation();
      }).bind(this);

      item["onmouseout"] = (function(e) {
          if(this._curMouseOverItem == item) {
              this._curMouseOverItem = null;
              if(!item._isSlected) {
                  item.style.removeProperty('background');
              }
              e.preventDefault();
              e.stopPropagation();
          }
      }).bind(this);

      item.addEventListener("end-editing", function(e) {
          item.$.input.hidden = true;
          item.$.name.hidden = false;
          if(e.detail.cancel) {
              return;
          }
          let dir = getParentDir(item.path);
          item.value = e.target.value;
          let dest = dir + "/" + item.value;
          fs.rename(item.path, dest, (function (err) {
            if(err) {
                console.error(err);
                return;
            }
            item.name = item.value;
            item.path = dest;
          }).bind(this));

          e.preventDefault();
          e.stopPropagation();
      });
        
      let _item = item;
      item['doselect'] = ((e) => {
          if(_item._isSlected) {
              return;
          }
          if(this._curSelectItem == null) {
              this._curSelectItem = _item;
          }
          _item.style.background = 'blue';
          _item._isSlected = true;
        //   if(e)
        //     Editor.Ipc.sendToAll("ui:select_item", {uuid : _item._uuid, ctrlKey : e.ctrlKey});
      }).bind(this);

      item['dounselect'] = (() => {
          if(this._curSelectItem == _item) {
              this._curSelectItem = null;
          }
          _item._isSlected = false;
          _item.style.removeProperty('background');
      }).bind(this);

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
      'ui:create_folder'(event, message) {

                Editor.log("create folder");
      },
      'ui:create_scene'(event, message) {

                Editor.log("create scene");
      },
      'ui:rename-file-or-folder'(event, message) {
          let operateItem = this._curMouseOverItem || this._curSelectItem;
           if(operateItem == null) {
               return;
           }
           operateItem.$.name.hidden = true;
           operateItem.$.input.hidden = false;
           let input = operateItem.$.input;
            setTimeout(() => {
                input.$.input.focus();
            },1);
                Editor.log("rename scene");
      },
      'ui:delete-file-or-folder'(event, message) {
          
                Editor.log("delete scene");
      },
    },

  });

})();
