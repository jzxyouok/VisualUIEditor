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

    newEntry: function (entry) {
      var item = document.createElement('td-tree-item');
      item.name = entry.name;
      return item;
    },

    messages: {
      
    },

  });

})();
