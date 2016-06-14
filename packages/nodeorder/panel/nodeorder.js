(() => {
  'use strict';

  var Fs = require('fire-fs');
  
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
      this._addLogTimeoutID = null;
      this._logsToAdd = [];

      Editor.log("ffffffffffffffffffffffffff");
      print_func(this.$.tree);
      Editor.log("kkkkkkkkkkkkkkkkkkkkkkkkkk");
      // var childItem = document.createElement('td-tree-item');
      // childItem.name = "mytest";
      // this.$.tree.shift();
      // this.$.tree.addItem(this.$.tree, childItem);
      var path = Editor.url('packages://ui-tree/test/fixtures/zed-tree.json');
      Fs.readFile( path, function ( err, data ) {
          if ( !err ) {
              var data = JSON.parse(data);
              this.build(data);
          }
      }.bind(this));
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
        print_func(ev);
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'link';
        ev.dataTransfer.setData("Text",ev.target._uuid);
        ev.target.style.opacity = "0.4";
        Editor.log("sssssssssssssss" + ev.target._uuid);
    },
    dragEnd: function(ev) {
        ev.preventDefault();
        ev.target.style.opacity = "1";
    },
    dragEnter: function(ev) {
        ev.preventDefault();
        // ev.stopPropagation();
        ev.target.style.background = 'blue';
        ev.target.classList.add('over');
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
    },
    dragOver: function(ev) {
        ev.dataTransfer.effectAllowed = "all";
        ev.dataTransfer.dropEffect = "all"; // drop it like it's hot
        ev.preventDefault();
        // ev.stopPropagation();
        var data = ev.dataTransfer.getData("Text");
        Editor.log("dragOver!!!!!!!!!!!!!!!!!!!" + ev.target._uuid + data);
    },
    dragLeave: function(ev) {
        ev.preventDefault();
        // ev.stopPropagation();
        ev.target.style.removeProperty("background");
    },
    dragDrop: function(ev) {
        Editor.log("dragDrop!!!!!!!!!!!!!!!!!!!");
        ev.preventDefault();
        ev.stopPropagation();
        ev.target.style.opacity = "1";
        print_keys(ev);
        print_keys(ev.target);
        print_keys(ev.dataTransfer);

        print_keys(ev.toElement);
        
        var data = ev.dataTransfer.getData("Text");
        Editor.log("dragDrop!!!!!!!!!!!!!!!!!!!" + ev.target._uuid + data);
    },
    tryExchangeItem: function(sourceItem, changeItem) {
        if (Editor.PolymerUtils.isSelfOrAncient(sourceItem, changeItem) || Editor.PolymerUtils.isSelfOrAncient(changeItem, sourceItem)) {
            return;
        }
    },
    newEntry: function (entry) {
      var item = document.createElement('td-tree-item');
      item.draggable = true;
      item['ondragstart'] = this.dragStart;
      item['ondragend'] = this.dragEnd;
      item['ondragenter'] = this.dragEnter;
      item['ondragover'] = this.dragOver;
      item['ondragleave'] = this.dragLeave;
      item['ondrop'] = this.dragDrop;
      item.name = entry.name;
      return item;
    },

    messages: {
      
    },

  });

})();
